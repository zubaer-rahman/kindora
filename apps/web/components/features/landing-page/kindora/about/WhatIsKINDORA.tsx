"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function WhatIsKINDORA() {
  const router = useRouter();

  const handleJoinProgram = () => {
    router.push('/signup?role=volunteer');
  };

  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden">
      <div className="container max-w-5xl mx-auto px-4 md:px-8">
        <div className="flex flex-col items-center text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-primary font-semibold tracking-widest uppercase text-xs mb-4 block"
          >
            Program Overview
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-slate-900 mb-8 tracking-tight"
          >
            What is <span className="text-primary italic">Kindora</span>?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-4xl mb-12"
          >
            Kindora is an innovative program that connects international students in NSW 
            with local, established community, charity, not-for-profit and social 
            enterprise organisations to undertake training and volunteering opportunities.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={handleJoinProgram}
              className="bg-primary hover:bg-primary/90 text-white px-12 py-8 rounded-full text-lg font-bold shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
            >
              Start Your Journey
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
