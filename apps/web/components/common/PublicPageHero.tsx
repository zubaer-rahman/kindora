"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface PublicPageHeroProps {
  title: string;
  description: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  children?: React.ReactNode;
}

export default function PublicPageHero({ 
  title, 
  description, 
  onRefresh, 
  isRefreshing,
  children 
}: PublicPageHeroProps) {
  return (
    <section className="relative pt-44 pb-0 md:pt-56 md:pb-0 overflow-hidden bg-white">
      {/* Dynamic Background Mesh */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, 20, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-15%] right-[-5%] w-[60%] h-[70%] bg-primary/5 rounded-full blur-[100px] opacity-70" 
        />
        <motion.div 
          animate={{ 
            scale: [1.3, 1, 1.3],
            x: [0, -20, 0],
            y: [0, 40, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[60%] bg-accent/10 rounded-full blur-[120px] opacity-60" 
        />
      </div>

      <div className="container max-w-[1170px] relative z-10 mx-auto px-4 md:px-8">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-3xl text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] bg-primary/5 text-primary mb-8 border border-primary/10"
              >
                Kindora Network
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-8 tracking-[-0.03em] leading-[1.05]"
              >
                {title.split(" ").map((word, i) => (
                  <span key={i} className={i === title.split(" ").length - 1 ? "text-primary italic" : ""}>
                    {word}{" "}
                  </span>
                ))}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl md:text-2xl text-slate-500 leading-relaxed max-w-2xl font-medium opacity-90"
              >
                {description}
              </motion.p>
            </div>
            
            {onRefresh && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex-shrink-0 mb-2"
              >
                <Button
                  variant="ghost"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="group flex cursor-pointer items-center gap-3 text-slate-400 hover:text-primary bg-slate-50 hover:bg-primary/5 border border-slate-100 hover:border-primary/20 rounded-full px-6 h-11 transition-all font-bold shadow-sm"
                >
                  <RotateCcw className={`h-5 w-5 transition-transform duration-500 group-hover:rotate-180 ${isRefreshing ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </Button>
              </motion.div>
            )}
          </div>

          {/* Children: Search Bar or Controls */}
          {children && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 mb-[-40px] relative z-20"
            >
              <div className="max-w-4xl">
                {children}
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Divider line that fades out */}
        <div className="h-px bg-slate-100 w-full mt-24 opacity-60" />
      </div>
    </section>
  );
}
