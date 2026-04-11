"use client";
import { useState, useEffect } from "react";

import Link from "next/link";
import {
  FaLinkedin,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import KindoraLogo from "@/components/common/KindoraLogo";

interface NewFooterProps {
  containerClassName?: string;
  paddingClassName?: string;
}

export default function NewFooter({
  containerClassName = "max-w-[1170px] mx-auto",
  paddingClassName = "px-4 sm:px-6 lg:px-8",
}: NewFooterProps) {
  const footerLinks = {
    menu: [
      { label: "About", href: "/about" },
      { label: "Services", href: "#" },
      { label: "Donations", href: "#" },
      { label: "Testimonials", href: "#" },
      { label: "Volunteers", href: "/find-volunteer" },
    ],
    resources: [
      { label: "Company", href: "#" },
      { label: "Annual Reports", href: "#" },
      { label: "Volunteers", href: "/find-volunteer" },
      { label: "FAQs", href: "/faq" },
    ],
    partners: [
      { label: "Current Campaigns", href: "#" },
      { label: "Donate", href: "#" },
      { label: "Become A Partner", href: "#" },
      { label: "Blog", href: "#" },
    ],
    company: [
      { label: "About Kindora", href: "/about" },
      { label: "Impact Stories", href: "#" },
      { label: "Our Teams", href: "#" },
    ],
    contact_us: [
      { label: "info@kindora.org", href: "mailto:info@kindora.org" },
      { label: "(123) 456-7890", href: "tel:+11234567890" },
    ],
  };

  const [description, setDescription] = useState("");

  useEffect(() => {
    setDescription(
      "Kindora is a global platform dedicated to bringing meaningful positive change through social impact initiatives. We empower causes and volunteers to build sustainable social change through seamless collaboration."
    );
  }, []);

  return (
    <footer className="bg-secondary/50 border-t border-border mt-20">
      <div className={`py-16 ${paddingClassName} ${containerClassName}`}>
        <div className="flex flex-col lg:flex-row lg:justify-between gap-16 border-b border-border pb-16">
          {/* Logo & Description */}
          <div className="max-w-md">
            <KindoraLogo className="mb-8" />
            <p className="text-lg text-muted-foreground leading-relaxed">
              {description}
            </p>
            
            {/* Social Icons */}
            <div className="flex items-center gap-4 mt-8">
              {[
                { icon: FaTwitter, href: "#", label: "Twitter" },
                { icon: FaInstagram, href: "https://www.instagram.com/kindora", label: "Instagram" },
                { icon: FaYoutube, href: "#", label: "YouTube" },
                { icon: FaLinkedin, href: "https://www.linkedin.com/company/kindora/", label: "LinkedIn" },
                { icon: FaFacebook, href: "#", label: "Facebook" },
              ].map((social, idx) => (
                <Link
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-border text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8">
            {Object.entries({
              Platform: footerLinks.menu,
              Resources: footerLinks.resources,
              Company: footerLinks.company,
              Contact: footerLinks.contact_us
            }).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-6">
                  {title}
                </h3>
                <ul className="space-y-4">
                  {links.map((link, idx) => (
                    <li key={idx}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-primary transition-colors text-base"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Cookies</Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Kindora. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
