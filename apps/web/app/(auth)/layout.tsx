"use client";

import AuthNavbar from "@/components/navbar/AuthNavbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthNavbar />
      <div className="px-4 md:px-0">{children}</div>
    </>
  );
}
