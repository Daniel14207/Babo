import { useEffect } from 'react';
import { motion } from 'motion/react';
import { playMergeSound } from '../lib/audio';

export default function Intro({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);
    
    const soundTimer = setTimeout(() => {
      playMergeSound();
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(soundTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950 overflow-hidden z-50">
      <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -500, x: 200 + i * 50, rotate: 45, opacity: 0 }}
            animate={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
            transition={{ 
              duration: 1.5, 
              delay: i * 0.2, 
              type: "spring", 
              bounce: 0.4 
            }}
            className="absolute w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg shadow-[0_0_30px_rgba(16,185,129,0.5)] border border-white/20"
            style={{ zIndex: 10 - i }}
          />
        ))}

        <motion.div 
          initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: 2.5 }}
          className="absolute z-20 flex flex-col items-center"
        >
          <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]">
            VITAL
          </h1>
          <h2 className="text-2xl font-medium tracking-widest text-slate-300 mt-2 uppercase">
            Pronostic
          </h2>
        </motion.div>
      </div>
    </div>
  );
}
