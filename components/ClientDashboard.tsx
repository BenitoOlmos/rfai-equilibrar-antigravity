import React, { useState } from 'react';
import { PacienteConectado, ProgramaNombre } from '../types';
import { CONTENIDO_SESIONES_CULPA, CONTENIDO_SESIONES_ANGUSTIA, CONTENIDO_SESIONES_IRRITABILIDAD } from '../constants';
import { Lock, CheckCircle, Play, FileText, Video, LogOut, Pause, ExternalLink, ChevronRight } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface Props {
  user: PacienteConectado;
  onLogout: () => void;
}

export const ClientDashboard: React.FC<Props> = ({ user, onLogout }) => {
  // Lógica de Negocio: Calcular semana actual
  const fechaInicio = new Date(user.inscripcionActiva.fechaInicio);
  const hoy = new Date();
  const diffTime = Math.abs(hoy.getTime() - fechaInicio.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  const semanaCalculada = Math.min(Math.ceil(diffDays / 7), 4); // Max 4 semanas
  
  const [audioPlaying, setAudioPlaying] = useState<string | null>(null);

  // Selector de contenido
  const nombrePrograma = user.inscripcionActiva.programa?.nombre;
  const esAngustia = nombrePrograma === ProgramaNombre.ANGUSTIA;
  const esIrritabilidad = nombrePrograma === ProgramaNombre.IRRITABILIDAD;
  
  let sesiones = CONTENIDO_SESIONES_CULPA;
  if (esAngustia) sesiones = CONTENIDO_SESIONES_ANGUSTIA;
  if (esIrritabilidad) sesiones = CONTENIDO_SESIONES_IRRITABILIDAD;
  
  // Theme Configuration (Premium Gradients)
  let bgGradient = 'from-cyan-50 to-white';
  let accentGradient = 'from-brand-500 to-brand-600';
  let textAccent = 'text-brand-600';
  let ringColor = 'border-brand-500';
  let badgeColor = 'bg-brand-100 text-brand-700';
  let cardBorderActive = 'border-brand-200';

  if (esAngustia) {
      bgGradient = 'from-indigo-50 to-white';
      accentGradient = 'from-indigo-500 to-indigo-600';
      textAccent = 'text-indigo-600';
      ringColor = 'border-indigo-500';
      badgeColor = 'bg-indigo-100 text-indigo-700';
      cardBorderActive = 'border-indigo-200';
  } else if (esIrritabilidad) {
      bgGradient = 'from-orange-50 to-white';
      accentGradient = 'from-orange-500 to-orange-600';
      textAccent = 'text-orange-600';
      ringColor = 'border-orange-500';
      badgeColor = 'bg-orange-100 text-orange-700';
      cardBorderActive = 'border-orange-200';
  }

  // Inspirational Message
  let quote = "La culpa no es un error de fábrica; es una respuesta aprendida que hoy puede ser reordenada.";
  if (esAngustia) quote = "La angustia no necesita desaparecer, necesita dejar de ser vivida desde el miedo.";
  if (esIrritabilidad) quote = "El enojo es una señal de que algo importa, pero tu reacción es lo que define el resultado.";

  // Meet Link Component
  const MeetCard = ({ title, sub }: { title: string, sub: string }) => (
    <div className={`mt-3 p-4 rounded-2xl bg-gradient-to-r ${accentGradient} text-white shadow-lg shadow-slate-200 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl relative overflow-hidden group cursor-pointer`}>
        <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all"></div>
        <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                    <Video size={20} className="text-white" />
                </div>
                <div>
                    <h4 className="font-bold text-sm md:text-base leading-tight">{title}</h4>
                    <p className="text-[10px] md:text-xs text-white/80 font-medium mt-0.5">{sub}</p>
                </div>
            </div>
            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-white text-brand-600 shadow-sm">
                <ExternalLink size={14} className={esAngustia ? 'text-indigo-600' : esIrritabilidad ? 'text-orange-600' : 'text-brand-600'} />
            </div>
        </div>
        <a href="https://meet.google.com/abc-defg-hij" target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-20" aria-label="Unirse a la reunión"></a>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} font-sans text-slate-800 pb-20`}>
      {/* Navbar with Glass Effect */}
      <nav className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-sm transition-all duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center transition-transform hover:scale-105 duration-300">
                <BrandLogo className="w-full h-full" />
             </div>
             <div>
                <h1 className="text-sm md:text-lg font-bold text-slate-800 tracking-tight leading-none">EQUILIBRAR</h1>
                <p className={`text-[10px] font-extrabold uppercase tracking-widest leading-none mt-1 ${textAccent}`}>
                    {nombrePrograma?.replace('RFAI ', '')}
                </p>
             </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end">
                <span className="font-semibold text-sm text-slate-700">{user.perfil.nombre}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Semana {semanaCalculada}</span>
            </div>
            <div className={`w-9 h-9 md:w-11 md:h-11 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br ${accentGradient}`}>
                {user.avatarPlaceholder}
            </div>
            <button onClick={onLogout} className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-full bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm">
                <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8 md:py-12 sm:px-6">
        
        {/* Header Section with Animation */}
        <div className="mb-10 md:mb-14 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">
            Tu <span className={`bg-clip-text text-transparent bg-gradient-to-r ${accentGradient}`}>Camino</span>
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto text-base md:text-lg leading-relaxed font-medium">
            "{quote}"
          </p>
          
          <div className="mt-6 flex justify-center">
             <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white border border-slate-100 shadow-md text-sm font-bold text-slate-600 transition-transform hover:scale-105 duration-300">
                <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${accentGradient} animate-pulse`}></div>
                Progreso General: {semanaCalculada * 25}%
             </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative space-y-8 md:space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:ml-8 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent z-0">
          {sesiones.map((sesion, index) => {
            const isLocked = sesion.orden > semanaCalculada;
            const isCurrent = sesion.orden === semanaCalculada;
            const isCompleted = sesion.orden < semanaCalculada;
            const animationDelay = `${index * 100}ms`;
            
            // Logic for Meet Link placement
            const showMeetAfter = sesion.orden === 1;  // Week 1: Meet is last step (after resources)
            const showMeetBefore = sesion.orden === 4; // Week 4: Meet is first step (before resources)

            return (
              <div 
                key={sesion.id} 
                className={`relative pl-12 md:pl-20 animate-in slide-in-from-bottom-8 duration-700 fill-mode-backwards`}
                style={{ animationDelay }}
              >
                {/* Timeline Node */}
                <div className={`absolute left-1 md:left-4 top-0 w-8 h-8 md:w-9 md:h-9 rounded-full border-[3px] shadow-sm z-10 flex items-center justify-center transition-all duration-500 bg-white
                    ${isCompleted ? `${textAccent} ${ringColor}` : 
                      isCurrent ? `${textAccent} ${ringColor} scale-110 shadow-lg shadow-brand-100` : 
                      'border-slate-200 text-slate-300'}`}>
                    {isLocked ? <Lock size={12} /> : isCompleted ? <CheckCircle size={16} /> : <span className="font-extrabold text-sm">{sesion.orden}</span>}
                </div>
                
                {/* Content Card */}
                <div className={`p-1 bg-white rounded-3xl transition-all duration-500
                    ${isCurrent ? `shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] ring-1 ring-offset-4 ${cardBorderActive} scale-[1.01]` : 
                      isLocked ? 'opacity-60 grayscale-[0.8]' : 'shadow-sm border border-slate-100 hover:shadow-md'}`}>
                    
                    <div className="p-5 md:p-7 bg-white rounded-[20px]">
                        <div className="flex justify-between items-start mb-5">
                            <div>
                                <span className={`text-[10px] md:text-xs font-extrabold tracking-widest uppercase mb-1 block ${textAccent}`}>Fase {sesion.orden}</span>
                                <h3 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">{sesion.titulo}</h3>
                            </div>
                            {isCurrent && <span className={`px-3 py-1 text-[10px] font-bold rounded-full animate-pulse whitespace-nowrap shadow-sm ${badgeColor}`}>EN CURSO</span>}
                        </div>

                        {!isLocked && (
                            <div className="space-y-3">
                                
                                {/* WEEK 4 SPECIAL: Meet Link APPEARS FIRST (Before resources) */}
                                {showMeetBefore && (
                                    <MeetCard 
                                        title="Sesión de Cierre" 
                                        sub="Reunión final con tu especialista antes del test." 
                                    />
                                )}

                                {/* Resources Grid */}
                                <div className="grid grid-cols-1 gap-3">
                                    {sesion.recursos?.map(recurso => {
                                        if (recurso.tipo === 'AUDIO') {
                                            const isPlaying = audioPlaying === recurso.id;
                                            return (
                                                <div key={recurso.id} className="group relative overflow-hidden p-4 rounded-2xl bg-slate-900 text-white shadow-lg flex items-center justify-between transition-all hover:shadow-xl hover:-translate-y-0.5 cursor-pointer" onClick={() => setAudioPlaying(isPlaying ? null : recurso.id)}>
                                                    <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900 group-hover:scale-105 transition-transform duration-500"></div>
                                                    <div className="relative z-10 flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${isPlaying ? 'bg-white text-slate-900' : `bg-white/10 text-white group-hover:bg-white/20`}`}>
                                                            {isPlaying ? <Pause size={18} fill="currentColor"/> : <Play size={18} fill="currentColor" className="ml-0.5"/>}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold leading-tight">{recurso.titulo}</p>
                                                            <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-wide">Audio Terapéutico</p>
                                                        </div>
                                                    </div>
                                                    {isPlaying && (
                                                        <div className="relative z-10 flex gap-0.5 items-end h-4 mr-2">
                                                            <span className="w-1 bg-brand-400 h-full animate-[bounce_1s_infinite]"></span>
                                                            <span className="w-1 bg-brand-400 h-2/3 animate-[bounce_1.2s_infinite]"></span>
                                                            <span className="w-1 bg-brand-400 h-full animate-[bounce_0.8s_infinite]"></span>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        }
                                        return (
                                             <button key={recurso.id} onClick={() => alert('Abriendo recurso...')} className="flex items-center gap-4 p-3 md:p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-md transition-all group text-left">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-colors bg-white ${textAccent} group-hover:scale-110 duration-200`}>
                                                    {recurso.tipo === 'TEST' ? <FileText size={20} /> : <Video size={20}/>}
                                                </div>
                                                <div className="flex-1">
                                                    <span className="block text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{recurso.titulo || 'Recurso'}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{recurso.tipo === 'TEST' ? 'Evaluación Semanal' : 'Guía Práctica'}</span>
                                                </div>
                                                <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
                                            </button>
                                        )
                                    })}
                                </div>

                                {/* WEEK 1 SPECIAL: Meet Link APPEARS LAST (After resources) */}
                                {showMeetAfter && (
                                    <MeetCard 
                                        title="Sesión de Inicio" 
                                        sub="Reunión con tu especialista para revisar avances." 
                                    />
                                )}

                            </div>
                        )}
                        
                        {isLocked && (
                            <div className="mt-4 p-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-center">
                                <p className="text-xs text-slate-400 font-medium flex items-center justify-center gap-2"><Lock size={14} /> Contenido Bloqueado</p>
                            </div>
                        )}
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
