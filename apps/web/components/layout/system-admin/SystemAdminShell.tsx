"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ProtectedNavbar from "@/components/navbar/ProtectedNavbar";
import Loading from "@/app/loading";
import DashboardSidebar from "@/components/layout/system-admin/DashboardSidebar";
import { Menu, X } from "lucide-react";

export default function SystemAdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const redirected = useRef(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userEmail: string = (session?.user as any)?.email ?? "";
  const userRole: string = (session?.user as any)?.role ?? "";
  const isSystemAdmin =
    status === "authenticated" &&
    userRole === "system_admin" &&
    userEmail.endsWith(".kindora.com");

  useEffect(() => {
    if (status === "loading" || redirected.current) return;
    if (status === "unauthenticated" || (status === "authenticated" && !isSystemAdmin)) {
      redirected.current = true;
      router.replace("/login");
    }
  }, [status, isSystemAdmin, router]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  if (status === "loading") {
    return (
      <Loading size="medium">
        <p className="text-gray-600 mt-2">Checking access…</p>
      </Loading>
    );
  }

  if (!isSystemAdmin) return null;

  return (
    <Fragment>
      <ProtectedNavbar />

      <div className="flex flex-col bg-background" style={{ height: "calc(100dvh - 72px)" }}>
        <div className="flex flex-row flex-1 overflow-hidden w-full h-full">
          <aside className="hidden lg:flex w-[280px] xl:w-[320px] shrink-0 flex-col overflow-y-auto h-full px-4 py-4">
            <DashboardSidebar />
          </aside>

          <main className="flex-1 min-w-0 overflow-hidden flex flex-col px-4 py-4">
            <div className="lg:hidden flex items-center gap-3 mb-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-md hover:bg-accent transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <span className="font-semibold text-foreground">Admin Menu</span>
            </div>
            {children}
          </main>
        </div>
      </div>

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="fixed top-0 left-0 h-full w-[280px] bg-background border-r border-border z-50 lg:hidden transform transition-transform duration-300 ease-in-out overflow-y-auto">
            <div className="p-4 flex justify-end">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-md hover:bg-accent transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-4 pb-6">
              <DashboardSidebar />
            </div>
          </aside>
        </>
      )}
    </Fragment>
  );
}
