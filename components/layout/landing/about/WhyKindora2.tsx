"use client";

import { motion } from "framer-motion";
import { Users, Layout, Send, BarChart } from "lucide-react";

export default function WhyKindora2() {
  const features = [
    {
      icon: Users,
      title: "Targeted Volunteer Matching",
      description: "Leverage our algorithmic matching system to find volunteers who are well-suited to your organisation’s needs."
    },
    {
      icon: Layout,
      title: "Streamlined Management",
      description: "Efficiently handle scheduling and other management tasks with our user-friendly tools, designed to simplify coordination."
    },
    {
      icon: Send,
      title: "Efficient Channels",
      description: "Utilise our secure, encrypted messaging system for private conversations and organisation-wide announcements."
    },
    {
      icon: BarChart,
      title: "Insightful Feedback",
      description: "Provide and receive valuable feedback to enhance volunteer experiences and improve organisational outcomes."
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden">
      <div className="container max-w-[1170px] mx-auto px-4 md:px-8">
        <div className="text-center mb-16 md:mb-24">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-primary font-semibold tracking-widest uppercase text-sm mb-4 block"
          >
            For Organisations
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 tracking-tight"
          >
            Scale Your <span className="text-primary italic">Success</span>
          </motion.h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Supporting community organisations, charities, and social enterprises with enterprise-grade tools.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative bg-slate-50 p-8 rounded-[32px] border border-slate-100 hover:border-primary/20 hover:bg-white hover:shadow-2xl transition-all duration-500 hover:scale-[1.05]"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mb-10 transition-transform group-hover:rotate-12 duration-500 shadow-sm border border-primary/10">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-6 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-base text-slate-500 leading-relaxed group-hover:text-slate-600 line-clamp-4">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
