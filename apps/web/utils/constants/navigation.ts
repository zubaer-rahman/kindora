import { NavItem } from "@/types/navigation";

export const PUBLIC_NAV_OPTIONS: NavItem[] = [
  {
    label: "Volunteer sign up",
    href: "/signup",
    className: "hover:text-primary",
  },
  {
    label: "Organisation sign up",
    href: "/signup?role=organisation",
    className: "hover:text-primary",
  },
  {
    label: "Log in",
    href: "/login",
    className: "hover:text-primary",
  },
];

export const STATIC_LINKS: NavItem[] = [
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Gallery",
    href: "/kindora/gallery",
  },
  {
    label: "FAQ",
    href: "/faq",
  },
];

export const PROTECTED_PATHS = [
  "/organisation",
  "/volunteer",
  "/mentor",
  "/profile",
  "/settings",
  "/messages",
  "/search",
  "/find-opportunity",
  "/find-volunteer",
  "/find-organisation",
];

export const AUTH_PATHS = ["/login", "/signup", "/reset-password"];

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "organization" | "volunteer" | "mentor" | "admin";
  image?: string;
}
