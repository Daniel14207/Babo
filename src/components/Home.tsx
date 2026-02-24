import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playErrorSound } from '../lib/audio';

export default function Home({ onUnlock }: { onUnlock: () => void }) {
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  const handleAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (btoa(code) === 'NjAwVjEy') {
      onUnlock();
    } else {
      setError(true);
      playErrorSound();
      setTimeout(() => setError(false), 500);
      setCode('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 flex flex-col items-center w-full max-w-md"
      >
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
            VIRTUEL
          </h1>
          <h2 className="text-xl font-medium tracking-widest text-slate-300 mt-1 uppercase">
            Pronostic
          </h2>
        </div>

        <div className="flex flex-col gap-6 w-full">
          <button 
            onClick={() => setShowModal(true)}
            className="relative group overflow-hidden rounded-2xl bg-slate-900/50 border border-emerald-500/30 p-4 transition-all hover:bg-slate-800/50 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <span className="relative font-semibold text-lg text-emerald-50 tracking-wide">Signal Lens</span>
          </button>
          
          <button className="relative group overflow-hidden rounded-2xl bg-slate-900/50 border border-slate-700 p-4 transition-all hover:bg-slate-800/50 hover:border-slate-500">
            <span className="relative font-semibold text-lg text-slate-300 tracking-wide">Calcul Simple</span>
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={error ? { x: [-10, 10, -10, 10, 0], scale: 1, y: 0 } : { scale: 1, y: 0 }}
              transition={error ? { duration: 0.4 } : { duration: 0.2 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-sm shadow-2xl relative"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
              <h3 className="text-xl font-bold text-emerald-400 mb-6 text-center tracking-wider">ACCESS CONTROL</h3>
              <form onSubmit={handleAccess} className="flex flex-col gap-4">
                <input
                  type="password"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="ENTER CODE"
                  className={`w-full bg-slate-950 border ${error ? 'border-red-500' : 'border-slate-700'} rounded-xl p-4 text-center text-2xl tracking-[0.5em] font-mono text-emerald-50 focus:outline-none focus:border-emerald-500 transition-colors`}
                  autoFocus
                />
                <button 
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl p-4 transition-colors"
                >
                  VERIFY
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
