"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProgramBenefitsSection() {
  const benefits = [
    {
      title: "See the Program",
      description:
        "Lorem ipsum dolor sit amet consectetur. Adipiscing eu dignissim congue magna tellus sit. Fermentum aenean pellentesque magna.",

      showButton: true,
      isLarge: true,
      noImage: true,
      despWidth: "max-w-[576px]",
    },
    {
      title: "Learn about Aussie culture",
      description: "Understand Australian language and workplace practices.",
      image: {
        url: "/svgs/aussie-culture.svg",
        width: 228,
        height: 217.728,
      },
      showButton: false,
      isLarge: false,
      despWidth: "max-w-[335px]",
    },
    {
      title: "Make Friends",
      description:
        "Create long-lasting personal connections with like-minded people.",
      image: {
        url: "/images/new-landing/make_friends.png",
        width: 324.623,
        height: 241,
      },
      showButton: false,
      isLarge: false,
    },
    {
      title: "Build Professional Networks",
      description:
        "Acquire valuable industry connections across universities and local communities.",
      image: {
        url: "/images/new-landing/pro_networks.png",
        width: 260.763,
        height: 180,
      },
      isLarge: true,
      centerContent: true,
      despWidth: "max-w-[453px]",
    },
    {
      title: "Create Broader Social Impact",
      description: "Create meaningful change in the community.",
      image: {
        url: "/images/new-landing/social_impact.png",
        width: 316.409,
        height: 194.503,
      },
      showButton: false,
      isLarge: false,
    },

    {
      title: "Improve Employability",
      description:
        "Build essential soft skills that employers look for in every field.",
      image: {
        url: "/svgs/improve-employability.svg",
        width: 234.63,
        height: 197,
      },
      showButton: false,
      isLarge: false,
    },
    {
      title: "Receive Official Certification",
      description:
        "Validate your skills and experience in the KINDORA program.",
      image: {
        url: "/svgs/certification.svg",
        width: 251,
        height: 224,
      },
      showButton: false,
      isLarge: false,
    },
  ];

  const renderCard = (benefit: (typeof benefits)[0], index: number) => {
    return (
      <Card
        key={index}
        className="shadow-none h-full !rounded-2xl border-none bg-[#F5F5F5] flex-1 pt-0 pb-8"
      >
        <CardContent
          className={`h-full flex justify-center items-end ${index === 0 ? "items-center" : index === 1 ? "mt-6" : ""
            }`}
        >
          <div
            className={`flex flex-col w-full ${index === 0
              ? "items-center text-center"
              : benefit.isLarge
                ? benefit.centerContent
                  ? "items-center text-center"
                  : "items-start text-left"
                : "items-center text-center"
              }`}
          >
            {benefit.image && (
              <div className="flex items-center justify-center mb-4 mx-auto overflow-hidden w-full max-w-full px-4">
                <Image
                  src={benefit.image.url}
                  alt={benefit.title}
                  width={benefit.image.width}
                  height={benefit.image.height}
                  className="object-contain max-w-full h-auto"
                />
              </div>
            )}
            <h3
              className={`font-semibold text-[#000000] mb-4 px-4 ${benefit.noImage ? "text-2xl sm:text-3xl md:text-[40px] text-[#0A0D12] mb-6 md:mb-8" : "text-lg md:text-xl"
                }`}
            >
              {benefit.title}
            </h3>
            <p className={`text-[#414651] text-base md:text-lg px-4 ${benefit.despWidth || "w-full"}`}>
              {benefit.description}
            </p>
            {benefit.showButton && (
              <Button
                className={`bg-[#1570EF] h-[49px] px-[30px] py-[15px] rounded-full hover:bg-[#1d4ed8] text-[#F5FAFF] mt-8 text-base md:text-lg ${benefit.centerContent ? "mx-auto" : ""
                  }`}
              >
                Join now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container max-w-[1170px] mx-auto">
        <div className="flex flex-col gap-[30px]">
          {/* First row - flex with 670px and 470px */}
          <div className="flex flex-col md:flex-row gap-[30px] md:items-stretch">
            <div className="w-full md:w-[670px] flex">
              {renderCard(benefits[0], 0)}
            </div>
            <div className="w-full md:w-[470px] flex">
              {renderCard(benefits[1], 1)}
            </div>
          </div>

          {/* Second row - flex with 470px and 670px (opposite) */}
          <div className="flex flex-col md:flex-row gap-[30px] md:items-stretch">
            <div className="w-full md:w-[470px] flex">
              {renderCard(benefits[2], 2)}
            </div>
            <div className="w-full md:w-[670px] flex">
              {renderCard(benefits[3], 3)}
            </div>
          </div>

          {/* Third row - grid with 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[30px]">
            {benefits
              .slice(4)
              .map((benefit, index) => renderCard(benefit, index + 4))}
          </div>
        </div>
      </div>
    </section>
  );
}
