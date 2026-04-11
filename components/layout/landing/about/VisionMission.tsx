"use client";

import { motion } from "framer-motion";
import { Target, Heart } from "lucide-react";

export default function VisionMission() {
  const sections = [
    {
      icon: Target,
      title: "Our Vision",
      content: "To be a global platform of inspiration that brings meaningful positive change through social impact initiatives.",
      color: "bg-blue-600 text-white shadow-blue-500/20"
    },
    {
      icon: Heart,
      title: "Our Mission",
      content: "To empower both causes and their volunteers to build sustainable social change through seamless collaboration, fostering a world where every act of service creates lasting impact.",
      color: "bg-primary text-white shadow-primary/20"
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-slate-50/50 relative overflow-hidden">
      <div className="container max-w-[1170px] mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="group p-10 rounded-[32px] bg-slate-50 border border-slate-100 hover:border-primary/20 hover:bg-white hover:shadow-2xl transition-all duration-500 h-full"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-10 transition-transform group-hover:scale-110 duration-500 shadow-xl ${section.color}`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-6 group-hover:text-primary transition-colors">
                  {section.title}
                </h2>
                <p className="text-lg md:text-xl text-slate-600 leading-relaxed group-hover:text-slate-700">
                  {section.content}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}