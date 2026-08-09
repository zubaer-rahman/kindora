"use client";

import WhyKindora2 from "@/components/layout/landing/about/WhyKindora2";
import AboutHero from "../../../components/layout/landing/about/AboutHero";
import VisionMission from "../../../components/layout/landing/about/VisionMission";
import WhyKindora from "../../../components/layout/landing/about/WhyKindora";
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
