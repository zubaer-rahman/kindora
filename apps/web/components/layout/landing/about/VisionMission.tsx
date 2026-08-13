"use client";

import { motion } from "framer-motion";
import { Target, Heart } from "lucide-react";

export default function VisionMission() {
  const sections = [
    {
      icon: Target,
      title: "Our Vision",
      content: "To be a global platform of inspiration that brings meaningful positive change through social impact initiatives.",
      color: "bg-primary text-white shadow-primary/20"
    },
    {
      icon: Heart,
      title: "Our Mission",
      content: "To empower both causes and their volunteers to build sustainable social change through seamless collaboration, fostering a world where every act of service creates lasting impact.",
      color: "bg-primary text-white shadow-primary/20"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-muted relative overflow-hidden">
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
                className="group p-10 rounded-2xl bg-card border border-border hover:border-primary/20 hover:bg-card hover:shadow-lg transition-all duration-500 h-full"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-10 transition-transform group-hover:scale-110 duration-500 shadow-xl ${section.color}`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-6 group-hover:text-primary transition-colors">
                  {section.title}
                </h2>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
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