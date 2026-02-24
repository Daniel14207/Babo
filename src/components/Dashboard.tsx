import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { store, Historique } from '../lib/store';
import { parseHistorique } from '../lib/gemini';
import { parseMatches, runAnalysis } from '../lib/analyzer';
import { Loader2, ChevronDown, ChevronUp, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import AnalysisResult from './AnalysisResult';

export default function Dashboard() {
  const [historiques, setHistoriques] = useState<Historique[]>([]);
  const [histInput, setHistInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const [showAnalysisInput, setShowAnalysisInput] = useState(false);
  const [matchInput, setMatchInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisCount, setAnalysisCount] = useState(0);
  
  const [results, setResults] = useState<any>(null);
  const [expandedHist, setExpandedHist] = useState<string | null>(null);

  useEffect(() => {
    setHistoriques(store.get<Historique[]>('historiques', []));
    setAnalysisCount(store.get<number>('analysisCount', 0));
  }, []);

  const handleSaveHistorique = async () => {
    if (!histInput.trim()) return;
    setIsSaving(true);
    try {
      const parsed = await parseHistorique(histInput);
      const newHist: Historique = {
        id: Date.now().toString(),
        text: histInput,
        ...parsed
      };
      const updated = [newHist, ...historiques];
      setHistoriques(updated);
      store.set('historiques', updated);
      setHistInput('');
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'analyse de l'historique.");
    } finally {
      setIsSaving(false);
    }
  };

  const showRenewMessage = () => {
    alert("Renouvellement requis. Limite de 2 analyses par session atteinte.");
  };

  const renderResults = (res: any) => {
    setResults(null);
    requestAnimationFrame(() => {
      setResults(res);
      requestAnimationFrame(() => {
        const container = document.querySelector('#resultsContainer') as HTMLElement;
        if (container) {
          container.style.display = 'block';
        }
      });
    });
  };

  const handleRunAnalysis = () => {
    if (historiques.length === 0) {
      alert("Veuillez ajouter un historique avant l'analyse.");
      return;
    }
    if (analysisCount >= 2) {
      showRenewMessage();
      return;
    }
    
    const parsedMatches = parseMatches(matchInput);
    if (parsedMatches.length === 0) {
      alert("Aucun match détecté. Vérifiez le format.");
      return;
    }

    setIsAnalyzing(true);
    
    setTimeout(() => {
      try {
        const res = runAnalysis(parsedMatches, historiques);
        renderResults(res);
        const newCount = analysisCount + 1;
        setAnalysisCount(newCount);
        store.set('analysisCount', newCount);
        setShowAnalysisInput(false);
      } catch (error) {
        console.error(error);
        alert("Erreur durant l'analyse.");
      } finally {
        setIsAnalyzing(false);
      }
    }, 1200);
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'text-emerald-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 pb-24">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
          VITAL PRONOSTIC
        </h1>
        <div className="text-xs font-mono text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
          CYCLES: {analysisCount}/2
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-8">
        <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
            <Activity size={20} /> Base Historique
          </h2>
          <textarea
            value={histInput}
            onChange={(e) => setHistInput(e.target.value)}
            placeholder="Paste historical results text from Google Lens here..."
            className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-300 focus:outline-none focus:border-emerald-500 transition-colors resize-none font-mono text-sm"
          />
          <button
            onClick={handleSaveHistorique}
            disabled={isSaving || !histInput.trim()}
            className="mt-4 w-full md:w-auto px-8 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-emerald-400 font-semibold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : 'Sauvegarder'}
          </button>
        </section>

        {historiques.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Historiques Enregistrés</h3>
            <div className="grid gap-4">
              {historiques.map(hist => (
                <div key={hist.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors"
                    onClick={() => setExpandedHist(expandedHist === hist.id ? null : hist.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800">
                        <ShieldCheck size={20} className={getRiskColor(hist.risk)} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-200">{hist.preview}</p>
                        <p className="text-xs text-slate-500 font-mono">Stabilité: {hist.stability}%</p>
                      </div>
                    </div>
                    {expandedHist === hist.id ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
                  </div>
                  
                  <AnimatePresence>
                    {expandedHist === hist.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-800 bg-slate-950/50"
                      >
                        <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-slate-500 mb-1">Tendance Globale</p>
                            <p className="text-slate-300">{hist.trend}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 mb-1">Issue Dominante</p>
                            <p className="text-slate-300 font-mono">{hist.dominant}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 mb-1">Moyenne Buts</p>
                            <p className="text-slate-300">{hist.goals}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 mb-1">Niveau de Risque</p>
                            <p className={`font-medium ${getRiskColor(hist.risk)}`}>{hist.risk}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </section>
        )}

        {historiques.length > 0 && !results && (
          <section className="pt-8 border-t border-slate-800">
            {analysisCount >= 2 ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                <AlertTriangle size={32} className="mx-auto text-red-400 mb-3" />
                <h3 className="text-lg font-semibold text-red-400 mb-1">Renouvellement requis</h3>
                <p className="text-slate-400 text-sm">Limite de 2 analyses par session atteinte.</p>
              </div>
            ) : (
              !showAnalysisInput ? (
                <button
                  onClick={() => setShowAnalysisInput(true)}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all transform hover:scale-[1.02]"
                >
                  Prêt pour analyse
                </button>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                >
                  <h3 className="text-lg font-semibold text-emerald-400 mb-4">Cible d'Analyse</h3>
                  <textarea
                    value={matchInput}
                    onChange={(e) => setMatchInput(e.target.value)}
                    placeholder="Paste matches to analyze (Google Lens format)..."
                    className="w-full h-40 bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-300 focus:outline-none focus:border-emerald-500 transition-colors resize-none font-mono text-sm mb-4"
                  />
                  <button
                    onClick={handleRunAnalysis}
                    disabled={isAnalyzing || !matchInput.trim()}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-lg rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? <Loader2 className="animate-spin" size={24} /> : 'Lancer Analyse'}
                  </button>
                </motion.div>
              )
            )}
          </section>
        )}

        {results && (
          <div id="resultsContainer" style={{ display: 'none' }}>
            <AnalysisResult data={results} />
          </div>
        )}
      </div>
    </div>
  );
}
