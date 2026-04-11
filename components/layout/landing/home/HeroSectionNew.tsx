"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import SearchBar from "@/components/common/SearchBar-old-ref";

export default function HeroSectionNew() {
  const router = useRouter();

  const handleSearch = (query: string, location: string) => {
    const params = new URLSearchParams();
    if (query) params.set("searchQuery", query);
    if (location) params.set("location", location);

    router.push(`/opportunities?${params.toString()}`);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const floatingImage = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    },
    hover: { 
      y: -10,
      transition: { duration: 0.3, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" as const }
    }
  };

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] opacity-60" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            x: [0, -40, 0],
            y: [0, 60, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 right-[-10%] w-[40%] h-[40%] bg-accent/30 rounded-full blur-[100px] opacity-50" 
        />
        <motion.div 
          animate={{ 
            scale: [0.8, 1.1, 0.8],
            x: [0, 30, 0],
            y: [0, -40, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[80px] opacity-40" 
        />
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(var(--primary) 0.5px, transparent 0.5px)`,
          backgroundSize: '32px 32px'
        }}
      />

        <div className="container mx-auto px-4 pt-32 pb-32 sm:px-6 lg:px-8 relative">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            {/* Badge */}
            <motion.div 
              variants={fadeInUp}
              className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-primary/5 text-primary mb-6 ring-1 ring-inset ring-primary/10"
            >
              The Next Gen Volunteering Platform
            </motion.div>

            {/* Main Title */}
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]"
            >
              Transform Lives Through <span className="text-primary italic">Meaningful</span> Connection
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              variants={fadeInUp}
              className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            >
              Kindora connects passionate volunteers with organizations across Australia to create lasting impact and professional growth.
            </motion.p>

            {/* Search Bar Container */}
            <motion.div 
              variants={fadeInUp}
              className="relative z-20 max-w-3xl mx-auto p-2 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl shadow-primary/10"
            >
              <SearchBar onSearch={handleSearch} />
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Interactive Images - Tightened to stay close to middle content */}
        <div className="hidden xl:block absolute inset-0 pointer-events-none overflow-hidden">
          <div className="max-w-[1440px] mx-auto h-full relative">
            {/* Top Left */}
            <motion.div 
              variants={floatingImage}
              initial="initial"
              animate="animate"
              whileHover="hover"
              className="absolute top-[22%] left-[4%] z-0 pointer-events-auto"
            >
              <div className="relative w-[140px] h-[160px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white rotate-[-6deg]">
                <Image src="/images/new-landing-hero/top-left.jpg" alt="Kindora" fill className="object-cover" />
              </div>
            </motion.div>

            {/* Top Right */}
            <motion.div 
              variants={floatingImage}
              initial="initial"
              animate="animate"
              whileHover="hover"
              className="absolute top-[18%] right-[4%] z-0 pointer-events-auto"
            >
              <div className="relative w-[150px] h-[170px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white rotate-[8deg]">
                <Image src="/images/new-landing-hero/top-right.jpg" alt="Kindora" fill className="object-cover" />
              </div>
            </motion.div>

            {/* Bottom Left */}
            <motion.div 
              variants={floatingImage}
              initial="initial"
              animate="animate"
              whileHover="hover"
              className="absolute bottom-[22%] left-[2%] z-0 pointer-events-auto"
            >
              <div className="relative w-[130px] h-[150px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white rotate-[12deg]">
                <Image src="/images/new-landing-hero/bottom-left.jpg" alt="Kindora" fill className="object-cover" />
              </div>
            </motion.div>

            {/* Bottom Right */}
            <motion.div 
              variants={floatingImage}
              initial="initial"
              animate="animate"
              whileHover="hover"
              className="absolute bottom-[12%] right-[2%] z-0 pointer-events-auto"
            >
              <div className="relative w-[140px] h-[160px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white rotate-[-4deg]">
                <Image src="/images/new-landing-hero/bottom-right.jpg" alt="Kindora" fill className="object-cover" />
              </div>
            </motion.div>
          </div>
        </div>
    </section>
  );
}
