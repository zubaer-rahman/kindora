"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export function CookieGuard() {
  useEffect(() => {
    const clearLargeCookies = () => {
      const cookies = document.cookie.split(";");
      let foundLarge = false;

      for (const cookie of cookies) {
        const [name, value] = cookie.split("=").map((s) => s.trim());

        if (name.includes("next-auth") && value && value.length > 3500) {
          console.warn(
            `Found oversized cookie: ${name} (${value.length} chars). Clearing...`,
          );

          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          foundLarge = true;
        }
      }

      if (foundLarge) {
        signOut({ redirect: false }).then(() => {
          window.location.reload();
        });
      }
    };

    clearLargeCookies();

    window.addEventListener("focus", clearLargeCookies);
    return () => window.removeEventListener("focus", clearLargeCookies);
  }, []);

  return null;
}
