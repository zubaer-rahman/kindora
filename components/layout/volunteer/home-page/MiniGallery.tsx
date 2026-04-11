"use client";

import Image from "next/image";
import Link from "next/link";

interface MiniGalleryProps {
  title?: string;
  seeMoreLink?: string;
}

const MiniGallery: React.FC<MiniGalleryProps> = ({
  title = "Check out our past program successes",
  seeMoreLink = "/volunteer/gallery",
}) => {
  const galleryImages = [
    "/mg1.svg",
    "/mg2.svg",
    "/mg3.svg",
    "/mg4.svg",
    "/mg5.svg",
    "/mg6.svg",
  ];

  return (
    <>
      {/* Desktop version */}
      <div className="hidden sm:block w-full max-w-[500px]">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 relative">
          {title}
          <div className="absolute -bottom-2 left-0 w-20 h-1 bg-blue-500 rounded-full"></div>
        </h2>

        <div className="relative h-[400px]">
          {/* Main large image */}
          <div className="absolute top-0 left-0 w-[60%] h-[70%] z-10 transform hover:scale-105 transition-transform duration-300">
            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={galleryImages[0]}
                alt="Team member 1"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>

          {/* Overlapping images */}
          <div className="absolute top-[10%] right-0 w-[45%] h-[45%] z-20 transform hover:scale-105 transition-transform duration-300">
            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={galleryImages[1]}
                alt="Team member 2"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>

          <div className="absolute bottom-0 right-[10%] w-[40%] h-[40%] z-30 transform hover:scale-105 transition-transform duration-300">
            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={galleryImages[2]}
                alt="Team member 3"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>

          <div className="absolute bottom-[15%] left-[20%] w-[35%] h-[35%] z-40 transform hover:scale-105 transition-transform duration-300">
            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={galleryImages[3]}
                alt="Team member 4"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href={seeMoreLink}
            className="inline-flex items-center px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
           See more
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* Mobile version */}
      <div className="sm:hidden">
        <h2 className="text-xl font-bold text-gray-800 mb-6 relative">
          {title}
          <div className="absolute -bottom-2 left-0 w-16 h-1 bg-blue-500 rounded-full"></div>
        </h2>

        <div className="relative h-[300px]">
          {/* Main image */}
          <div className="absolute top-0 left-0 w-[70%] h-[60%] z-10">
            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={galleryImages[0]}
                alt="Team member 1"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Overlapping images */}
          <div className="absolute top-[10%] right-0 w-[50%] h-[45%] z-20">
            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={galleryImages[1]}
                alt="Team member 2"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="absolute bottom-0 right-[15%] w-[45%] h-[40%] z-30">
            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={galleryImages[2]}
                alt="Team member 3"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href={seeMoreLink}
            className="inline-flex items-center px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md"
          >
            View Team
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </>
  );
};

export default MiniGallery;
