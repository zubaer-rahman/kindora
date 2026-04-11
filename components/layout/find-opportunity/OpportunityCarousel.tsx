import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Opportunity } from "@/types/opportunities";
import { useRouter } from "next/navigation";
import OpportunityCard from "@/components/layout/volunteer/find-opportunity-old/OpportunityCard";
import OpportunityCardSkeleton from "@/components/layout/volunteer/find-opportunity-old/OpportunityCardSkeleton";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface OpportunityCarouselProps {
  opportunities: Opportunity[];
  isLoading?: boolean;
  title: string;
  viewAllLink?: string;
}

const OpportunityCarousel = ({
  opportunities,
  isLoading,
  title,
  viewAllLink,
}: OpportunityCarouselProps) => {
  const router = useRouter();

  // Filter out archived opportunities
  const visibleOpportunities = opportunities.filter(
    (opp) => !opp.is_archived
  );

  return (
    <div className="py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <h3 className="text-lg md:text-xl font-semibold">{title}</h3>
        {viewAllLink && (
          <button
            className="flex cursor-pointer items-center gap-1 text-blue-700 font-semibold hover:underline text-sm transition-colors whitespace-nowrap hover:text-blue-800"
            onClick={() => router.push(viewAllLink)}
          >
            View All{" "}
            <ChevronRight className="inline h-4 w-4 ml-1 text-blue-700 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>

      {/* Swiper Carousel */}
      <div className="relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 hidden sm:flex items-center justify-center">
          <button
            className="border border-blue-600 text-blue-700 bg-white rounded-full p-2 hover:bg-blue-100 flex items-center justify-center transition-colors shadow w-10 h-10"
            title="Scroll left"
            id="opp-swiper-prev"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 hidden sm:flex items-center justify-center">
          <button
            className="border border-blue-600 text-blue-700 bg-white rounded-full p-2 hover:bg-blue-100 flex items-center justify-center transition-colors shadow w-10 h-10"
            title="Scroll right"
            id="opp-swiper-next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <Swiper
          spaceBetween={24}
          slidesPerView={1}
          className="h-full w-full"
          modules={[Navigation, Pagination]}
          navigation={{
            nextEl: "#opp-swiper-next",
            prevEl: "#opp-swiper-prev",
          }}
          pagination={{
            el: ".custom-opp-swiper-pagination",
            clickable: true,
            dynamicBullets: true,
          }}
          autoHeight={false}
          breakpoints={{
            0: {
              slidesPerView: 1,
              spaceBetween: 16,
            },
            356: {
              slidesPerView: 1,
              spaceBetween: 20,
            },
            600: {
              slidesPerView: 2,
              spaceBetween: 24,
              pagination: false,
            },
            900: {
              slidesPerView: 3,
              spaceBetween: 24,
            },
            1200: {
              slidesPerView: 4,
              spaceBetween: 24,
            },
          }}
        >
          {isLoading
            ? // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <SwiperSlide
                  key={`loading-${index}`}
                  className="!flex !justify-center h-full"
                >
                  <div className="w-full h-full">
                    <OpportunityCardSkeleton />
                  </div>
                </SwiperSlide>
              ))
            : visibleOpportunities.map((opportunity) => (
                <SwiperSlide
                  key={opportunity._id}
                  className="!flex !justify-center h-full"
                >
                  <div className="w-full h-full">
                    <OpportunityCard opportunity={opportunity} />
                  </div>
                </SwiperSlide>
              ))}
        </Swiper>
      </div>
      <div>
        <div className="custom-opp-swiper-pagination translate-x-8 mx-auto mt-2 md:hidden" />
      </div>
    </div>
  );
};

export default OpportunityCarousel; 