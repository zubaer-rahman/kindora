'use client';

import { MapPin, GraduationCap, Heart, Linkedin, Facebook } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ProfileSidebar() {
  return (
    <div className="max-w-[275px] space-y-6">
      <div className="flex flex-col gap-1 pb-6 border-b">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Tiago Leitao</h2>
          <span className="text-green-600 text-[10px] mt-2">. Available now</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <GraduationCap className="w-4 h-4" />
            <span className="text-[10px]">Student</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span className="text-[10px]">Volunteer</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span className="text-[10px]">Sydney, Australia</span>
          </div>
        </div>
      </div>

      <div className="pb-6 border-b">
        <div className="flex gap-3">
          <Button className="flex-1 bg-blue-700">Send message</Button>
          <Button variant="outline" className="flex-1">Recruit</Button>
        </div>
      </div>

      <div className="pb-6 border-b ">
        <h3 className="font-medium mb-2">Location</h3>
        <p className="text-sm text-gray-600 text-[10px]">21 Darling Dr, Sydney, Australia</p>
        <p className="text-sm text-gray-600 mt-1 text-[10px]">ABN - 43 625 460 915</p>
      </div>

      <div className="pb-6 border-b">
        <h3 className="font-medium mb-2">Contacts</h3>
        <div className="space-y-1">
          <p className="text-sm text-gray-600 text-[10px]">Email - tiago@spotify.com</p>
          <p className="text-sm text-gray-600 text-[10px]">Phone - 123456789</p>
        </div>
      </div>

      <div className="pb-6 border-b">
        <h3 className="font-medium mb-2">Skills</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-gray-200 text-gray-500 text-[8px]">Communication</Badge>
          <Badge variant="secondary" className="bg-gray-200 text-gray-500 text-[8px]">Leadership</Badge>
          <Badge variant="secondary" className="bg-gray-200 text-gray-500 text-[8px]">Teamwork</Badge>
        </div>
      </div>

      <div className="pb-6 border-b">
        <h3 className="font-medium mb-2">About us</h3>
        <p className="text-[10px] text-gray-600">
          Being a student and passionate about protecting our environment, I believe in combining my academic knowledge with practical action. Volunteering not only helps me contribute to the betterment of our planet, but it also allows me to learn, grow, and connect with like-minded individuals who share the same goals.
        </p>
      </div>

      <div className="pb-6 border-b">
        <h3 className="font-medium mb-2">Language</h3>
        <p className="text-sm text-gray-600 text-[10px]">English (AUS)</p>
      </div>

      <div className="pb-6 border-b">
        <h3 className="font-medium mb-2">Social profiles</h3>
        <div className="flex flex-col gap-2">
          <a href="#" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <Linkedin className="w-4 h-4" />
            LinkedIn
          </a>
          <a href="#" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <Facebook className="w-4 h-4" />
            Facebook
          </a>
        </div>
      </div>

      <div>
        <p className="text-sm text-gray-500 text-[10px]">Member since June 4, 2024</p>
        <div className="w-[280px] space-y-4">
          <button className="text-sm text-gray-500 hover:text-gray-700">Report</button>
          <button className="text-sm text-gray-500 hover:text-gray-700">Block</button>
        </div>
      </div>
    </div>
  );
}