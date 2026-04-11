import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  GraduationCap,
  HeartPulse,
  Briefcase,
  Monitor,
  PawPrint,
  Palette,
  Leaf,
} from "lucide-react"; // Import Lucide icons
import { JSX } from "react";

interface Category {
  title: string;
  icon: JSX.Element;
}

const categories: Category[] = [
  { title: "Community & Social Services", icon: <Users size={28} className="text-blue-500" /> },
  { title: "Education & Mentorship", icon: <GraduationCap size={28} className="text-blue-500" /> },
  { title: "Healthcare & Medical Volunteering", icon: <HeartPulse size={28} className="text-blue-500" /> },
  { title: "Corporate & Skilled Volunteering", icon: <Briefcase size={28} className="text-blue-500" /> },
  { title: "Technology & Digital Volunteering", icon: <Monitor size={28} className="text-blue-500" /> },
  { title: "Animal Welfare", icon: <PawPrint size={28} className="text-blue-500" /> },
  { title: "Arts, Culture & Heritage", icon: <Palette size={28} className="text-blue-500" /> },
  { title: "Environmental & Conservation", icon: <Leaf size={28} className="text-blue-500" /> },
];

export default function VolunteerCategories() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-6 max-w-[1000px] mx-auto py-30">
      {categories.map((category, index) => (
        <Card key={index} className="flex items-start gap-3 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 h-36 bg-white border-gray-100">
          {/* Icon Wrapper */}
          <div className="w-8 h-8 flex items-center">
            {category.icon}
          </div>

          {/* Text Content */}
          <CardContent className="p-0">
            <p className="text-sm font-medium text-gray-700 text-left leading-tight">{category.title}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
