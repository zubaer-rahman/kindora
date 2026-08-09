'use client';

import Image from "next/image";
import { MapPin, Star, MoreHorizontal } from "lucide-react";

export function CompletedOpportunities() {
  return (
    <div className="w-fit">
      <h2 className="text-blue-600 font-medium text-[12px] border-b pb-2 mb-6">Completed opportunities</h2>
      
      <div className="flex gap-6">
        <div className="border rounded-xl overflow-hidden w-[300px] h-[260px]">
          <div className="relative h-[102px] w-full">
            <Image
              src="/wall.svg"
              alt="Seek Help"
              fill
              className="object-cover"
            />
          </div>
          <div className="p-3">
            <h3 className="text-[14px] font-semibold">Seek Help</h3>
            <div className="flex items-center gap-1 text-gray-500 mt-0.5">
              <MapPin className="w-3 h-3" />
              <span className="text-[10px]">Sydney, Australia</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">40+ Participants</p>
            <div className="flex flex-col gap-0.5 mt-1">
              <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md w-fit">Community & Social Services</span>
              <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md w-fit">Environmental & Conservation</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 mb-1">27 Jan 2025 - 10:16 pm</p>
            <div className="flex justify-between items-center">
              <Star className="w-3 h-3 text-gray-400" />
              <MoreHorizontal className="w-3 h-3 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="border rounded-xl overflow-hidden w-[300px] h-[260px]">
          <div className="relative h-[102px] w-full">
            <Image
              src="/dog.svg"
              alt="Environmental Champions"
              fill
              className="object-cover"
            />
          </div>
          <div className="p-3">
            <h3 className="text-[14px] font-semibold">Environmental Champions Needed!</h3>
            <div className="flex items-center gap-1 text-gray-500 mt-0.5">
              <MapPin className="w-3 h-3" />
              <span className="text-[10px]">Sydney, Australia</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">40+ Participants</p>
            <div className="flex flex-col gap-0.5 mt-1">
              <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md w-fit">Community & Social Services</span>
              <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md w-fit">Environmental & Conservation</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 mb-1">27 Jan 2025 - 10:16 pm</p>
            <div className="flex justify-between items-center">
              <Star className="w-3 h-3 text-gray-400" />
              <MoreHorizontal className="w-3 h-3 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}