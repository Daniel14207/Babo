import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, Target, Zap, AlertCircle } from 'lucide-react';

export default function AnalysisResult({ data }: { data: any }) {
  const [expandedMatch, setExpandedMatch] = useState<number | null>(null);

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'low':
      case 'green': return 'bg-emerald-500';
      case 'medium':
      case 'yellow':
      case 'volatile': return 'bg-yellow-500';
      case 'high':
      case 'red':
      case 'dangerous': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 pt-8 border-t border-slate-800"
    >
      <section>
        <h2 className="text-2xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
          <Target size={24} /> MATCHS CIBLÉS
        </h2>
        <div className="grid gap-4">
          {data.matches?.map((match: any, idx: number) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div 
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors"
                onClick={() => setExpandedMatch(expandedMatch === idx ? null : idx)}
              >
                <h3 className="font-bold text-lg text-slate-100">{match.matchName}</h3>
                {expandedMatch === idx ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
              </div>
              
              <AnimatePresence>
                {expandedMatch === idx && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-800 bg-slate-950/50"
                  >
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {match.predictions?.map((pred: any, pIdx: number) => (
                        <div key={pIdx} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-slate-400">{pred.market}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-slate-500">{pred.confidence}%</span>
                              <div className={`w-2 h-2 rounded-full ${getRiskColor(pred.risk)}`} />
                            </div>
                          </div>
                          <div className="text-xl font-bold text-emerald-400 mb-2">{pred.value}</div>
                          <p className="text-xs text-slate-500 leading-relaxed">{pred.logic}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
          <Zap size={24} /> CHOIX 10 MULTIPLE
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.multiples?.map((mult: any, idx: number) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${getRiskColor(mult.riskLevel)}`} />
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-bold text-slate-500">MULTIPLE #{idx + 1}</span>
                <div className="text-right">
                  <div className="text-lg font-black text-cyan-400">Cote: {mult.totalOdds}</div>
                  <div className="text-xs font-mono text-slate-500">Stabilité: {mult.stabilityIndex}%</div>
                </div>
              </div>
              <ul className="space-y-2">
                {mult.selections?.map((sel: string, sIdx: number) => (
                  <li key={sIdx} className="text-sm text-slate-300 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
                    {sel}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center gap-2">
          <AlertCircle size={24} /> COTE PLUS DE 10 CIBLÉ
        </h2>
        <div className="grid gap-4">
          {data.highOdds?.map((odd: any, idx: number) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className={`w-3 h-3 rounded-full ${getRiskColor(odd.status)} shadow-[0_0_10px_currentColor]`} />
                  <h3 className="font-bold text-lg text-slate-100">{odd.market}</h3>
                </div>
                <p className="text-sm text-slate-500">{odd.riskExplanation}</p>
              </div>
              <div className="text-2xl font-black text-yellow-400 bg-slate-950 px-6 py-3 rounded-xl border border-slate-800 text-center">
                {odd.estimatedOdd}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center pb-8">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">
            "Faites vos paris avec prudence."
          </p>
        </div>
      </section>
    </motion.div>
  );
}
