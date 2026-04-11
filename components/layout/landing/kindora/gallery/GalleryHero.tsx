"use client";

import { motion } from "framer-motion";

export default function GalleryHero() {
  return (
    <section className="relative pt-44 md:pt-60 pb-16 md:pb-24 overflow-hidden bg-white">
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
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] bg-primary/5 text-primary mb-8 border border-primary/10"
          >
            Visual Journey
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-slate-900 mb-10 tracking-tight leading-[1.05]"
          >
            The Spirit of <span className="text-primary italic">Kindora</span>
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative bg-white/40 backdrop-blur-md p-10 rounded-[40px] border border-white shadow-2xl shadow-slate-200/50 italic text-xl md:text-2xl text-slate-600 max-w-2xl group transition-all hover:bg-white/60"
          >
            <span className="text-primary/20 text-8xl leading-none absolute -top-4 -left-2 select-none">&ldquo;</span>
            <p className="relative z-10 leading-relaxed">
              Kindora is a volunteering organisation that not only introduces you to volunteering but introduces you to yourself.
            </p>
            <span className="block not-italic text-sm mt-8 font-bold text-slate-400 uppercase tracking-[0.25em] flex items-center gap-4">
              <div className="h-px w-8 bg-slate-200" />
              Kindora Participant
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
