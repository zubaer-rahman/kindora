"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import OpportunityDrawer from "./OpportunityDrawer";

interface OpportunityDrawerContextType {
  openDrawer: (opportunityId: string) => void;
  closeDrawer: () => void;
  isOpen: boolean;
  opportunityId: string | null;
}

const OpportunityDrawerContext = createContext<
  OpportunityDrawerContextType | undefined
>(undefined);

export function OpportunityDrawerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [opportunityId, setOpportunityId] = useState<string | null>(null);
  const pathname = usePathname();

  // Handle URL changes (Deep Linking & Back/Forward buttons)
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      // Match /details/[id] at the end of the path
      const detailsMatch = path.match(/\/details\/([^/?#]+)/);


      // Ignore if it's a full page details view (volunteer/organisation/profile) 
      // to prevent opening the opportunity drawer incorrectly
      if (
        path.includes('/volunteer/details/') ||
        path.includes('/organisation/details/') ||
        path.includes('/view-profile/')
      ) {
        setIsOpen(false);
        setOpportunityId(null);
        return;
      }

      if (detailsMatch) {
        const id = detailsMatch[1];
        setOpportunityId(id);
        setIsOpen(true);
      } else {
        setIsOpen(false);
        // Clear ID after animation
        setTimeout(() => setOpportunityId(null), 300);
      }
    };

    // Initial check
    handleUrlChange();

    // Listen for popstate (back/forward)
    window.addEventListener("popstate", handleUrlChange);
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, [pathname]);

  const openDrawer = (id: string) => {
    setOpportunityId(id);

    // Update URL without full page reload
    const currentPath = window.location.pathname;
    if (!currentPath.includes(`/details/${id}`)) {
      // Remove any existing details path first
      const basePath = currentPath.split('/details/')[0];

      // Construct _modalInfo similar to Upwork
      const modalInfo = JSON.stringify([{
        navType: "slider",
        title: "Opportunity Details",
        modalId: Date.now().toString()
      }]);

      const newPath = `${basePath}/details/${id}?pageTitle=Opportunity%20Details&_modalInfo=${encodeURIComponent(modalInfo)}`;
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
    if (currentPath.includes('/details/')) {
      const newPath = currentPath.split('/details/')[0];
      window.history.pushState({ ...window.history.state, as: newPath, url: newPath }, '', newPath);
    }

    setTimeout(() => setOpportunityId(null), 300);
  };

  return (
    <OpportunityDrawerContext.Provider
      value={{ openDrawer, closeDrawer, isOpen, opportunityId }}
    >
      {children}
      <OpportunityDrawer
        opportunityId={opportunityId}
        isOpen={isOpen}
        onClose={closeDrawer}
      />
    </OpportunityDrawerContext.Provider>
  );
}

export function useOpportunityDrawer() {
  const context = useContext(OpportunityDrawerContext);
  if (context === undefined) {
    throw new Error(
      "useOpportunityDrawer must be used within OpportunityDrawerProvider"
    );
  }
  return context;
}

