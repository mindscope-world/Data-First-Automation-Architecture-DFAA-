import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProblemSolution from './components/ProblemSolution';
import DFAALayers from './components/DFAALayers';
import Pricing from './components/Pricing';
import Assessment from './components/Assessment';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import { AssessmentData } from './types';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);

  useEffect(() => {
    // Check local storage or system preference on mount
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setDarkMode(prev => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newMode;
    });
  };

  const handleAssessmentComplete = (data: AssessmentData) => {
    setAssessmentData(data);
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentView === 'dashboard' && assessmentData) {
    return (
      <div className="font-sans antialiased text-slate-900 dark:text-slate-100 min-h-screen selection:bg-datova-500 selection:text-white transition-colors duration-300">
         <Dashboard data={assessmentData} onBack={handleBackToHome} />
      </div>
    );
  }

  return (
    <div className="font-sans antialiased text-slate-900 dark:text-slate-100 min-h-screen selection:bg-datova-500 selection:text-white transition-colors duration-300">
      <Navbar darkMode={darkMode} toggleTheme={toggleTheme} />
      <main>
        <Hero />
        <ProblemSolution />
        <DFAALayers />
        <Pricing />
        <Assessment onComplete={handleAssessmentComplete} />
      </main>
      <Footer />
    </div>
  );
};

export default App;