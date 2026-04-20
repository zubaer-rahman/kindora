'use client';

import Image from "next/image";
import { ProfileSidebar } from "./ProfileSidebar";
import { CompletedOpportunities } from "./CompletedOpportunities";

export function VolunteerProfile() {
  return (
    <div className="w-[964px] mx-auto">
      {/* Header with background */}
      <div className="relative h-48 rounded-[12px] overflow-hidden">
        <Image
          src="/pfbg.png"
          alt="Profile background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute bottom-6 left-6">
          <div className="relative w-14 h-14 rounded-[12px]">
            <Image
              src="/vp.svg"
              alt="Volunteer"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-6">
        <ProfileSidebar />
        <div className="w-[1px] bg-gray-200"></div>
        <CompletedOpportunities />
      </div>
    </div>
  );
}
