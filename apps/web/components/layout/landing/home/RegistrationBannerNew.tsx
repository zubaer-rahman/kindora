"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function RegistrationBannerNew() {
  return (
    <section className="py-16 md:py-24 lg:py-32 bg-white">
      <div className="container max-w-[1170px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Side - Text Content */}
          <div className="text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-[40px] font-semibold text-[#0A0D12] leading-tight md:leading-[48px]">
              KINDORA 2025 registration has just opened!
            </h2>
            <p className="text-base md:text-lg text-[#414651] py-6 md:py-8">
              We're here to help. If you have any questions about volunteering,
              donations, or our programs, please feel free to reach out. We look
              forward to hearing from you!
            </p>
            <Button className="bg-[#1570EF] cursor-pointer rounded-full h-[49px] hover:bg-[#1d4ed8] text-[#F5FAFF] px-[30px] py-[15px] text-base md:text-lg w-full sm:w-auto">
              Join now
            </Button>
          </div>

          <div className="relative w-full aspect-[642/428]">
            <Image
              src="/images/new-landing/register_now.png"
              alt="Registration"
              fill
              className="object-contain rounded-2xl md:rounded-3xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
