import React, { useState, useEffect } from 'react';
import { UsuarioConectado, PacienteConectado, RolSlug } from './types';
import { api } from './src/services/api';
// ALL_USERS removed for login logic, but kept if likely needed for other things (though ideally removed)
import { ClientDashboard } from './components/ClientDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Eye, EyeOff, ArrowRight, HelpCircle, Moon } from 'lucide-react';
import { BrandLogo } from './components/BrandLogo';

const LoginPage: React.FC<{ onLogin: (u: UsuarioConectado) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await api.auth.login(email, password);
      localStorage.setItem('user_session', JSON.stringify(user));
      onLogin(user);
    } catch (err: any) {
      console.error(err);
      setError('Credenciales inválidas o error de servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setLoading(true);
    try {
      const user = await api.auth.login(demoEmail, '123'); // Demo password
      localStorage.setItem('user_session', JSON.stringify(user));
      onLogin(user);
    } catch (err) {
      setError('Error en demo login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-sans relative overflow-hidden">

      {/* Background Decor from design */}
      <div className="absolute top-0 w-full h-full bg-white"></div>

      <div className="w-full max-w-[550px] bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 p-8 md:p-12 relative z-10 flex flex-col items-center">

        {/* Header Logo */}
        <div className="mb-10 w-48 h-48 -mt-24 bg-white rounded-full flex items-center justify-center shadow-sm">
          <BrandLogo className="w-40 h-40 scale-125" />
        </div>

        <h1 className="text-3xl font-light text-slate-800 mb-8 text-center">
          Plataforma <span className="font-bold text-brand-500">RFAI</span>
        </h1>

        <form onSubmit={handleLogin} className="w-full space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 rounded-full bg-slate-50/50 border border-slate-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-200 outline-none transition-all text-slate-600 placeholder:text-slate-300 font-medium"
              placeholder="ejemplo@clinica.com"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 rounded-full bg-slate-50/50 border border-slate-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-200 outline-none transition-all text-slate-600 placeholder:text-slate-300 font-medium tracking-widest"
                placeholder="••••••••"
                disabled={loading}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-brand-500 transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-xs text-center font-medium bg-red-50 py-2 rounded-lg">{error}</p>}

          <button type="submit" disabled={loading} className="w-full py-4 mt-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-full font-bold shadow-lg shadow-brand-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
            {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
          </button>

          <div className="text-center">
            <button type="button" className="text-sm text-slate-400 hover:text-brand-600 transition-colors font-medium">
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </form>

        {/* Demo Section */}
        <div className="mt-12 w-full pt-8 border-t border-slate-50">
          <p className="text-center text-[10px] text-slate-400 mb-2 uppercase font-bold tracking-widest">Demo - Programa Culpa</p>
          <div className="grid grid-cols-4 gap-2 mb-4">
            <button onClick={() => handleDemoLogin('lucia@client.com')} className="py-2 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50 transition-all">S1</button>
            <button onClick={() => handleDemoLogin('carlos@client.com')} className="py-2 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50 transition-all">S2</button>
            <button onClick={() => handleDemoLogin('pedro@client.com')} className="py-2 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50 transition-all">S3</button>
            <button onClick={() => handleDemoLogin('ana@client.com')} className="py-2 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50 transition-all">S4</button>
          </div>

          <p className="text-center text-[10px] text-indigo-400 mb-2 uppercase font-bold tracking-widest">Demo - Programa Angustia</p>
          <div className="grid grid-cols-4 gap-2 mb-4">
            <button onClick={() => handleDemoLogin('paula@angustia.com')} className="py-2 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all">S1</button>
            <button onClick={() => handleDemoLogin('jorge@angustia.com')} className="py-2 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all">S2</button>
            <button onClick={() => handleDemoLogin('camila@angustia.com')} className="py-2 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all">S3</button>
            <button onClick={() => handleDemoLogin('luis@angustia.com')} className="py-2 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all">S4</button>
          </div>

          <p className="text-center text-[10px] text-orange-400 mb-2 uppercase font-bold tracking-widest">Demo - Programa Irritabilidad</p>
          <div className="grid grid-cols-4 gap-2 mb-6">
            <button onClick={() => handleDemoLogin('ignacio@ira.com')} className="py-2 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-all">S1</button>
            <button onClick={() => handleDemoLogin('isabel@ira.com')} className="py-2 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-all">S2</button>
            <button onClick={() => handleDemoLogin('ivan@ira.com')} className="py-2 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-all">S3</button>
            <button onClick={() => handleDemoLogin('irene@ira.com')} className="py-2 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-all">S4</button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => handleDemoLogin('coord@equilibrar.cl')} className="py-3 px-2 rounded-xl bg-slate-50 text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition-all uppercase tracking-wide">
              Coord
            </button>
            <button onClick={() => handleDemoLogin('prof@equilibrar.cl')} className="py-3 px-2 rounded-xl bg-slate-50 text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition-all uppercase tracking-wide">
              Prof
            </button>
            <button onClick={() => handleDemoLogin('admin@equilibrar.cl')} className="py-3 px-2 rounded-xl bg-slate-900 text-white text-[10px] font-bold hover:bg-slate-800 transition-all uppercase tracking-wide">
              Admin
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 mb-4 text-center">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] mb-4">Centro Clínico Equilibrar © 2024</p>
        </div>

      </div>
    </div>
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<UsuarioConectado | null>(null);

  useEffect(() => {
    // Restaurar sesión
    const saved = localStorage.getItem('user_session');
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('user_session');
      }
    }
  }, []);

  const handleLogout = () => {
    api.auth.logout();
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginPage onLogin={setCurrentUser} />;
  }

  // Comprobación de rol usando el slug del objeto Rol
  if (currentUser.rol.slug === RolSlug.CLIENT) {
    // Casting seguro porque sabemos que si es CLIENT tiene inscripciones (en nuestra lógica de negocio)
    return <ClientDashboard user={currentUser as PacienteConectado} onLogout={handleLogout} />;
  }

  // Vistas administrativas
  return <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />;
}
