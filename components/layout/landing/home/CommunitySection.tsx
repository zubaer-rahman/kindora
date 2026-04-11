"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import "swiper/css";
import { trpc } from "@/utils/trpc";

const CARD_BG_COLORS = [
  "bg-[#8FB8F2]",
  "bg-[#FFDA85]",
  "bg-[#FF9A6A]",
  "bg-[#8C8AFF]",
  "bg-[#B78CFF]",
  "bg-purple-200",
];

const FALLBACK_PLACEHOLDERS = [
  { name: "Shirly Safana", role: "Outreach Coordinator", image: "/images/new-landing-hero/slide-images/people_1.png" },
  { name: "Mallya Farma Aulianisya", role: "Logistics Coordinator", image: "/images/new-landing-hero/slide-images/people_2.png" },
  { name: "Valentino Michael", role: "Volunteer Engagement Lead", image: "/images/new-landing-hero/slide-images/people_3.png" },
  { name: "Isabella Cotrunnada", role: "Communications Specialist", image: "/images/new-landing-hero/slide-images/people_4.png" },
  { name: "Yehezkiel Ex", role: "Event Planner", image: "/images/new-landing-hero/slide-images/people_5.png" },
];

const DEFAULT_AVATAR = "/images/new-landing-hero/slide-images/people_1.png";

export default function CommunitySection() {
  const { data: mentors, isLoading, error } = trpc.mentorProfile.getPublicMentors.useQuery(
    undefined,
    { staleTime: 60 * 1000 }
  );

  if (error) {
    console.error("CommunitySection Query Error:", error);
  }

  const displayList = (() => {
    if (isLoading || !mentors) {
      return FALLBACK_PLACEHOLDERS.map((p, i) => ({
        ...p,
        id: null as string | null,
        bgColor: CARD_BG_COLORS[i % CARD_BG_COLORS.length],
      }));
    }

    const realMentors = mentors.map((m, i) => ({
      id: m.id,
      name: m.name,
      role: m.role, // role is already formatted as "Bio" or similar in the backend usually, but let's check
      bgColor: CARD_BG_COLORS[i % CARD_BG_COLORS.length],
      image: m.image || DEFAULT_AVATAR,
    }));

    // If we have 5 or more real mentors, just show them
    if (realMentors.length >= 5) {
      return realMentors;
    }

    // Otherwise, fill the rest with placeholders to make it 5
    const neededDummies = 5 - realMentors.length;
    const dummyMentors = FALLBACK_PLACEHOLDERS.slice(0, neededDummies).map((p, i) => ({
      ...p,
      id: null as string | null,
      bgColor: CARD_BG_COLORS[(realMentors.length + i) % CARD_BG_COLORS.length],
    }));

    return [...realMentors, ...dummyMentors];
  })();

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="container max-w-[1440px] mx-auto px-4">
        <div className="flex flex-col items-center justify-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-[40px] text-center font-semibold leading-tight text-[#0A0D12] mb-4 max-w-[674px]">
            Meet the People Powering Our Community
          </h2>
          <p className="text-base sm:text-lg text-[#414651] max-w-[700px] mx-auto text-center leading-relaxed">
            Our mentors and volunteers bring passion, skills, and heart to everything we do. From mentoring and logistics to events and outreach, they make real impact every day.
          </p>
        </div>

        <div className="w-full">
          {isLoading ? (
            <div className="flex gap-5 overflow-hidden px-4 md:px-0 [&_.swiper-wrapper]:!ml-[-140px] md:[&_.swiper-wrapper]:!ml-[-169px]">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[350px] md:h-[418px] w-[280px] md:w-[338px] flex-shrink-0 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <Swiper
              spaceBetween={20}
              slidesPerView="auto"
              loop={displayList.length > 1}
              className="!pb-4 [&_.swiper-wrapper]:!ml-[-140px] md:[&_.swiper-wrapper]:!ml-[-169px]"
            >
              {displayList.map((person, index) => {
                const card = (
                  <div className="relative h-[350px] md:h-[418px] w-full rounded-2xl overflow-hidden group hover:shadow-lg transition-shadow cursor-pointer">
                    <div className={`${person.bgColor} h-full w-full relative`}>
                      <Image
                        src={person.image}
                        alt={person.name}
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 768px) 280px, 338px"
                        unoptimized={typeof person.image === "string" && person.image.startsWith("http")}
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                      <div className="bg-[#FFFFFF99] backdrop-blur-2xl rounded-lg py-2 px-4 md:py-3 md:px-5">
                        <h3 className="font-medium text-[#252B37] text-lg md:text-[22px]">
                          {person.name}
                        </h3>
                        <p className="text-sm md:text-lg text-[#717680]">{person.role}</p>
                      </div>
                    </div>
                  </div>
                );
                return (
                  <SwiperSlide key={`${person.name}-${index}`} className="!w-[280px] md:!w-[338px]">
                    {"id" in person && person.id ? (
                      <Link href={`/mentors/${person.id}`} className="block">
                        {card}
                      </Link>
                    ) : (
                      card
                    )}
                  </SwiperSlide>
                );
              })}
            </Swiper>
          )}
        </div>
      </div>
    </section>
  );
}

