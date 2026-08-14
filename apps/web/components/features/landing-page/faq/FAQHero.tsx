"use client";

import { motion } from "framer-motion";

export default function FAQHero() {
  return (
    <section className="relative pt-44 md:pt-60 pb-16 md:pb-24 overflow-hidden bg-background">
      {/* Background Mesh */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1.1, 1, 1.1],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px]" 
        />
      </div>

      <div className="container max-w-[1170px] relative z-10 mx-auto px-4 md:px-8">
        <div className="max-w-4xl text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-primary/5 text-primary mb-6 ring-1 ring-inset ring-primary/10"
          >
            Support Center
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]"
          >
            How can we <br className="hidden md:block" />
            <span className="text-primary italic">help you?</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto md:mx-0"
          >
            Everything you need to know about Kindora. Can&apos;t find what you&apos;re looking for? Reach out to our specialized support team.
          </motion.p>
        </div>
      </div>
    </section>
  );
}