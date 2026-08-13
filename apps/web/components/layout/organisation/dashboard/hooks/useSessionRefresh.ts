import { useEffect } from "react";
import { useSession } from "next-auth/react";

export function useSessionRefresh() {
  const { update: updateSession } = useSession();

  useEffect(() => {
    if (typeof window === "undefined" || typeof updateSession !== "function") return;
    if (localStorage.getItem("shouldRefreshSession") === "true") {
      updateSession()
        .catch((err) => {
          console.warn("Session update failed on dashboard mount:", err);
        })
        .finally(() => {
          localStorage.removeItem("shouldRefreshSession");
        });
    }
  }, [updateSession]);
}
