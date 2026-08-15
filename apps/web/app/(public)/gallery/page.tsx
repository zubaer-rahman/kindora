"use client";

import GalleryGrid from "@/components/features/landing-page/gallery/GalleryGrid";
import GalleryHero from "@/components/features/landing-page/gallery/GalleryHero";
import PublicLayout from "@/components/layout/PublicLayout";

export default function GalleryPage() {
  return (
    <PublicLayout>
      <GalleryHero />
      <GalleryGrid />
    </PublicLayout>
  );
}
