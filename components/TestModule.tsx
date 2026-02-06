import React, { useState } from 'react';
import { TEST_QUESTIONS_CULPA, TEST_QUESTIONS_ANGUSTIA, TEST_QUESTIONS_IRRITABILIDAD } from '../constants';
import { ProgramType } from '../types';
import { api } from '../src/services/api';

interface TestModuleProps {
  program: ProgramType;
  onComplete: () => void;
  onClose: () => void;
  userId: string;
  weekNumber: number;
}

export const TestModule: React.FC<TestModuleProps> = ({ program, onComplete, onClose, userId, weekNumber }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);

  // Select questions based on program
  let questions = TEST_QUESTIONS_CULPA;
  if (program === 'ANGUSTIA') questions = TEST_QUESTIONS_ANGUSTIA;
  if (program === 'IRRITABILIDAD') questions = TEST_QUESTIONS_IRRITABILIDAD;

  const handleAnswer = async (val: number) => {
    // Optimistic UI update for speed
    const newAnswers = { ...answers, [questions[currentStep].id]: val };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 200);
    } else {
      // Finished
      setSubmitting(true);
      try {
        // Calculate scores based on categories mapping to Schema fields
        // Simple aggregation logic for MVP
        let scoreAutojuicio = 0;
        let scoreCulpaNoAdaptativa = 0;
        let scoreResponsabilidadConsciente = 0;
        let scoreHumanizacionError = 0;

        questions.forEach(q => {
          const ans = newAnswers[q.id] || 0;
          // Mock mapping
          if (q.category === 'Autocastigo' || q.category === 'Somatización') scoreAutojuicio += ans;
          else if (q.category === 'Rumia' || q.category === 'Anticipación Catastrófica') scoreCulpaNoAdaptativa += ans;
          else if (q.category === 'Responsabilidad Excesiva') scoreResponsabilidadConsciente += ans;
          else scoreHumanizacionError += ans; // Resto (Expectativas, Autocompasión, etc)
        });

        const payload = {
          isCompleted: true,
          testResults: {
            scoreAutojuicio,
            scoreCulpaNoAdaptativa,
            scoreResponsabilidadConsciente,
            scoreHumanizacionError
          }
        };

        await api.progress.update(userId, weekNumber, payload);
        onComplete(); // Notify parent to refresh/close
      } catch (err) {
        alert('Error guardando resultados. Intente nuevamente.');
        setSubmitting(false); // Allow retry
      }
    }
  };

  const progress = ((currentStep + 1) / questions.length) * 100;
  const currentQuestion = questions[currentStep];

  // Theme colors... (same as before)
  let themeColor = 'bg-teal-600';
  let themeLight = 'bg-teal-50 text-teal-700 border-teal-500';
  let themeBar = 'bg-teal-400';
  let programTitle = 'Culpa';

  if (program === 'ANGUSTIA') {
    themeColor = 'bg-indigo-600';
    themeLight = 'bg-indigo-50 text-indigo-700 border-indigo-500';
    themeBar = 'bg-indigo-400';
    programTitle = 'Angustia';
  } else if (program === 'IRRITABILIDAD') {
    themeColor = 'bg-orange-600';
    themeLight = 'bg-orange-50 text-orange-700 border-orange-500';
    themeBar = 'bg-orange-400';
    programTitle = 'Irritabilidad';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className={`p-6 text-white flex justify-between items-center ${themeColor}`}>
          <div>
            <h2 className="text-2xl font-bold font-sans">Test de {programTitle}</h2>
            <p className="opacity-90 text-sm">Evaluación RFAI</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold">{currentStep + 1}</span>
            <span className="opacity-75">/{questions.length}</span>
          </div>
        </div>

        <div className="h-2 bg-slate-100 w-full relative">
          <div className={`h-full transition-all duration-500 ease-out ${themeBar}`} style={{ width: `${progress}%` }} />
          {submitting && <div className="absolute inset-0 bg-white/50 animate-pulse"></div>}
        </div>

        <div className="p-8 md:p-12 relative">
          {submitting && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center flex-col gap-2">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-slate-500">Guardando resultados...</p>
            </div>
          )}

          <div className="mb-2 text-xs font-bold uppercase text-slate-400 tracking-wider">
            {currentQuestion.category}
          </div>
          <h3 className="text-xl md:text-2xl text-slate-800 font-medium mb-8 text-center leading-relaxed min-h-[5rem] flex items-center justify-center">
            {currentQuestion.text}
          </h3>

          <div className="grid grid-cols-5 gap-2 md:gap-4 mb-8">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={val}
                onClick={() => !submitting && handleAnswer(val)}
                disabled={submitting}
                className={`
                  flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200
                  ${answers[currentQuestion.id] === val
                    ? `${themeLight} scale-105 shadow-md`
                    : 'border-slate-100 text-slate-400 hover:border-slate-300 hover:bg-slate-50'}
                `}
              >
                <span className="text-2xl font-bold mb-1">{val}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider hidden md:block">
                  {val === 1 ? 'Nunca' : val === 5 ? 'Siempre' : ''}
                </span>
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center mt-8 text-sm text-slate-400">
            <button onClick={onClose} disabled={submitting} className="hover:text-slate-600 disabled:opacity-50">Cancelar</button>
            <div className="flex gap-2 text-xs">
              <span>1 = Muy en desacuerdo</span>
              <span>5 = Muy de acuerdo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
