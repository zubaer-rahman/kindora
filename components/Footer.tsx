'use client';

import Link from 'next/link';
import { Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#F5F7FA] border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Recruit volunteer section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#2563EB]">Recruit volunteer</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-gray-400 ">
                KINDORA volunteer report
                </span>
              </li>
              <li>
                <span className="text-sm text-gray-400 ">
                  Help & support
                </span>
              </li>
              <li>
                <span className="text-sm text-gray-400 ">
                  Terms of Policies
                </span>
              </li>
            </ul>
          </div>

          {/* Categories section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#2563EB]">Categories</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-gray-400 ">
                  FAQ&apos;s
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-sm text-gray-400 ">
                  Community service
                </span>
                <Link
                  href="/signup?role=volunteer"
                  className="px-4 py-2 bg-[#2563EB] text-white rounded-full hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  Join us!
                </Link>
              </li>
              <li>
                <span className="text-sm text-gray-400 ">
                  Disable Services
                </span>
              </li>
              <li>
                <span className="text-sm text-gray-400 ">
                  Young people
                </span>
              </li>
            </ul>
          </div>

          {/* Contact us section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#2563EB]">Contact us</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>+61 2 9514 2000</p>
              <p>15 Broadway, Ultimo, NSW 2007,</p>
              <p>University of Technology Sydney</p>
              <p>PO Box 123, Ultimo NSW 2007 Australia</p>
            </div>
          </div>

          {/* Find us section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#2563EB]">Find us</h3>
            <div className="flex flex-col space-y-4">
              <div className="flex space-x-4">
                <a 
                  href="https://www.instagram.com/aus_leap?igsh=cmxsc3lhZXphcmZu" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#2563EB] transition-colors"
                >
                  <Instagram className="h-6 w-6" />
                </a>
                <a 
                  href="https://www.linkedin.com/company/kindora/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#2563EB] transition-colors"
                >
                  <Linkedin className="h-6 w-6" />
                </a>
              </div>
              <a 
                href="mailto:kindora@uts.edu.au"
                className="text-sm text-gray-400 hover:text-[#2563EB] transition-colors"
              >
                kindora@uts.edu.au
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-500">
          © Copyright KINDORA Volunteer - Category: Australian University - ABN: 77 257 686 961 - {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}