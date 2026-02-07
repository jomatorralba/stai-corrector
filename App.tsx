import React, { useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import InputGrid from './components/InputGrid';
import ResultsPanel from './components/ResultsPanel';
import { REVERSED_STATE, REVERSED_TRAIT } from './utils/constants';
import { getNormativeData } from './utils/normativeData';
import { StaiResult, Gender, AgeGroup } from './types';

const App: React.FC = () => {
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [result, setResult] = useState<StaiResult | null>(null);
  
  // Profile State
  const [gender, setGender] = useState<Gender>('MALE');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('ADULT');

  const handleValueChange = useCallback((index: number, value: number | null) => {
    setAnswers(prev => ({
      ...prev,
      [index]: value
    }));
    if (result) setResult(null);
  }, [result]);

  const handleProfileChange = () => {
    // If results exist, recalculate them immediately when profile changes
    if (result) {
      // We need to wait for state update or use refs, but in React simpler to just clear result 
      // and let user hit calculate again to ensure they notice the change context.
      // Or we can just calculate on the next render.
      // For safety, let's clear results so they don't see "Female" results while "Male" is selected.
      setResult(null);
    }
  };

  const calculateResults = () => {
    let rawScoreState = 0;
    let rawScoreTrait = 0;
    const missing: number[] = [];

    // Calculate State (1-20)
    for (let i = 1; i <= 20; i++) {
      const val = answers[i];
      if (val === null || val === undefined) {
        missing.push(i);
      } else {
        if (REVERSED_STATE.includes(i)) {
          rawScoreState += (3 - val);
        } else {
          rawScoreState += val;
        }
      }
    }

    // Calculate Trait (21-40)
    for (let i = 21; i <= 40; i++) {
      const val = answers[i];
      if (val === null || val === undefined) {
        missing.push(i);
      } else {
        if (REVERSED_TRAIT.includes(i)) {
          rawScoreTrait += (3 - val);
        } else {
          rawScoreTrait += val;
        }
      }
    }

    if (missing.length > 0) {
      alert(`Por favor, complete los ítems faltantes: ${missing.join(', ')}`);
      return;
    }

    // Lookup Norms based on profile
    const stateNorms = getNormativeData(rawScoreState, ageGroup, gender, 'STATE');
    const traitNorms = getNormativeData(rawScoreTrait, ageGroup, gender, 'TRAIT');

    setResult({
      rawScoreState,
      rawScoreTrait,
      stateNorms,
      traitNorms
    });

    setTimeout(() => {
      document.getElementById('results-anchor')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const resetForm = () => {
    if (window.confirm('¿Estás seguro de que quieres borrar todos los datos?')) {
      setAnswers({});
      setResult(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const filledCount = Object.values(answers).filter(v => v !== null && v !== undefined).length;

  return (
    <div className="min-h-screen pb-20 pt-14">
      <Navbar />
      <ProgressBar filledCount={filledCount} totalCount={40} />
      
      <div className="max-w-[900px] mx-auto px-4 sm:px-6">
        <Header />

        {/* Profile Selection */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-sm font-bold text-neutral-800 uppercase tracking-wider mb-4 border-b pb-2">
            Perfil del Evaluado
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-neutral-500 mb-2">Grupo de Edad</label>
              <div className="flex gap-2">
                <button
                  onClick={() => { setAgeGroup('ADOLESCENT'); handleProfileChange(); }}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    ageGroup === 'ADOLESCENT' 
                    ? 'bg-neutral-800 text-white shadow-md' 
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  Adolescentes
                </button>
                <button
                  onClick={() => { setAgeGroup('ADULT'); handleProfileChange(); }}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    ageGroup === 'ADULT' 
                    ? 'bg-neutral-800 text-white shadow-md' 
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  Adultos
                </button>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-neutral-500 mb-2">Sexo</label>
              <div className="flex gap-2">
                <button
                  onClick={() => { setGender('MALE'); handleProfileChange(); }}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    gender === 'MALE' 
                    ? 'bg-accent text-white shadow-md' 
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  Varón
                </button>
                <button
                  onClick={() => { setGender('FEMALE'); handleProfileChange(); }}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    gender === 'FEMALE' 
                    ? 'bg-accent text-white shadow-md' 
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  Mujer
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InputGrid 
            title="Ansiedad Estado (A-E)"
            startIndex={1}
            endIndex={20}
            reversedIndices={REVERSED_STATE}
            values={answers}
            onChange={handleValueChange}
            description="Valora cómo te sientes AHORA MISMO (0-3). Los ítems marcados (*) son inversos."
          />
          
          <InputGrid 
            title="Ansiedad Rasgo (A-R)"
            startIndex={21}
            endIndex={40}
            reversedIndices={REVERSED_TRAIT}
            values={answers}
            onChange={handleValueChange}
            description="Valora cómo te sientes EN GENERAL (0-3). Los ítems marcados (*) son inversos."
          />
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button 
            onClick={resetForm}
            className="px-6 py-2.5 rounded-lg border border-neutral-300 text-neutral-600 font-medium hover:bg-neutral-50 transition-colors"
          >
            Borrar Todo
          </button>
          <button 
            onClick={calculateResults}
            className="px-6 py-2.5 rounded-lg bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Calcular Resultados
          </button>
        </div>

        <div id="results-anchor">
          {result && <ResultsPanel results={result} />}
        </div>

        <footer className="mt-16 pt-8 border-t border-neutral-200 text-center text-neutral-400 text-xs">
          <p className="mb-2"><strong>Referencias:</strong> Spielberger, C. D., Gorsuch, R. L., & Lushene, R. E. (1982). Manual del STAI.</p>
          <p>Adaptación digital para uso experimental y educativo.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
