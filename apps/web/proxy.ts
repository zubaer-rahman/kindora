import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/options";

const PUBLIC_PATHS = [
  "/",
  "/about",
  "/faq",
  "/opportunities",
  "/volunteers",
  "/gallery",
  "/login",
  "/signup",
  "/forgot-password",
  "/api/auth",
];

const ROLE_PREFIXES: Record<string, string[]> = {
  volunteer: ["/find-opportunity", "/volunteer"],
  mentor: ["/find-volunteer", "/mentor", "/search/volunteers"],
  organisation: ["/organisation", "/organization", "/search/volunteers", "/find-volunteer"],
  system_admin: ["/system-admin"],
};

function getRolesFromPath(pathname: string): string[] {
  const allowedRoles: string[] = [];
  for (const [role, prefixes] of Object.entries(ROLE_PREFIXES)) {
    if (prefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"))) {
      allowedRoles.push(role);
    }
  }
  return allowedRoles;
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getServerSession(authOptions);
  const rawUserRole = (session?.user as any)?.role;
  const userRole =
    rawUserRole === "organization" || rawUserRole === "admin" ? "organisation" : rawUserRole;

  if (pathname.startsWith("/organization/") || pathname === "/organization") {
    return NextResponse.redirect(new URL(pathname.replace(/^\/organization/, "/organisation"), request.url));
  }

  if (pathname === "/volunteer/dashboard") {
    return NextResponse.redirect(new URL("/find-opportunity/most-recent", request.url));
  }

  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (isPublic) {
    if (userRole && (pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password")) {
      if (userRole === "volunteer") {
        return NextResponse.redirect(new URL("/find-opportunity/most-recent", request.url));
      }
      const role = userRole === "system_admin" ? "system-admin" : userRole;
      return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
    }
    return NextResponse.next();
  }

  const allowedRoles = getRolesFromPath(pathname);

  if (allowedRoles.length === 0) {
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!allowedRoles.includes(userRole)) {
    const role = userRole === "system_admin" ? "system-admin" : userRole;
    return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|public).*)"],
};
