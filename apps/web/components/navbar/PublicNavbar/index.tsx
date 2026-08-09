"use client";

import Link from "next/link";
import KindoraLogo from "@/components/common/KindoraLogo";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { MobileMenu } from "@/components/navbar/MobileMenu";

export default function PublicNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const mobileMenu = document.getElementById("mobile-menu");
      const hamburgerButton = document.getElementById("hamburger-button");

      if (
        mobileMenu &&
        hamburgerButton &&
        !mobileMenu.contains(event.target as Node) &&
        !hamburgerButton.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { label: "About", href: "/about" },
    { label: "Gallery", href: "/kindora/gallery" },
    { label: "FAQ", href: "/faq" },
    { label: "Opportunities", href: "/opportunities" },
    { label: "Volunteers", href: "/volunteers" },
  ];

  return (
    <>
      <nav className="flex justify-center h-[80px] relative border-b border-gray-200">
        <div className="w-full max-w-[1280px] flex items-center justify-between relative z-10 px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <KindoraLogo />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <Button
                asChild
                className="bg-transparent text-base hover:bg-transparent text-muted-foreground hover:text-primary hover:underline cursor-pointer"
              >
                <Link href="/login">Log in</Link>
              </Button>
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 h-[49px] rounded-full px-8 text-white cursor-pointer shadow-lg shadow-primary/20"
              >
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              id="hamburger-button"
              className="p-2 rounded-md text-gray-900 hover:bg-white/20 md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        isAuthPath={false}
        isProtectedPath={false}
        session={null}
        totalUnreadCount={0}
      />
    </>
  );
}
