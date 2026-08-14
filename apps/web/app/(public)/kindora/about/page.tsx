"use client";

import HeroSection from "@/components/features/landing-page/kindora/about/HeroSection";
import WhatIsKINDORA from "@/components/features/landing-page/kindora/about/WhatIsKINDORA";
import ProgramBenefits from "@/components/features/landing-page/kindora/about/ProgramBenefits";
import RegistrationBannerNew from "@/components/features/landing-page/home/RegistrationBannerNew";
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
