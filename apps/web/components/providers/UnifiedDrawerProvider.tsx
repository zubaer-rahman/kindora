"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import VolunteerDrawer from "@/components/features/volunteer/VolunteerDrawer";
import OrganizationDrawer from "@/components/features/organization/OrganizationDrawer";
import OpportunityDrawer from "@/components/features/opportunities/OpportunityDrawer";

export type DrawerType = "volunteer" | "organization" | "opportunity";

interface UnifiedDrawerContextType {
  openDrawer: (type: DrawerType, id: string) => void;
  closeDrawer: () => void;
  isOpen: boolean;
  activeType: DrawerType | null;
  activeId: string | null;
}

const UnifiedDrawerContext = createContext<UnifiedDrawerContextType | undefined>(undefined);

export function UnifiedDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeType, setActiveType] = useState<DrawerType | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const pathname = usePathname();

   useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      
       if (
        path.includes('/volunteer/details/') ||
        path.includes('/organisation/profile/') ||
        path.includes('/organisation/details/') ||
        path.includes('/volunteers/') || 
        path.includes('/organisations/') || 
        path.includes('/opportunities/')
      ) {
        setIsOpen(false);
        setActiveId(null);
        setActiveType(null);
        return;
      }

       const oppMatch = path.match(/\/details\/([^/?#]+)/);
       const orgMatch = path.match(/\/org-details\/([^/?#]+)/);

      if (oppMatch) {
        setActiveType("opportunity");
        setActiveId(oppMatch[1]);
        setIsOpen(true);
      } else if (orgMatch) {
        setActiveType("organization");
        setActiveId(orgMatch[1]);
        setIsOpen(true);
      } else {
        setIsOpen(false);
        setTimeout(() => {
          setActiveId(null);
          setActiveType(null);
        }, 300);
      }
    };

    handleUrlChange();
    window.addEventListener("popstate", handleUrlChange);
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, [pathname]);

  const openDrawer = (type: DrawerType, id: string) => {
    setActiveType(type);
    setActiveId(id);

     const currentPath = window.location.pathname;
    
    if (type === "opportunity" && !currentPath.includes(`/details/${id}`)) {
      const basePath = currentPath.split('/details/')[0];
      const modalInfo = JSON.stringify([{ navType: "slider", title: "Opportunity Details", modalId: Date.now().toString() }]);
      const newPath = `${basePath}/details/${id}?pageTitle=Opportunity%20Details&_modalInfo=${encodeURIComponent(modalInfo)}`;
      window.history.pushState({ ...window.history.state, as: newPath, url: newPath }, '', newPath);
    } else if (type === "organization" && !currentPath.includes(`/org-details/${id}`)) {
      const basePath = currentPath.split('/org-details/')[0];
      const modalInfo = JSON.stringify([{ navType: "slider", title: "Organization Details", modalId: Date.now().toString() }]);
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

     const currentPath = window.location.pathname;
    if (activeType === "opportunity" && currentPath.includes('/details/')) {
      const newPath = currentPath.split('/details/')[0];
      window.history.pushState({ ...window.history.state, as: newPath, url: newPath }, '', newPath);
    } else if (activeType === "organization" && currentPath.includes('/org-details/')) {
      const newPath = currentPath.split('/org-details/')[0];
      window.history.pushState({ ...window.history.state, as: newPath, url: newPath }, '', newPath);
    }

    setTimeout(() => {
      setActiveId(null);
      setActiveType(null);
    }, 300);
  };

  return (
    <UnifiedDrawerContext.Provider value={{ openDrawer, closeDrawer, isOpen, activeType, activeId }}>
      {children}
      {activeType === "volunteer" && (
        <VolunteerDrawer volunteerId={activeId} isOpen={isOpen} onClose={closeDrawer} />
      )}
      {activeType === "organization" && (
        <OrganizationDrawer organizationId={activeId} isOpen={isOpen} onClose={closeDrawer} />
      )}
      {activeType === "opportunity" && (
        <OpportunityDrawer opportunityId={activeId} isOpen={isOpen} onClose={closeDrawer} />
      )}
    </UnifiedDrawerContext.Provider>
  );
}

export function useUnifiedDrawer() {
  const context = useContext(UnifiedDrawerContext);
  if (context === undefined) {
    throw new Error("useUnifiedDrawer must be used within UnifiedDrawerProvider");
  }
  return context;
}
