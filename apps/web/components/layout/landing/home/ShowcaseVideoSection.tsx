"use client";

import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { useRef, useState, useEffect } from "react";

export default function ShowcaseVideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showUnmuteHint, setShowUnmuteHint] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      // Must start muted to allow autoplay to trigger at all
      videoRef.current.muted = true;
      videoRef.current.play().then(() => {
        setShowUnmuteHint(true);
      }).catch((err) => console.warn("Initial play block:", err));
    }

    // Aggressive Pro-Tier Unmute: Listen for ANY interaction to kickstart audio
    const handleInteraction = () => {
      if (videoRef.current && videoRef.current.muted) {
        videoRef.current.muted = false;
        setIsMuted(false);
        setShowUnmuteHint(false);
        // Clean up immediately
        ["mousedown", "scroll", "touchstart", "mousemove"].forEach(evt => 
          window.removeEventListener(evt, handleInteraction)
        );
      }
    };

    ["mousedown", "scroll", "touchstart", "mousemove"].forEach(evt => 
      window.addEventListener(evt, handleInteraction, { passive: true })
    );

    return () => {
      ["mousedown", "scroll", "touchstart", "mousemove"].forEach(evt => 
        window.removeEventListener(evt, handleInteraction)
      );
    };
  }, []);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
      setShowUnmuteHint(false);
    }
  };

  return (
    <section className="py-20 md:py-32 bg-white overflow-hidden">
      <div className="container max-w-[1280px] mx-auto px-4">
        <div className="flex flex-col items-center mb-16 md:mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-[40px] font-bold text-slate-900 text-center tracking-tight leading-tight"
          >
            Empower Your Impact with <span className="text-primary italic">Kindora</span>
          </motion.h2>
          <div className="h-1.5 w-24 bg-primary/20 rounded-full mt-6" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative group max-w-5xl mx-auto rounded-[32px] overflow-hidden shadow-[0_32px_64px_-12px_rgba(79,70,229,0.15)] border-8 border-white ring-1 ring-slate-100"
        >
          <div className="absolute top-8 right-8 z-20">
            <motion.button 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={toggleMute}
              className="flex items-center gap-3 bg-slate-900/40 backdrop-blur-xl border border-white/20 rounded-full py-2.5 px-5 text-white shadow-2xl transition-all duration-300"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </div>
              {showUnmuteHint && isMuted && (
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] pr-1 animate-pulse">Engage for sound</span>
              )}
            </motion.button>
          </div>

          <video 
            ref={videoRef}
            className="w-full aspect-video object-cover transition-transform duration-1000" 
            autoPlay
            loop
            muted
            playsInline
            poster="/images/video-poster.jpg"
          >
            <source src="/videos/kindora-landing.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </motion.div>
      </div>
    </section>
  );
}
