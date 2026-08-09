import {
  AUTH_PATHS,
  PROTECTED_PATHS,
  PUBLIC_NAV_OPTIONS,
} from "@/utils/constants/navigation";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function TopPublicNavbar() {
  const pathname = usePathname();
  const isAuthPath = AUTH_PATHS.some((path) => pathname?.includes(path));
  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    pathname?.includes(path)
  );
  const isResetPasswordPath = pathname?.endsWith("reset-password");
  return (
    <>
      {!isAuthPath && !isProtectedPath && !isResetPasswordPath && (
        <div className="bg-gradient-to-r from-blue-500 via-blue-500 to-blue-500 text-white py-1 px-4">
          <div className="container max-w-[1170px] mx-auto flex justify-end space-x-4 text-sm">
            {PUBLIC_NAV_OPTIONS.map((option, index) => (
              <Link key={index} href={option.href} className={option.className}>
                {option.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
