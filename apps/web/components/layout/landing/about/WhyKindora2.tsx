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
    <section className="py-16 md:py-24 bg-muted relative overflow-hidden">
      <div className="container max-w-[1170px] mx-auto px-4 md:px-8">
        <div className="text-center mb-8 md:mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-primary font-semibold tracking-widest uppercase text-xs mb-4 block"
          >
            For Organisations
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl md:text-[40px] font-semibold mb-6 text-foreground tracking-tight"
          >
            Scale Your <span className="text-primary italic">Success</span>
          </motion.h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
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
                className="group relative bg-card p-10 rounded-2xl border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-500 hover:scale-[1.05]"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mb-10 transition-transform group-hover:rotate-12 duration-500 shadow-sm border border-primary/10">
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
