"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import MobileTabsSlider from "@/components/layout/shared/MobileTabsSlider";
import { motion, AnimatePresence } from "framer-motion";

type GalleryImage = {
  id: number;
  year: string;
  src: string;
  alt: string;
  description: string;
};

const galleryImages: GalleryImage[] = [
  ...Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    year: "2024",
    src: `/2024-${i + 1}.jpg`,
    alt: `Community Event 2024 - ${i + 1}`,
    description: "Empowering local communities through social impact and dedicated volunteering."
  })),
  ...Array.from({ length: 10 }, (_, i) => ({
    id: i + 11,
    year: "2023",
    src: `/2023-${i + 1}.jpg`,
    alt: `Community Event 2023 - ${i + 1}`,
    description: "Building sustainable networks of collaboration and support for non-profits."
  })),
  ...Array.from({ length: 10 }, (_, i) => ({
    id: i + 21,
    year: "2022",
    src: `/2022-${i + 1}.png`,
    alt: `Community Event 2022 - ${i + 1}`,
    description: "The foundations of impact: connecting volunteers with causes that matter."
  }))
];

export default function GalleryGrid() {
  const years = ["2024", "2023", "2022"];
  const [activeYear, setActiveYear] = useState(years[0]);

  const mobileTabs = years.map(year => ({
    label: year,
    value: year
  }));

  return (
    <section className="py-16 md:py-24 bg-muted relative overflow-hidden">
      <div className="container max-w-[1170px] mx-auto px-4 md:px-8">
        
        {/* Navigation Wrapper */}
        <div className="flex flex-col items-center mb-8 md:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-[40px] font-semibold text-foreground mb-4 tracking-tight">Browse by Year</h2>
            <div className="h-1.5 w-16 bg-primary rounded-full mx-auto" />
          </motion.div>

          {/* Mobile Tabs Slider */}
          <div className="md:hidden w-full mb-8">
            <MobileTabsSlider
              tabs={mobileTabs}
              activeTab={activeYear}
              onTabChange={setActiveYear}
            />
          </div>

          {/* Desktop Tabs */}
          <div className="hidden md:block">
            <Tabs
              value={activeYear}
              className="w-full"
              onValueChange={setActiveYear}
            >
              <TabsList className="bg-card/80 backdrop-blur-sm p-1.5 rounded-full h-auto gap-1 border border-border shadow-lg shadow-black/5">
                {years.map((year) => (
                  <TabsTrigger
                    key={year}
                    value={year}
                    className="py-3 px-14 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/25 data-[state=inactive]:text-muted-foreground hover:text-primary transition-all font-bold text-base border-0"
                  >
                    {year}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Tab Content with AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeYear}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
          >
            {galleryImages
              .filter((img) => img.year === activeYear)
              .map((image, idx) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, duration: 0.6 }}
                  className="group relative aspect-[4/5] rounded-3xl overflow-hidden shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-700 bg-card border-4 border-card"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0"
                  />
                  
                  {/* Refined Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-700 z-10" />
                  
                  {/* Corner Accent */}
                  <div className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  </div>

                  {/* Content on Hover */}
                  <div className="absolute inset-0 flex flex-col justify-end p-10 z-20 translate-y-6 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
                    <div className="space-y-4">
                      <div className="h-1 w-12 bg-primary rounded-full" />
                      <h4 className="text-white font-bold text-xl drop-shadow-md">
                        Community Moment
                      </h4>
                      <p className="text-white/80 text-sm font-medium leading-relaxed">
                        {image.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
