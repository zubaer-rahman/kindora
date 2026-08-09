"use client";

import GalleryGrid from "@/components/layout/landing/kindora/gallery/GalleryGrid";
import GalleryHero from "@/components/layout/landing/kindora/gallery/GalleryHero";
import PublicLayout from "@/components/layout/PublicLayout";

export default function GalleryPage() {
  return (
    <PublicLayout>
      <GalleryHero />
      <GalleryGrid />
    </PublicLayout>
  );
}
