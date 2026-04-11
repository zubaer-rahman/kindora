"use client";

import { Button } from "@/components/ui/button";
import { Star, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function ReviewsSection() {
  const reviews = [
    {
      name: "Maxwell Salvador",
      title: "Creative Lead & Volunteer Consultant",
      rating: 5,
      review:
        "Participating in community projects through Kindora has been incredibly rewarding. It allowed me to apply my creative skills to meaningful causes while expanding my professional network in ways I never expected. The impact we made together was truly fulfilling.",
      color: "bg-[#EFF8FF] text-[#175CD3]", // Blue
    },
    {
      name: "Sarah Johnson",
      title: "Marketing Specialist & Community Advocate",
      rating: 5,
      review:
        "Kindora makes it seamless to find opportunities where I can truly contribute. The experience of collaborating with diverse organizations has sharpened my strategic thinking and deepened my impact. It's the perfect platform for those looking to give back.",
      color: "bg-[#F9F5FF] text-[#6941C6]", // Purple
    },
    {
      name: "Michael Chen",
      title: "Project Coordinator & Student Volunteer",
      rating: 5,
      review:
        "As a student, Kindora gave me the chance to participate in real-world projects that bridged the gap between theory and practice. The hands-on experience I gained while supporting local initiatives was invaluable for my personal and professional growth.",
      color: "bg-[#ECFDF3] text-[#067647]", // Green
    },
    {
      name: "Emma Wilson",
      title: "Full-stack Developer & Technical Mentor",
      rating: 5,
      review:
        "I’ve participated in several tech-for-good initiatives via Kindora. The platform’s ability to match my technical expertise with the right social impact opportunities is unmatched. It’s a game-changer for anyone wanting to use their skills for a better world.",
      color: "bg-[#FFFAEB] text-[#B54708]", // Orange
    },
  ];

  return (
    <section className="py-16 md:py-24 overflow-hidden">
      <div className="container max-w-[1170px] mx-auto flex flex-col lg:flex-row gap-12 lg:gap-[61px] justify-between px-4">
        <div className="max-w-full lg:max-w-[376px] mb-0 lg:mb-12 text-center lg:text-left">
          <h2 className="text-2xl sm:text-3xl md:text-[40px] font-semibold text-[#0A0D12] mb-4 md:mb-8 leading-tight">
            Reviews of People Who Participated Using Kindora
          </h2>
          <p className="text-base text-[#414651] mb-6 md:mb-8 leading-relaxed">
            Discover the experiences of individuals who have contributed their skills and passion to meaningful opportunities through our community.
          </p>
          <Button className="h-[49px] bg-[#1570EF] hover:bg-[#1d4ed8] px-[30px] py-[15px] rounded-full font-medium text-base text-[#F5FAFF]">
            Join now
          </Button>
        </div>

        <div className="flex-1 w-full lg:max-w-[733px] py-8 md:py-12 relative rounded-3xl md:rounded-4xl bg-[#F5F5F5]">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={32}
            slidesPerView={1}
            centeredSlides={true}
            initialSlide={1}
            navigation={{
              nextEl: ".swiper-button-next-custom",
              prevEl: ".swiper-button-prev-custom",
            }}
            pagination={{
              clickable: true,
              el: ".swiper-pagination-custom",
            }}
            breakpoints={{
              640: {
                slidesPerView: 1.2,
              },
              768: {
                slidesPerView: 1.3,
              },
            }}
            className="!pb-0"
          >
            {reviews.map((review, index) => (
              <SwiperSlide key={index}>
                <div className="review-card bg-white w-[90%] sm:w-full max-w-[549px] mx-auto rounded-2xl md:rounded-3xl py-6 px-6 md:py-10 md:px-8 border-none h-full flex flex-col">
                  {/* Icon */}
                  <div className="flex  mb-[22px]">
                    <div className="w-16 h-16 rounded-2xl bg-[#F3E8FF] flex items-center justify-center">
                      <Briefcase className="h-8 w-8 text-[#8B5A3C]" />
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-[#414651] text-base mb-[32px] md:min-h-[130px] leading-[26px] text-justify">
                    "{review.review}"
                  </p>

                  {/* Stars */}
                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-[#FF8904] text-[#FF8904]"
                      />
                    ))}
                  </div>

                  {/* Author Info */}
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 ${review.color}`}>
                      {review.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-[#414651] text-base">
                        {review.name}
                      </h3>
                      <p className="text-sm text-[#717680]">{review.title}</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          <button className="swiper-button-prev-custom absolute left-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
            <ChevronLeft className="h-5 w-5 text-black" />
          </button>
          <button className="swiper-button-next-custom absolute right-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
            <ChevronRight className="h-5 w-5 text-black" />
          </button>

          {/* Pagination */}
          <div className="swiper-pagination-custom mt-8"></div>
        </div>
      </div>
    </section>
  );
}
