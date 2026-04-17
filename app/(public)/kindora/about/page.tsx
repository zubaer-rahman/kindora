"use client";

import HeroSection from "../../../../components/layout/landing/kindora/about/HeroSection";
import WhatIsKINDORA from "../../../../components/layout/landing/kindora/about/WhatIsKINDORA";
import ProgramBenefits from "../../../../components/layout/landing/kindora/about/ProgramBenefits";
import RegistrationBannerNew from "../../../../components/layout/landing/home/RegistrationBannerNew";
import PublicLayout from "@/components/layout/PublicLayout";

export default function KINDORAAboutPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-white">
        <HeroSection />
        <WhatIsKINDORA />
        <ProgramBenefits />
        <RegistrationBannerNew />
      </div>
    </PublicLayout>
  );
}
