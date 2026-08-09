import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface BenefitsProps {
  title: string;
  description: string;
  linkText: string;
  linkHref: string;
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
}

export default function Benefits({
  title,
  description,
  linkText,
  linkHref,
  imageSrc,
  imageAlt,
  reverse = false,
}: BenefitsProps) {
  return (
    <Card className="flex flex-col md:flex-row items-center gap-8 md:gap-16 p-6 border-none shadow-none max-w-[1000px] mx-auto">
      {!reverse && (
        <div className="w-full md:w-1/2">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={450}
            height={300}
            className="rounded-lg"
          />
        </div>
      )}

      <CardContent className="w-full md:w-1/2 space-y-4 text-left">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-gray-600">{description}</p>
        <div className="h-[3px] bg-gray-200 w-[400px]"></div>
        <Link href={linkHref} className="text-blue-600 flex items-center gap-1">
          {linkText} <ArrowRight size={16} />
        </Link>
      </CardContent>

      {reverse && (
        <div className="w-full md:w-1/2">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={450}
            height={300}
            className="rounded-lg"
          />
        </div>
      )}
    </Card>
  );
}
