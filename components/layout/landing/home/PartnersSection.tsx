"use client";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

export default function PartnersSection() {
  const partners = [
    { name: "UTS", logo: "/images/logos/logo-uts.png" },
    { name: "Red Cross", logo: "/images/logos/logo-redross.png" },
    { name: "City of Sydney", logo: "/images/logos/logo-cityofsydney.png" },
    { name: "UTS SA", logo: "/images/logos/logo-utssa.png" },
    { name: "Massy Consultants", logo: "/images/logos/logo-massyconsulttants.png" },
    { name: "Soul", logo: "/images/logos/logo-soul.png" },
  ];

  return (
    <section className="py-12 md:py-16 bg-white border-y border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1170px]">
        <p className="text-center text-sm font-medium text-muted-foreground uppercase tracking-widest mb-10">
          Trusted by leading organizations and communities
        </p>
        
        <Swiper
          modules={[Autoplay]}
          spaceBetween={40}
          slidesPerView={2}
          loop={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            480: {
              slidesPerView: 3,
              spaceBetween: 50,
            },
            768: {
              slidesPerView: 4,
              spaceBetween: 60,
            },
            1024: {
              slidesPerView: 5,
              spaceBetween: 80,
            },
            1280: {
              slidesPerView: 6,
              spaceBetween: 100,
            },
          }}
          className="partners-swiper"
        >
          {partners.map((partner, index) => (
            <SwiperSlide key={index}>
              <div className="flex items-center justify-center h-[48px] grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer">
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={120}
                  height={48}
                  className="object-contain max-h-full"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}


