"use client";

import WhyKindora2 from "@/components/features/landing-page/about/WhyKindora2";
import AboutHero from "@/components/features/landing-page/about/AboutHero";
import VisionMission from "@/components/features/landing-page/about/VisionMission";
import WhyKindora from "@/components/features/landing-page/about/WhyKindora";
import PublicLayout from "@/components/layout/PublicLayout";

export default function AboutPage() {
  return (
    <PublicLayout>
      <AboutHero />
      <VisionMission />
      <WhyKindora />
      <WhyKindora2 />
    </PublicLayout>
  );
}
