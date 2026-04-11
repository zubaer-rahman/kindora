"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
// import { BsTelephone } from 'react-icons/bs';
import { AiOutlineInstagram } from "react-icons/ai";
import { FaLinkedin } from "react-icons/fa";

export default function UpdatedFooter() {
  const path = usePathname();
  const hiddenPaths = ["/opportunity/create", "/organisation/opportunities", "/messaging", "/messages"];
  const isHidden = hiddenPaths.some(hiddenPath => path?.includes(hiddenPath));
  return (
    <footer className={cn("bg-[#F5F7FA] border-t py-12", isHidden && "hidden")}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact us section */}
          <div className="md:text-left text-center">
            <h3 className="text-[#2563EB] font-semibold text-lg mb-4">
              Contact us
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Broadway Ultimo, NSW 2007,</p>
              <p>University of Technology Sydney</p>
              <p>Australia</p>
            </div>
          </div>

          {/* Find us section */}
          <div className="md:text-right text-center">
            <h3 className="text-[#2563EB] font-semibold text-lg mb-4">
              Find us
            </h3>
            <div className="flex flex-col md:items-end items-center gap-4">
              <div className="flex gap-4">
                {/* <Link 
                  href="tel:+61295142000"
                  className="text-gray-400 hover:text-[#2563EB] transition-colors"
                >
                  <BsTelephone size={24} />
                </Link> */}
                <Link
                  href="https://www.instagram.com/aus_leap?igsh=cmxsc3lhZXphcmZu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#2563EB] transition-colors"
                >
                  <AiOutlineInstagram size={24} />
                </Link>
                <Link
                  href="https://www.linkedin.com/company/kindora/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#2563EB] transition-colors"
                >
                  <FaLinkedin size={24} />
                </Link>
              </div>
              <Link
                href="mailto:kindora@uts.edu.au"
                className="text-sm text-gray-600 hover:text-[#2563EB] transition-colors"
              >
                kindora@uts.edu.au
              </Link>
            </div>
          </div>
        </div>

        <div className="w-full h-[1px] bg-gray-200 my-8"></div>

        <div className="text-center text-xs text-gray-400">
          © Kindora 2025
        </div>
      </div>
    </footer>
  );
}
