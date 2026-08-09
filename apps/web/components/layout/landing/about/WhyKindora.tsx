"use client";

import { motion } from "framer-motion";
import { Search, Bell, MessageSquare } from "lucide-react";

export default function WhyKindora() {
  const features = [
    {
      icon: Search,
      title: "Tailored Volunteering Experiences",
      description: "Discover opportunities that align perfectly with your unique skills, interests, and schedule. Our innovative algorithm ensures you are matched with roles that truly resonate with you."
    },
    {
      icon: Bell,
      title: "Real-Time Opportunity Alerts",
      description: "Stay informed with instant notifications about the latest volunteer roles that fit your interests, ensuring you never miss a chance to make a difference."
    },
    {
      icon: MessageSquare,
      title: "Seamless Communication",
      description: "Engage effortlessly with organizations through our integrated messaging platform, keeping you connected and informed with the latest updates."
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-slate-50/50 relative overflow-hidden">
      <div className="container max-w-[1170px] mx-auto px-4 md:px-8">
        <div className="text-center mb-16 md:mb-24">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-primary font-semibold tracking-widest uppercase text-sm mb-4 block"
          >
            For Volunteers
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 tracking-tight"
          >
            Why <span className="text-primary italic">Kindora</span>?
          </motion.h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Empowering your volunteering journey with modern tools and smart connections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative bg-white p-10 rounded-[32px] border border-slate-100 hover:border-primary/20 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mb-10 transition-transform group-hover:scale-110 duration-500 shadow-sm border border-primary/10">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-6 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed group-hover:text-slate-700">
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