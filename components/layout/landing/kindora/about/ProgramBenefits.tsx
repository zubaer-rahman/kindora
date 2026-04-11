"use client";

import { motion } from "framer-motion";
import { Globe, Heart, Network, Share2, Award, Briefcase } from "lucide-react";

export default function ProgramBenefits() {
  const items = [
    {
      title: "Cultural Immersion",
      description: "Understand Australian language and workplace practices through first-hand experience.",
      icon: Globe,
    },
    {
      title: "Meaningful Friendship",
      description: "Create long-lasting personal connections with like-minded people in your local area.",
      icon: Heart,
    },
    {
      title: "Professional Networks",
      description: "Acquire valuable industry connections across universities and local communities.",
      icon: Network,
    },
    {
      title: "Broader Social Impact",
      description: "Create meaningful change in the community while growing personally and professionally.",
      icon: Share2,
    },
    {
      title: "Enhanced Employability",
      description: "Build essential soft skills that top-tier employers look for in every modern field.",
      icon: Briefcase,
    },
    {
      title: "Official Certification",
      description: "Validate your skills and experience with recognized Kindora program credentials.",
      icon: Award,
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-slate-50 relative overflow-hidden">
      <div className="container max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16 md:mb-24">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-primary font-semibold tracking-widest uppercase text-xs mb-4 block"
          >
            Program Benefits
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight"
          >
            See the <span className="text-primary italic">Program</span>
          </motion.h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            A comprehensive visual overview of how Kindora supports and empowers international students.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-white p-10 rounded-[32px] border border-slate-100 hover:border-primary/20 hover:shadow-2xl transition-all duration-500"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mb-10 transition-transform group-hover:scale-110 duration-500 shadow-sm border border-primary/10">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-base text-slate-500 leading-relaxed group-hover:text-slate-600">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
