"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

/**
 * CookieGuard automatically detects and clears oversized NextAuth session cookies
 * that would otherwise cause "431 Request Header Fields Too Large" errors.
 */
export function CookieGuard() {
    useEffect(() => {
        const clearLargeCookies = () => {
            const cookies = document.cookie.split(";");
            let foundLarge = false;

            for (const cookie of cookies) {
                const [name, value] = cookie.split("=").map((s) => s.trim());

                // If a single cookie (or chunk) is > 3.5KB, it's dangerously close to header limits
                // especially when combined with other headers.
                if (name.includes("next-auth") && value && value.length > 3500) {
                    console.warn(`Found oversized cookie: ${name} (${value.length} chars). Clearing...`);

                    // Clear the cookie by setting expiry in the past
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                    foundLarge = true;
                }
            }

            if (foundLarge) {
                // If we found and cleared large cookies, trigger a signout to be safe and reload
                signOut({ redirect: false }).then(() => {
                    window.location.reload();
                });
            }
        };

        // Run on mount
        clearLargeCookies();

        // Also run when the window recovers focus, in case user was messing with uploads in another tab
        window.addEventListener("focus", clearLargeCookies);
        return () => window.removeEventListener("focus", clearLargeCookies);
    }, []);

    return null;
}
