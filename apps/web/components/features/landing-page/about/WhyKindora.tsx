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
    <section className="py-16 md:py-24 bg-background relative overflow-hidden">
      <div className="container max-w-[1170px] mx-auto px-4 md:px-8">
        <div className="text-center mb-8 md:mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-primary font-semibold tracking-widest uppercase text-xs mb-4 block"
          >
            For Volunteers
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl md:text-[40px] font-semibold mb-6 text-foreground tracking-tight"
          >
            Why <span className="text-primary italic">Kindora</span>?
          </motion.h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
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
                className="group relative bg-card p-10 rounded-2xl border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-500 hover:scale-[1.02]"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mb-10 transition-transform group-hover:scale-110 duration-500 shadow-sm border border-primary/10">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-6 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
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