// Ensure this is at the top
'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface RegistrationBannerProps {
  title?: string;
  description?: string;
  buttonText?: string;
  onClick?: () => void;
}

export default function RegistrationBanner({
  title = "Learn more about KINDORA",
  description = "Ready to get started? Signing up is easy and free",
  buttonText = "Sign me up",
  onClick,
}: RegistrationBannerProps) {
  const router = useRouter();

  const handleSignUp = () => {
    if (onClick) {
      onClick();
    } else {
      router.push('/signup?role=volunteer');
    }
  };

  return (
    <div className="bg-[#1649B8] py-8 sm:py-12 md:py-16 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-22"
        style={{ backgroundImage: "url('/raised-hands.jpg')" }}
      ></div>

      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50"></div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left relative z-10">
        <div className="max-w-3xl">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white mb-3 sm:mb-4 font-semibold leading-tight">
            {title}
          </h2>

          <p className="text-blue-100 mb-6 sm:mb-8 text-sm sm:text-base md:text-lg leading-relaxed">
            {description}
          </p>

          <Button
            className="bg-black hover:bg-gray-900 text-white border-none text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
            size="lg"
            onClick={handleSignUp}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
