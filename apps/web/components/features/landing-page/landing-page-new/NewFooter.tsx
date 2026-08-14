"use client";
import { useState, useEffect } from "react";

import Image from "next/image";
import Link from "next/link";
import {
  FaLinkedin,
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

export default function NewFooter() {
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
    ],
    company: [
      { label: "About Kindora", href: "/about" },
      { label: "Impact Stories", href: "#" },
      { label: "Our Teams", href: "#" },
    ],
    contact_us: [
      { label: "kindora@uts.edu.au", href: "mailto:kindora@uts.edu.au" },
      { label: "Broadway Ultimo, NSW 2007", href: "https://www.uts.edu.au/" },
    ],
  };

  const [description, setDescription] = useState("");

  useEffect(() => {
    setDescription(
      "Kindora is a global platform dedicated to bringing meaningful positive change through social impact initiatives. We empower causes and volunteers to build sustainable social change through seamless collaboration."
    );
  }, []);

  return (
    <footer className="bg-[#F5F5F5]">
      <div className="container max-w-[1170px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-[30px] border-b border-[#E9EAEB] pb-6">
          {/* Logo and Description */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-5">
            <Link href="/" prefetch={false} className="flex items-center">
              <Image
                src="/images/logos/kindora-logo.png"
                alt="Kindora Logo"
                width={105}
                height={48}
                className="w-[85px] sm:w-[105px] h-[40px] sm:h-[48px] object-contain"
                priority
              />
            </Link>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mt-4 sm:mt-6">
              <p className="text-base text-[#414651] max-w-full sm:max-w-[669px]">
                {description}
              </p>
              {/* Social Media Icons */}
              <div className="flex items-center sm:items-end space-x-3 sm:space-x-4 flex-shrink-0">
                <Link
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2563EB] hover:opacity-80 transition-opacity p-2 sm:p-3"
                  aria-label="Twitter"
                >
                  <FaTwitter className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
                <Link
                  href="https://www.instagram.com/aus_leap?igsh=cmxsc3lhZXphcmZu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2563EB] hover:opacity-80 transition-opacity p-2 sm:p-3"
                  aria-label="Instagram"
                >
                  <FaInstagram className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
                <Link
                  href="https://www.youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2563EB] hover:opacity-80 transition-opacity p-2 sm:p-3"
                  aria-label="YouTube"
                >
                  <FaYoutube className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
                <Link
                  href="https://www.linkedin.com/company/kindora/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2563EB] hover:opacity-80 transition-opacity p-2 sm:p-3"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
                <Link
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2563EB] hover:opacity-80 transition-opacity p-2 sm:p-3"
                  aria-label="Facebook"
                >
                  <FaFacebook className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Menu Column */}
          <div>
            <h3 className="text-base text-[#414651] mb-3 sm:mb-4 font-semibold">Menu</h3>
            <ul className="space-y-2">
              {footerLinks.menu.map((link, index) => (
                <li key={`menu-${link.label}-${index}`}>
                  <Link
                    href={link.href}
                    className="text-sm sm:text-base text-[#414651] hover:text-[#2563EB] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="text-base text-[#414651] mb-3 sm:mb-4 font-semibold">
              Resources
            </h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link, index) => (
                <li key={`resources-${link.label}-${index}`}>
                  <Link
                    href={link.href}
                    className="text-sm sm:text-base text-[#414651] hover:text-[#2563EB] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Partners Column */}
          <div>
            <h3 className="text-base text-[#414651] mb-3 sm:mb-4 font-semibold">
              Partners
            </h3>
            <ul className="space-y-2">
              {footerLinks.partners.map((link, index) => (
                <li key={`partners-${link.label}-${index}`}>
                  <Link
                    href={link.href}
                    className="text-sm sm:text-base text-[#414651] hover:text-[#2563EB] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-base text-[#414651] mb-3 sm:mb-4 font-semibold">
              Company
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={`company-${link.label}-${index}`}>
                  <Link
                    href={link.href}
                    className="text-sm sm:text-base text-[#414651] hover:text-[#2563EB] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-base text-[#414651] mb-3 sm:mb-4 font-semibold">
              Contact Us
            </h3>
            <ul className="space-y-2">
              {footerLinks.contact_us.map((link, index) => (
                <li key={`company-${link.label}-${index}`}>
                  <Link
                    href={link.href}
                    className="text-sm sm:text-base text-[#414651] hover:text-[#2563EB] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 sm:pt-6">
          <div className="flex text-sm sm:text-base text-[#717680] flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p>Copyright © 2026 Kindora</p>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <Link
                href="#"
                className="hover:text-[#2563EB] transition-colors text-center sm:text-left"
              >
                Terms & Conditions
              </Link>
              <Link
                href="#"
                className="hover:text-[#2563EB] transition-colors text-center sm:text-left"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
