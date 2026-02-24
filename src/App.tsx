import { useState, useEffect } from 'react';
import Intro from './components/Intro';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import { store } from './lib/store';

export default function App() {
  const [view, setView] = useState<'intro' | 'home' | 'dashboard'>('intro');

  useEffect(() => {
    const hasSeenIntro = store.get('hasSeenIntro', false);
    if (hasSeenIntro) {
      const isUnlocked = store.get('isUnlocked', false);
      setView(isUnlocked ? 'dashboard' : 'home');
    } else {
      setView('intro');
    }
  }, []);

  const handleIntroComplete = () => {
    store.set('hasSeenIntro', true);
    setView('home');
  };

  const handleUnlock = () => {
    store.set('isUnlocked', true);
    setView('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30">
      {view === 'intro' && <Intro onComplete={handleIntroComplete} />}
      {view === 'home' && <Home onUnlock={handleUnlock} />}
      {view === 'dashboard' && <Dashboard />}
    </div>
  );
}
