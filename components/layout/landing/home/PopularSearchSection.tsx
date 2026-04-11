"use client";

import { Button } from "@/components/ui/button";
import {
  Users,
  GraduationCap,
  Activity,
  Briefcase,
  PawPrint,
  Monitor,
  PenTool,
  Leaf,
  Home,
  User,
  Venus,
  Code,
  Heart,
  BookOpen,
  UserCog,
  FileStack,
} from "lucide-react";

export default function PopularSearchSection() {
  const categories = [
    { icon: Users, label: "Community & Social Services" },
    { icon: GraduationCap, label: "Education & Mentorship" },
    { icon: Activity, label: "Healthcare & Medical Volunteering" },
    { icon: Briefcase, label: "Corporate & Skilled Volunteering" },
    { icon: PawPrint, label: "Animal Welfare" },
    { icon: Monitor, label: "Technology & Digital Volunteering" },
    { icon: PenTool, label: "Arts, Culture & Heritage" },
    { icon: Leaf, label: "Environmental" },
    { icon: Home, label: "Homelessness & Housing" },
    { icon: User, label: "Senior Support" },
    { icon: Venus, label: "Women Empowerment" },
    { icon: Code, label: "Technology & Digital Literacy" },
    { icon: Heart, label: "Health & Medicine" },
    { icon: BookOpen, label: "Education & Literacy" },
    { icon: Users, label: "Youth Mentoring" },
    { icon: UserCog, label: "Disability Support" },
    { icon: FileStack, label: "Disaster Relief" },
  ];

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="container max-w-[1170px] mx-auto px-4 text-center">
        {/* Title */}
        <h2 className="text-3xl md:text-[40px] font-semibold text-[#0A0D12] mb-12 md:mb-16 tracking-tight">
          Popular Search
        </h2>
        
        {/* Flexible Pill Container */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 md:gap-3 lg:gap-4 max-w-[1100px] mx-auto">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="h-[46px] md:h-12 border border-[#E9EAEB] px-5 md:px-7 flex bg-white rounded-full items-center gap-2.5 md:gap-3 text-[#414651] hover:border-primary/40 hover:bg-slate-50 hover:text-primary transition-all duration-300 group shadow-none"
              >
                <Icon className="h-4 w-4 md:h-5 md:w-5 text-[#99A1AF] group-hover:text-primary transition-colors" />
                <span className="text-[13px] font-medium whitespace-nowrap">
                  {category.label}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
}





