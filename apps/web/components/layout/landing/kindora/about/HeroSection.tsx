"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative h-[400px] md:h-[500px] overflow-hidden bg-slate-900">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/kindora-landing-hero.jpg"
          alt="Kindora Community"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent z-10" />
      </div>

      <div className="container relative z-20 h-full flex flex-col justify-center px-4 md:px-8 pt-24 md:pt-32">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 md:p-12 rounded-[32px] shadow-2xl"
        >
          {/* Partner Logo */}
          <div className="mb-8">
            <Image
              src="/UT.svg"
              alt="UTS"
              width={100}
              height={40}
              className="h-10 w-auto brightness-0 invert opacity-80"
            />
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
            Volunteering <span className="text-primary-foreground italic underline decoration-primary/40 underline-offset-8">Opportunities</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 font-medium">
            For International Students in NSW
          </p>
        </motion.div>
      </div>
    </section>
  );
}
