"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import OrganizationDrawer from "./OrganizationDrawer";

interface OrganizationDrawerContextType {
  openDrawer: (organizationId: string) => void;
  closeDrawer: () => void;
  isOpen: boolean;
  organizationId: string | null;
}

const OrganizationDrawerContext = createContext<
  OrganizationDrawerContextType | undefined
>(undefined);

export function OrganizationDrawerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const pathname = usePathname();

  // Handle URL changes (Deep Linking & Back/Forward buttons)
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      // Match /org-details/[id] at the end of the path
      const detailsMatch = path.match(/\/org-details\/([^/?#]+)/);

      // Ignore if it's a full page details view to prevent opening incorrectly
      if (
        path.includes('/organisation/profile/') ||
        path.includes('/view-profile/')
      ) {
        setIsOpen(false);
        setOrganizationId(null);
        return;
      }

      if (detailsMatch) {
        const id = detailsMatch[1];
        setOrganizationId(id);
        setIsOpen(true);
      } else {
        setIsOpen(false);
        // Clear ID after animation
        setTimeout(() => setOrganizationId(null), 300);
      }
    };

    // Initial check
    handleUrlChange();

    // Listen for popstate (back/forward)
    window.addEventListener("popstate", handleUrlChange);
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, [pathname]);

  const openDrawer = (id: string) => {
    setOrganizationId(id);

    // Update URL without full page reload
    const currentPath = window.location.pathname;
    if (!currentPath.includes(`/org-details/${id}`)) {
      // Remove any existing details path first
      const basePath = currentPath.split('/org-details/')[0];

      // Construct _modalInfo similar to existing pattern
      const modalInfo = JSON.stringify([{
        navType: "slider",
        title: "Organization Details",
        modalId: Date.now().toString()
      }]);

      const newPath = `${basePath}/org-details/${id}?pageTitle=Organization%20Details&_modalInfo=${encodeURIComponent(modalInfo)}`;
      window.history.pushState({ ...window.history.state, as: newPath, url: newPath }, '', newPath);
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsOpen(true);
      });
    });
  };

  const closeDrawer = () => {
    setIsOpen(false);

    // Restore URL
    const currentPath = window.location.pathname;
    if (currentPath.includes('/org-details/')) {
      const newPath = currentPath.split('/org-details/')[0];
      window.history.pushState({ ...window.history.state, as: newPath, url: newPath }, '', newPath);
    }

    setTimeout(() => setOrganizationId(null), 300);
  };

  return (
    <OrganizationDrawerContext.Provider
      value={{ openDrawer, closeDrawer, isOpen, organizationId }}
    >
      {children}
      <OrganizationDrawer
        organizationId={organizationId}
        isOpen={isOpen}
        onClose={closeDrawer}
      />
    </OrganizationDrawerContext.Provider>
  );
}

export function useOrganizationDrawer() {
  const context = useContext(OrganizationDrawerContext);
  if (context === undefined) {
    throw new Error(
      "useOrganizationDrawer must be used within OrganizationDrawerProvider"
    );
  }
  return context;
}
