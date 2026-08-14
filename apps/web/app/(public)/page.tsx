"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import {
  HeroSectionNew,
  PartnersSection,
  PopularSearchSection,
  LatestOpportunitiesSection,
  CommunitySection,
  ProgramBenefitsSection,
  ReviewsSection,
  BlogSection,
  RegistrationBannerNew,
  ShowcaseVideoSection
} from "@/components/features/landing-page/home";
import Loading from "@/app/loading";
import PublicLayout from "@/components/layout/PublicLayout";

export default function HomePage() {
  const router = useRouter();
  const { isLoading, isAuthenticated, session } = useAuthCheck();

  useEffect(() => {
    if (!isLoading && isAuthenticated && session?.user?.role) {
      const role = session.user.role.toLowerCase();
      let destination = "/organisation/dashboard";
      if (role === "volunteer") {
        destination = "/find-opportunity";
      } else if (role === "mentor") {
        destination = "/mentor/dashboard";
      }
      router.replace(destination);
    }
  }, [isLoading, isAuthenticated, session, router]);

  if (isLoading) {
    return (
      <Loading size="medium">
        <p className="text-gray-600 mt-2">Wait a sec...</p>
      </Loading>
    );
  }

   if (isAuthenticated) return null;

  return (
    <PublicLayout>
      <HeroSectionNew />
      <PartnersSection />
      <ShowcaseVideoSection />
      <PopularSearchSection />
      <LatestOpportunitiesSection />
      <CommunitySection />
      <ProgramBenefitsSection />
      <ReviewsSection />
      <BlogSection />
      <RegistrationBannerNew />
    </PublicLayout>
  );
}
