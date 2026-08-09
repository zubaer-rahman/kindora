"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ClockIcon } from "lucide-react";

export default function BlogSection() {
  const featuredPost = {
    title: "Proven Ways Volunteering Boosts Your Career Growth",
    description:
      "Discover how volunteering can accelerate your professional development and open doors to new career opportunities.",
    readTime: "5 min read",
    date: "9 June 2021",
    image: "/images/new-landing/blog_left.jpg",
  };

  const posts = [
    {
      title: "How to Choose the Perfect Volunteer Role for Your Goals?",
      readTime: "4 min read",
      date: "15 May 2021",
      image: "/images/new-landing/blog_right_top.jpg",
    },
    {
      title:
        "From Classroom to Community: Turning Student Volunteering into Lifelong Impact",
      readTime: "6 min read",
      date: "22 April 2021",
      image: "/images/new-landing/blog_right_center.jpg",
    },
    {
      title: "Volunteering for Wellbeing: How Helping Others Helps You",
      readTime: "5 min read",
      date: "10 April 2021",
      image: "/images/new-landing/blog_bottom_right.jpg",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container max-w-[1170px] mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-[40px] max-w-[732px] mx-auto md:text-4xl font-semibold text-[#0A0D12] mb-[72px] text-center">
          Find Expert Tips and Growth Insights on Our Blog
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-[30px]">
          {/* Featured Post */}
          <Card className="p-0 border-none shadow-none bg-transparent">
            <div className="relative aspect-[570/428] w-full mb-6">
              <Image
                src={featuredPost.image}
                alt={featuredPost.title}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <CardContent className="p-0">
              <h3 className="text-xl md:text-[20px] font-semibold text-[#0A0A0A] mb-4">
                {featuredPost.title}
              </h3>
              <p className="text-[#414651] text-base md:text-lg mt-4 mb-6 md:mb-8 leading-relaxed line-clamp-2">
                {featuredPost.description}
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <Button
                  variant="outline"
                  className="border-[#181D27] h-[48px] text-base md:text-lg !rounded-full py-3 px-[31px] text-[#181D27] bg-[#F5F5F5] w-full sm:w-auto"
                >
                  Learn More
                </Button>
                <div className="flex items-center gap-4 md:gap-6 text-sm text-[#717680]">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4" />
                    <span>{featuredPost.readTime}</span>
                  </div>
                  <span>{featuredPost.date}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Side Posts */}
          <div className="flex flex-col gap-6">
            {posts.map((post, index) => (
              <Card
                key={index}
                className="flex flex-col sm:flex-row gap-4 p-0 shadow-none border-none bg-transparent"
              >
                <div className="relative w-full sm:w-[192px] h-[200px] sm:h-[196px] flex-shrink-0">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <CardContent className="flex flex-col justify-between p-0 py-2">
                  <h4 className="font-semibold text-lg md:text-[20px] text-[#0A0A0A] mb-4 sm:mb-0">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-4 md:gap-6 text-sm text-[#6A7282]">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4" />
                      <span>{post.readTime}</span>
                    </div>
                    <span>{post.date}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
