import React, { useState } from 'react';
import { UsuarioConectado, RolSlug, Programa, Recurso, TipoRecurso, Calendario, EstadoInscripcion, ModalidadCita } from '../types';
import { ALL_USERS, ALL_PROGRAMS, ALL_RESOURCES, MOCK_APPOINTMENTS } from '../constants';
import { Users, Activity, Settings, LogOut, Search, UserPlus, Server, HardDrive, Edit, Trash2, Power, X, Mail, Phone as PhoneIcon, Save, Briefcase, FileText, Plus, Check, Link, Upload, Database, Code, Globe, AlertCircle, Calendar, UserCheck, Shield, User, Clock, Video, MapPin, Lock, Eye, BarChart2, Headphones, TrendingDown, ClipboardList, ExternalLink } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Props {
  currentUser: UsuarioConectado;
  onLogout: () => void;
}

// ==========================================
// SHARED COMPONENTS
// ==========================================
const ModalLayout: React.FC<{ title: string; onClose: () => void; children: React.ReactNode; maxWidth?: string }> = ({ title, onClose, children, maxWidth = 'max-w-lg' }) => (
    <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className={`bg-white w-full ${maxWidth} rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto custom-scrollbar`}>
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4 sticky top-0 bg-white z-10">
                <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"><X size={24}/></button>
            </div>
            {children}
        </div>
    </div>
);

// ==========================================
// NEW: CLINICAL RECORD MODAL (FICHA CLÍNICA)
// ==========================================

const PatientClinicalRecord: React.FC<{ user: UsuarioConectado; onClose: () => void }> = ({ user, onClose }) => {
    const stats = user.estadisticas;
    const inscripcion = user.inscripciones?.[0]; // Asumimos la primera para el MVP
    const programa = inscripcion?.programa;

    if (!stats) return null;

    return (
        <ModalLayout title="Ficha Clínica y Progreso" onClose={onClose} maxWidth="max-w-4xl">
            {/* Header: Datos Administrativos */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6 flex flex-col md:flex-row justify-between gap-6">
                <div className="flex gap-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-xl font-bold text-brand-600 shadow-sm border border-slate-200">
                        {user.avatarPlaceholder}
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-slate-800">{user.perfil.nombre}</h4>
                        <p className="text-sm text-slate-500">{user.email}</p>
                        <div className="flex gap-2 mt-2">
                            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                                {user.perfil.isapre || 'Sin Isapre'}
                            </span>
                             <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                                {user.perfil.seguroComplementario || 'Sin Seguro'}
                            </span>
                        </div>
                        {user.perfil.direccion && (
                            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1"><MapPin size={10}/> {user.perfil.direccion}</p>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Programa Actual</p>
                    <h2 className="text-xl font-bold text-brand-600">{programa?.nombre || 'Sin Asignar'}</h2>
                    <p className="text-sm text-slate-500">Iniciado: {new Date(inscripcion?.fechaInicio || '').toLocaleDateString('es-CL')}</p>
                </div>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-indigo-500"><Clock size={16}/> <span className="text-xs font-bold uppercase">Semana Actual</span></div>
                    <div className="text-2xl font-bold text-slate-800">{stats.avanceSemanal} <span className="text-sm font-normal text-slate-400">/ 4</span></div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-teal-500"><Headphones size={16}/> <span className="text-xs font-bold uppercase">Audio Total</span></div>
                    <div className="text-2xl font-bold text-slate-800">{stats.minutosAudioTotal} <span className="text-sm font-normal text-slate-400">min</span></div>
                </div>
                 <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-orange-500"><Calendar size={16}/> <span className="text-xs font-bold uppercase">Día Frecuente</span></div>
                    <div className="text-xl font-bold text-slate-800">{stats.diaMasFrecuenteAudio}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-rose-500"><TrendingDown size={16}/> <span className="text-xs font-bold uppercase">Sintomatología</span></div>
                    <div className="text-xl font-bold text-green-600">-20% <span className="text-xs text-slate-400 font-normal">vs Inicio</span></div>
                </div>
            </div>

            {/* Chart: Evolución de Tests */}
            <div className="mb-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><BarChart2 size={18} className="text-brand-500"/> Evolución Escala de Malestar (Test Semanal)</h4>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.historialTests}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="semana" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <Tooltip 
                                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                itemStyle={{color: '#0097b2', fontWeight: 'bold'}}
                            />
                            <Line type="monotone" dataKey="puntaje" stroke="#0097b2" strokeWidth={3} dot={{r: 4, fill: '#0097b2', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </ModalLayout>
    );
};

// ==========================================
// 1. GESTIÓN DE USUARIOS
// ==========================================

interface AdminUserManagementProps {
    roleFilter: RolSlug;
    title: string;
}

const AdminUserManagement: React.FC<AdminUserManagementProps> = ({ roleFilter, title }) => {
    // En una app real, filtraríamos desde el backend o usando el estado global.
    const [users, setUsers] = useState(ALL_USERS);
    const [editingUser, setEditingUser] = useState<UsuarioConectado | null>(null);
    const [viewingClinical, setViewingClinical] = useState<UsuarioConectado | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Initial state for new user
    const [newUser, setNewUser] = useState({
        name: '', email: '', password: '', role: roleFilter, phone: '', programs: [] as string[],
        isapre: '', seguro: '', selectedProgramId: '', address: '' // Added Address
    });

    const filteredUsers = users.filter(u => u.rol.slug === roleFilter);

    const handleDelete = (id: string) => {
        if(confirm('¿Confirma la eliminación de este usuario? Esta acción no se puede deshacer.')) {
            setUsers(prev => prev.filter(u => u.id !== id));
        }
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const id = `u-${Date.now()}`;
        
        let roleId = 'r-4'; // Default Client
        let roleName = 'Paciente';
        if (newUser.role === RolSlug.ADMIN) { roleId = 'r-1'; roleName = 'Administrador'; }
        if (newUser.role === RolSlug.COORDINATOR) { roleId = 'r-2'; roleName = 'Coordinador'; }
        if (newUser.role === RolSlug.PROFESSIONAL) { roleId = 'r-3'; roleName = 'Profesional'; }

        // Logic to link program if Client
        const selectedProg = ALL_PROGRAMS.find(p => p.id === newUser.selectedProgramId);
        const inscripciones = selectedProg && roleId === 'r-4' ? [{
            id: `ins-${id}`, pacienteId: id, programaId: selectedProg.id, fechaInicio: new Date().toISOString(),
            estado: EstadoInscripcion.ACTIVO, programa: selectedProg, progreso: []
        }] : undefined;

        const created: UsuarioConectado = {
            id,
            email: newUser.email,
            password: newUser.password,
            estaActivo: true,
            rolId: roleId,
            rol: { id: roleId, nombre: roleName, slug: newUser.role as RolSlug },
            perfil: { 
                id: `pf-${id}`, usuarioId: id, nombre: newUser.name, telefono: newUser.phone,
                isapre: newUser.isapre, seguroComplementario: newUser.seguro, direccion: newUser.address
            },
            programasIds: newUser.role === RolSlug.PROFESSIONAL ? newUser.programs : undefined,
            avatarPlaceholder: newUser.name.charAt(0).toUpperCase() + (newUser.name.split(' ')[1]?.charAt(0) || ''),
            inscripciones,
            estadisticas: { minutosAudioTotal: 0, diaMasFrecuenteAudio: '-', avanceSemanal: 1, historialTests: [], historialSesiones: [] }
        };
        setUsers([...users, created]);
        setIsCreating(false);
        setNewUser({ name: '', email: '', password: '', role: roleFilter, phone: '', programs: [], isapre: '', seguro: '', selectedProgramId: '', address: '' });
    };

    const handleUpdate = (updated: UsuarioConectado) => {
        setUsers(users.map(u => u.id === updated.id ? updated : u));
        setEditingUser(null);
    };

    const toggleProgram = (progId: string) => {
        setNewUser(prev => {
            const exists = prev.programs.includes(progId);
            return {
                ...prev,
                programs: exists ? prev.programs.filter(id => id !== progId) : [...prev.programs, progId]
            }
        });
    };

    return (
        <div className="h-full flex flex-col bg-slate-50">
            <div className="bg-white p-4 border-b border-slate-100 sticky top-0 z-10 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="font-bold text-xl text-slate-800">{title}</h2>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={() => setIsCreating(true)} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
                        <UserPlus size={18} /> <span className="hidden sm:inline">Nuevo</span>
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto pb-24">
                {filteredUsers.length === 0 && (
                    <div className="text-center py-10 text-slate-400">
                        <p>No hay usuarios registrados con este rol.</p>
                    </div>
                )}
                {filteredUsers.map(u => (
                    <div key={u.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs border border-white shadow-sm">
                                {u.avatarPlaceholder}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">{u.perfil.nombre}</h4>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-1">
                                    <span>{u.email}</span>
                                    {u.perfil.telefono && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span className="flex items-center gap-1"><PhoneIcon size={10}/> {u.perfil.telefono}</span>
                                        </>
                                    )}
                                </div>
                                {u.rol.slug === RolSlug.CLIENT && (
                                    <div className="flex flex-col gap-1 mt-1">
                                        <div className="flex gap-2">
                                            <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">{u.perfil.isapre || 'Sin Isapre'}</span>
                                            <span className="text-[10px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">{u.perfil.seguroComplementario || 'Sin Seguro'}</span>
                                        </div>
                                        {u.perfil.direccion && <span className="text-[10px] text-slate-400 flex items-center gap-1"><MapPin size={10}/> {u.perfil.direccion}</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-slate-50 pt-3 sm:pt-0">
                             <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${u.estaActivo ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {u.estaActivo ? 'Activo' : 'Inactivo'}
                            </span>
                            {u.rol.slug === RolSlug.CLIENT && (
                                <button onClick={() => setViewingClinical(u)} className="p-2 hover:bg-brand-50 hover:text-brand-600 rounded-xl text-slate-400 transition-colors border border-transparent hover:border-brand-100" title="Ver Ficha Clínica">
                                    <Eye size={16}/>
                                </button>
                            )}
                            <button onClick={() => setEditingUser(u)} className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl text-slate-400 transition-colors border border-transparent hover:border-indigo-100"><Edit size={16}/></button>
                            <button onClick={() => handleDelete(u.id)} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-xl text-slate-400 transition-colors border border-transparent hover:border-red-100"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>

            {viewingClinical && <PatientClinicalRecord user={viewingClinical} onClose={() => setViewingClinical(null)} />}
            {editingUser && <UserEditModal user={editingUser} onSave={handleUpdate} onClose={() => setEditingUser(null)} currentUserRole={RolSlug.ADMIN} />}
            {isCreating && (
                <ModalLayout title={`Crear ${title.slice(0, -1)}`} onClose={() => setIsCreating(false)}>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre Completo</label>
                            <input required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-brand-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                            <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-brand-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input required type="text" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-brand-500 outline-none" placeholder="123" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teléfono</label>
                                <input value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-brand-500 outline-none" />
                            </div>
                        </div>

                        {roleFilter === RolSlug.CLIENT && (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                                <p className="text-xs font-bold text-brand-600 uppercase mb-2">Datos Clínicos</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Isapre/Prev</label>
                                        <input value={newUser.isapre} onChange={e => setNewUser({...newUser, isapre: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Ej: Colmena" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Seguro Compl.</label>
                                        <input value={newUser.seguro} onChange={e => setNewUser({...newUser, seguro: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Ej: MetLife" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dirección</label>
                                        <input value={newUser.address} onChange={e => setNewUser({...newUser, address: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Calle, Número, Comuna" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Programa a Cursar</label>
                                    <select value={newUser.selectedProgramId} onChange={e => setNewUser({...newUser, selectedProgramId: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-500">
                                        <option value="">Seleccione un programa...</option>
                                        {ALL_PROGRAMS.map(prog => (
                                            <option key={prog.id} value={prog.id}>{prog.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {roleFilter === RolSlug.PROFESSIONAL && (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Asignar Programas (Imparte)</label>
                                <div className="space-y-2">
                                    {ALL_PROGRAMS.map(prog => (
                                        <label key={prog.id} className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={newUser.programs.includes(prog.id)} 
                                                onChange={() => toggleProgram(prog.id)}
                                                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                            />
                                            <span className="text-sm text-slate-700">{prog.nombre}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <input type="hidden" value={roleFilter} />
                        
                        <button type="submit" className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl mt-4 hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all">Crear Usuario</button>
                    </form>
                </ModalLayout>
            )}
        </div>
    );
};

// ==========================================
// 2. GESTIÓN DE PROGRAMAS (Actualizado con Selección de Recursos)
// ==========================================

const AdminProgramManagement: React.FC = () => {
    const [programs, setPrograms] = useState<Programa[]>(ALL_PROGRAMS);
    const [editingProg, setEditingProg] = useState<Programa | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState<Partial<Programa>>({ recursosAsignadosIds: [] });

    const handleDelete = (id: string) => {
        if(confirm('¿Eliminar este programa?')) {
            setPrograms(prev => prev.filter(p => p.id !== id));
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (isCreating) {
            const newProg: Programa = {
                id: `p-${Date.now()}`,
                nombre: formData.nombre || 'Nuevo Programa',
                descripcion: formData.descripcion || '',
                precio: Number(formData.precio) || 0,
                recursosAsignadosIds: formData.recursosAsignadosIds || []
            };
            setPrograms([...programs, newProg]);
        } else if (editingProg) {
            setPrograms(prev => prev.map(p => p.id === editingProg.id ? { ...p, ...formData } as Programa : p));
        }
        setEditingProg(null);
        setIsCreating(false);
        setFormData({ recursosAsignadosIds: [] });
    };

    const openEdit = (prog: Programa) => {
        setEditingProg(prog);
        setFormData(prog);
    };

    const toggleRecurso = (resId: string) => {
        setFormData(prev => {
            const current = prev.recursosAsignadosIds || [];
            if (current.includes(resId)) {
                return { ...prev, recursosAsignadosIds: current.filter(id => id !== resId) };
            } else {
                return { ...prev, recursosAsignadosIds: [...current, resId] };
            }
        });
    };

    // Helper UI for Resource Checkbox
    const ResourceSelector = ({ type, title, icon: Icon }: { type: TipoRecurso, title: string, icon: any }) => (
        <div className="mb-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2"><Icon size={12}/> {title}</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar border border-slate-100 rounded-xl p-2 bg-slate-50">
                {ALL_RESOURCES.filter(r => r.tipo === type).map(res => (
                    <label key={res.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-slate-100 rounded">
                        <input 
                            type="checkbox" 
                            checked={(formData.recursosAsignadosIds || []).includes(res.id)}
                            onChange={() => toggleRecurso(res.id)}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="text-xs text-slate-700 truncate">{res.titulo}</span>
                    </label>
                ))}
            </div>
        </div>
    );

    return (
        <div className="h-full bg-slate-50 flex flex-col">
            <div className="bg-white p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                <h2 className="font-bold text-xl text-slate-800">Programas Clínicos</h2>
                <button onClick={() => setIsCreating(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                    <Plus size={18} /> Crear Programa
                </button>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-24">
                {programs.map(prog => (
                    <div key={prog.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative group hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                                <Briefcase size={24} />
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEdit(prog)} className="p-2 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-colors"><Edit size={16}/></button>
                                <button onClick={() => handleDelete(prog.id)} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-colors"><Trash2 size={16}/></button>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">{prog.nombre}</h3>
                        <p className="text-sm text-slate-500 mb-4 h-10 line-clamp-2">{prog.descripcion}</p>
                        
                        {/* Protocolo Clínico Display */}
                        <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                             <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Recursos Asignados</h4>
                             <div className="flex flex-wrap gap-2">
                                 {(prog.recursosAsignadosIds || []).length > 0 ? (
                                     <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded">
                                         {(prog.recursosAsignadosIds || []).length} items
                                     </span>
                                 ) : (
                                     <span className="text-xs text-slate-400">Sin recursos seleccionados</span>
                                 )}
                             </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Valor Programa</span>
                            <span className="text-lg font-bold text-slate-800">${prog.precio.toLocaleString('es-CL')}</span>
                        </div>
                    </div>
                ))}
            </div>

            {(isCreating || editingProg) && (
                <ModalLayout title={isCreating ? "Nuevo Programa" : "Editar Programa"} onClose={() => { setIsCreating(false); setEditingProg(null); }}>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre del Programa</label>
                            <input required value={formData.nombre || ''} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none" placeholder="Ej: RFAI Ansiedad" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descripción</label>
                            <textarea required value={formData.descripcion || ''} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none h-20 resize-none" placeholder="Objetivos del programa..." />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Precio (CLP)</label>
                            <input required type="number" value={formData.precio || ''} onChange={e => setFormData({...formData, precio: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none" placeholder="250000" />
                        </div>

                        {/* Resource Selection Area */}
                        <div className="border-t border-slate-100 pt-4 mt-2">
                            <h3 className="text-sm font-bold text-slate-800 mb-3">Asignación de Recursos</h3>
                            <ResourceSelector type="AUDIO" title="Audios Terapéuticos" icon={Headphones} />
                            <ResourceSelector type="GUIA" title="Guías de Trabajo" icon={ClipboardList} />
                            <ResourceSelector type="TEST" title="Evaluaciones" icon={FileText} />
                        </div>

                        <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl mt-4 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">Guardar</button>
                    </form>
                </ModalLayout>
            )}
        </div>
    );
};

// ==========================================
// 3. GESTIÓN DE DOCUMENTOS (RECURSOS)
// ==========================================

const AdminDocumentManagement: React.FC = () => {
    const [resources, setResources] = useState<Recurso[]>(ALL_RESOURCES);
    const [filter, setFilter] = useState<'ALL' | 'AUDIO' | 'TEST' | 'GUIA'>('ALL');
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState<Partial<Recurso>>({ tipo: 'AUDIO', categoriaId: 'AUDIO' });

    const handleDelete = (id: string) => {
        if(confirm('¿Eliminar recurso permanentemente?')) {
            setResources(prev => prev.filter(r => r.id !== id));
        }
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const newRes: Recurso = {
            id: `rec-${Date.now()}`,
            titulo: formData.titulo || 'Sin Título',
            url: formData.url || '#',
            tipo: formData.tipo as any,
            categoriaId: formData.tipo as any, // Simplifying mapping
        };
        setResources([newRes, ...resources]);
        setIsCreating(false);
        setFormData({ tipo: 'AUDIO', categoriaId: 'AUDIO' });
    };

    const filtered = resources.filter(r => filter === 'ALL' || r.tipo === filter);

    return (
        <div className="h-full bg-slate-50 flex flex-col">
            <div className="bg-white p-4 border-b border-slate-100 flex flex-col gap-4 sticky top-0 z-10">
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-xl text-slate-800">Biblioteca de Recursos</h2>
                    <button onClick={() => setIsCreating(true)} className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200">
                        <Upload size={18} /> Subir
                    </button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {['ALL', 'AUDIO', 'TEST', 'GUIA'].map(type => (
                        <button 
                            key={type} 
                            onClick={() => setFilter(type as any)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filter === type ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                            {type === 'ALL' ? 'Todos' : type}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto">
                {filtered.map(res => (
                    <div key={res.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${res.tipo === 'AUDIO' ? 'bg-indigo-500' : res.tipo === 'TEST' ? 'bg-rose-500' : 'bg-teal-500'}`}>
                                {res.tipo === 'AUDIO' ? <HardDrive size={20}/> : res.tipo === 'TEST' ? <FileText size={20}/> : <Briefcase size={20}/>}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">{res.titulo}</h4>
                                <a href={res.url} className="text-xs text-brand-500 hover:underline flex items-center gap-1"><Link size={10}/> {res.url}</a>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleDelete(res.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>

            {isCreating && (
                <ModalLayout title="Subir Nuevo Recurso" onClose={() => setIsCreating(false)}>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Título del Recurso</label>
                            <input required value={formData.titulo || ''} onChange={e => setFormData({...formData, titulo: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-teal-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo</label>
                            <select value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-teal-500 outline-none">
                                <option value="AUDIO">Audio (MP3)</option>
                                <option value="TEST">Evaluación</option>
                                <option value="GUIA">Guía PDF/Texto</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">URL / Enlace Cloud</label>
                            <input required value={formData.url || ''} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-teal-500 outline-none" placeholder="https://..." />
                        </div>
                        <button type="submit" className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl mt-4 hover:bg-teal-700 shadow-lg shadow-teal-200 transition-all">Subir Archivo</button>
                    </form>
                </ModalLayout>
            )}
        </div>
    );
};

// ==========================================
// 4. CALENDARIO (Actualizado con Lógica de Negocio y Link)
// ==========================================

const AdminCalendarView: React.FC = () => {
    const [citas, setCitas] = useState<Calendario[]>(MOCK_APPOINTMENTS);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState<Calendario | null>(null);

    // Form Data States
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [meetLink, setMeetLink] = useState('https://meet.google.com/abc-defg-hij');
    const [sessionType, setSessionType] = useState('1'); // '1' = Inicio, '4' = Cierre

    // Patients List
    const patients = ALL_USERS.filter(u => u.rol.slug === RolSlug.CLIENT);

    // Derived Logic: Get Program based on Patient Selection
    const selectedPatient = patients.find(p => p.id === selectedPatientId);
    const patientProgramName = selectedPatient?.inscripciones?.[0]?.programa?.nombre || 'Sin Programa';

    const handleDelete = (id: string) => {
        if(confirm('¿Cancelar esta cita?')) {
            setCitas(prev => prev.filter(c => c.id !== id));
        }
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPatientId || !appointmentDate || !appointmentTime) return;

        const dateObj = new Date(`${appointmentDate}T${appointmentTime}`);
        
        const newCita: Calendario = {
            id: `cal-${Date.now()}`,
            profesionalId: 'u-prof', // Hardcoded for Demo
            pacienteId: selectedPatientId,
            fechaHora: dateObj.toISOString(),
            modalidad: ModalidadCita.ONLINE,
            linkReunion: meetLink
        };

        setCitas([...citas, newCita]);
        setIsCreating(false);
        resetForm();
    };

    const handleEditSave = (e: React.FormEvent) => {
        e.preventDefault();
        if(!isEditing) return;
        
        const dateObj = new Date(`${appointmentDate}T${appointmentTime}`);

        setCitas(prev => prev.map(c => c.id === isEditing.id ? {
            ...c,
            fechaHora: dateObj.toISOString(),
            linkReunion: meetLink
        } : c));

        setIsEditing(null);
        resetForm();
    };

    const openEdit = (cita: Calendario) => {
        setIsEditing(cita);
        const d = new Date(cita.fechaHora);
        // Format for input datetime-local logic (simplified split)
        const datePart = d.toISOString().split('T')[0];
        const timePart = d.toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'});
        
        setAppointmentDate(datePart);
        setAppointmentTime(timePart);
        setMeetLink(cita.linkReunion || 'https://meet.google.com/abc-defg-hij');
        setSelectedPatientId(cita.pacienteId); // Read only in edit usually
    };

    const resetForm = () => {
        setSelectedPatientId('');
        setAppointmentDate('');
        setAppointmentTime('');
        setMeetLink('https://meet.google.com/abc-defg-hij');
        setSessionType('1');
    };

    const getProfessionalName = (id: string) => ALL_USERS.find(u => u.id === id)?.perfil.nombre || 'Desconocido';
    const getPatientName = (id: string) => ALL_USERS.find(u => u.id === id)?.perfil.nombre || 'Desconocido';

    return (
        <div className="h-full bg-slate-50 flex flex-col">
            <div className="bg-white p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
                <h2 className="font-bold text-xl text-slate-800">Calendario Clínico</h2>
                <div className="flex gap-2">
                    <button onClick={() => setIsCreating(true)} className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200">
                        <Plus size={18} /> Nueva Cita
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto">
                {citas.length === 0 && <p className="text-center text-slate-400 py-10">No hay citas programadas.</p>}
                
                {citas.map(cita => (
                    <div key={cita.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center justify-center w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
                                <span className="text-xs font-bold uppercase">{new Date(cita.fechaHora).toLocaleString('es-CL', {month: 'short'}).slice(0,3)}</span>
                                <span className="text-xl font-bold">{new Date(cita.fechaHora).getDate()}</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                                    <Clock size={12}/> {new Date(cita.fechaHora).toLocaleTimeString('es-CL', {hour: '2-digit', minute: '2-digit'})} hrs
                                    <span className="text-slate-300">•</span>
                                    {cita.modalidad === 'Teleconsulta' ? <Video size={12}/> : <MapPin size={12}/>} {cita.modalidad}
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                    {getPatientName(cita.pacienteId)} 
                                    <span className="text-slate-300 font-normal">con</span>
                                    <span className="text-brand-600">{getProfessionalName(cita.profesionalId)}</span>
                                </h3>
                                {cita.linkReunion && (
                                    <a href={cita.linkReunion} target="_blank" rel="noreferrer" className="text-xs text-brand-600 hover:underline flex items-center gap-1 mt-1">
                                        <ExternalLink size={10}/> {cita.linkReunion}
                                    </a>
                                )}
                            </div>
                        </div>
                        <div className="w-full md:w-auto flex justify-end gap-2">
                            <button onClick={() => openEdit(cita)} className="px-4 py-2 rounded-xl border border-indigo-100 text-indigo-600 text-sm font-bold hover:bg-indigo-50 transition-colors">Editar</button>
                            <button onClick={() => handleDelete(cita.id)} className="px-4 py-2 rounded-xl border border-red-100 text-red-500 text-sm font-bold hover:bg-red-50 transition-colors">Cancelar</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            {isCreating && (
                <ModalLayout title="Nueva Cita Clínica" onClose={() => { setIsCreating(false); resetForm(); }}>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Paciente</label>
                            <select required value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-brand-500 outline-none">
                                <option value="">Seleccione Paciente...</option>
                                {patients.map(p => (
                                    <option key={p.id} value={p.id}>{p.perfil.nombre}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Auto-detected Info Box */}
                        <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                             <p className="text-xs text-indigo-800 font-bold mb-1">Programa Detectado:</p>
                             <p className="text-sm text-indigo-600">{patientProgramName}</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Sesión (Protocolo)</label>
                            <select value={sessionType} onChange={e => setSessionType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-brand-500 outline-none">
                                <option value="1">Sesión 1 - Inicio de Tratamiento</option>
                                <option value="4">Sesión 4 - Cierre de Tratamiento</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha</label>
                                <input required type="date" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-brand-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hora</label>
                                <input required type="time" value={appointmentTime} onChange={e => setAppointmentTime(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-brand-500 outline-none" />
                            </div>
                        </div>

                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Link de Reunión (Google Meet)</label>
                            <input required value={meetLink} onChange={e => setMeetLink(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-brand-500 outline-none text-slate-600" />
                        </div>

                        <button type="submit" className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl mt-4 hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all">Agendar Cita</button>
                    </form>
                </ModalLayout>
            )}

            {/* Edit Modal */}
            {isEditing && (
                 <ModalLayout title="Editar Cita" onClose={() => { setIsEditing(null); resetForm(); }}>
                    <form onSubmit={handleEditSave} className="space-y-4">
                        <div className="p-3 bg-slate-100 rounded-xl mb-4">
                             <p className="text-xs font-bold text-slate-500 uppercase">Paciente</p>
                             <p className="font-bold text-slate-700">{getPatientName(isEditing.pacienteId)}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha</label>
                                <input required type="date" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-brand-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hora</label>
                                <input required type="time" value={appointmentTime} onChange={e => setAppointmentTime(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-brand-500 outline-none" />
                            </div>
                        </div>

                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Link de Reunión (Google Meet)</label>
                            <input required value={meetLink} onChange={e => setMeetLink(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-brand-500 outline-none text-slate-600" />
                        </div>

                        <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl mt-4 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">Guardar Cambios</button>
                    </form>
                 </ModalLayout>
            )}
        </div>
    );
};

// ==========================================
// USER EDIT MODAL (Reused/Updated)
// ==========================================

const UserEditModal: React.FC<{ user: UsuarioConectado; onSave: (u: UsuarioConectado) => void; onClose: () => void; currentUserRole: RolSlug }> = ({ user, onSave, onClose, currentUserRole }) => {
    const [formData, setFormData] = useState({
        nombre: user.perfil.nombre,
        email: user.email,
        password: user.password || '',
        telefono: user.perfil.telefono || '',
        estaActivo: user.estaActivo,
        programs: user.programasIds || [],
        isapre: user.perfil.isapre || '',
        seguro: user.perfil.seguroComplementario || '',
        selectedProgramId: user.inscripciones?.[0]?.programaId || '',
        address: user.perfil.direccion || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        let inscripcionesUpdate = user.inscripciones;
        
        // Update program logic for Client
        if (user.rol.slug === RolSlug.CLIENT && formData.selectedProgramId) {
             const selectedProg = ALL_PROGRAMS.find(p => p.id === formData.selectedProgramId);
             if (selectedProg) {
                // Simplified Logic: Replace inscription
                inscripcionesUpdate = [{
                    id: `ins-${user.id}`, pacienteId: user.id, programaId: selectedProg.id, fechaInicio: new Date().toISOString(),
                    estado: EstadoInscripcion.ACTIVO, programa: selectedProg, progreso: []
                }];
             }
        }

        onSave({
            ...user,
            email: formData.email,
            password: formData.password,
            estaActivo: formData.estaActivo,
            programasIds: user.rol.slug === RolSlug.PROFESSIONAL ? formData.programs : undefined,
            inscripciones: inscripcionesUpdate,
            perfil: { 
                ...user.perfil, 
                nombre: formData.nombre, 
                telefono: formData.telefono,
                isapre: formData.isapre,
                seguroComplementario: formData.seguro,
                direccion: formData.address // Save Address
            }
        });
        onClose();
    };

    const toggleProgram = (progId: string) => {
        setFormData(prev => {
            const exists = prev.programs.includes(progId);
            return {
                ...prev,
                programs: exists ? prev.programs.filter(id => id !== progId) : [...prev.programs, progId]
            }
        });
    };

    return (
        <ModalLayout title="Editar Usuario" onClose={onClose}>
             <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-4 mb-4 p-4 bg-slate-50 rounded-2xl">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center font-bold text-slate-500 shadow-sm">{user.avatarPlaceholder}</div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">ID: {user.id}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <button type="button" onClick={() => setFormData(p => ({...p, estaActivo: !p.estaActivo}))} className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 transition-colors ${formData.estaActivo ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                                <Power size={10}/> {formData.estaActivo ? 'Activo' : 'Inactivo'}
                            </button>
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre</label>
                    <input value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-brand-500 outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                    <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-brand-500 outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contraseña</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-brand-500 outline-none" type="text" />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teléfono</label>
                    <input value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-brand-500 outline-none" />
                </div>

                {/* Patient Specific Fields */}
                {user.rol.slug === RolSlug.CLIENT && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                        <p className="text-xs font-bold text-brand-600 uppercase mb-2">Datos Clínicos</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Isapre/Prev</label>
                                <input value={formData.isapre} onChange={e => setFormData({...formData, isapre: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Seguro Compl.</label>
                                <input value={formData.seguro} onChange={e => setFormData({...formData, seguro: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dirección</label>
                                <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Programa</label>
                            <select value={formData.selectedProgramId} onChange={e => setFormData({...formData, selectedProgramId: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-500">
                                <option value="">Seleccione...</option>
                                {ALL_PROGRAMS.map(prog => (
                                    <option key={prog.id} value={prog.id}>{prog.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {user.rol.slug === RolSlug.PROFESSIONAL && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Asignar Programas</label>
                        <div className="space-y-2">
                            {ALL_PROGRAMS.map(prog => (
                                <label key={prog.id} className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.programs.includes(prog.id)} 
                                        onChange={() => toggleProgram(prog.id)}
                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-slate-700">{prog.nombre}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                <div className="pt-4 flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50">Cancelar</button>
                    <button type="submit" className="flex-1 bg-brand-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-brand-700 transition-colors">Guardar</button>
                </div>
            </form>
        </ModalLayout>
    );
};

// ==========================================
// 5. GLOBAL PANEL
// ==========================================

const AdminGlobalPanel: React.FC = () => {
    const totalPatients = ALL_USERS.filter(u => u.rol.slug === RolSlug.CLIENT).length;
    const totalProf = ALL_USERS.filter(u => u.rol.slug === RolSlug.PROFESSIONAL).length;
    const totalActive = ALL_USERS.filter(u => u.rol.slug === RolSlug.CLIENT && u.estaActivo).length;
    const totalPrograms = ALL_PROGRAMS.length;

    const data = [
        { name: 'Ene', value: 12 },
        { name: 'Feb', value: 19 },
        { name: 'Mar', value: 15 },
        { name: 'Abr', value: 22 },
        { name: 'May', value: 30 },
        { name: 'Jun', value: 28 },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pacientes</p>
                            <h3 className="text-3xl font-bold text-slate-800 mt-2">{totalPatients}</h3>
                        </div>
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Users size={24} /></div>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-xs text-green-600 font-bold">
                        <Activity size={12} /> +12% vs mes anterior
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profesionales</p>
                            <h3 className="text-3xl font-bold text-slate-800 mt-2">{totalProf}</h3>
                        </div>
                        <div className="p-3 bg-teal-50 text-teal-600 rounded-xl"><User size={24} /></div>
                    </div>
                     <div className="mt-4 flex items-center gap-1 text-xs text-slate-400 font-medium">
                        Activos en plataforma
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pacientes Activos</p>
                            <h3 className="text-3xl font-bold text-slate-800 mt-2">{totalActive}</h3>
                        </div>
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Activity size={24} /></div>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-xs text-slate-400 font-medium">
                        En tratamiento actualmente
                    </div>
                </div>

                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Programas</p>
                            <h3 className="text-3xl font-bold text-slate-800 mt-2">{totalPrograms}</h3>
                        </div>
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><Briefcase size={24} /></div>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-xs text-slate-400 font-medium">
                        Disponibles
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><BarChart2 size={18} className="text-indigo-500"/> Ingreso de Pacientes (Semestral)</h4>
                    <div className="h-64 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Clock size={18} className="text-slate-400"/> Actividad Reciente</h4>
                    <div className="space-y-4">
                        {[1,2,3,4,5].map(i => (
                            <div key={i} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">U</div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700 leading-tight">Nuevo paciente registrado</p>
                                    <p className="text-xs text-slate-400 mt-1">Hace {i * 2} horas</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// MAIN DASHBOARD LAYOUT
// ==========================================

export const AdminDashboard: React.FC<Props> = ({ currentUser, onLogout }) => {
    const [activeTab, setActiveTab] = useState('global');

    const MenuButton = ({ id, icon: Icon, label, indent = false }: { id: string, icon: any, label?: string, indent?: boolean }) => (
        <button 
            onClick={() => setActiveTab(id)} 
            className={`w-full p-3 rounded-2xl transition-all flex items-center justify-center md:justify-start gap-3 group relative ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} ${indent ? 'md:pl-6' : ''}`}
            title={label}
        >
            <Icon size={indent ? 18 : 22} className={indent && activeTab !== id ? 'opacity-70' : ''} />
            <span className="hidden md:block font-medium text-sm">{label}</span>
            {/* Tooltip for mobile/collapsed */}
            <span className="md:hidden absolute left-14 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap">
                {label}
            </span>
        </button>
    );

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden font-sans text-slate-800">
             <aside className="hidden md:flex w-20 md:w-64 bg-slate-900 text-white flex-col items-center md:items-start py-6 gap-8 z-20 shadow-xl transition-all duration-300">
                <div className="w-full px-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-900/50 shrink-0">A.</div>
                    <span className="hidden md:block font-bold text-lg tracking-tight">Admin<span className="text-indigo-400">Panel</span></span>
                </div>

                <nav className="flex-1 flex flex-col gap-2 w-full px-3 overflow-y-auto custom-scrollbar">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-1 mt-2 hidden md:block">Principal</div>
                    <MenuButton id="global" icon={Activity} label="Panel Global" />
                    
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-1 mt-4 hidden md:block">Usuarios</div>
                    
                    {/* Admin Only: Admins & Coordinators */}
                    {currentUser.rol.slug === RolSlug.ADMIN && (
                        <>
                            <MenuButton id="users-admin" icon={Shield} label="Administradores" />
                            <MenuButton id="users-coord" icon={UserCheck} label="Coordinadores" />
                        </>
                    )}

                    {/* Admin & Coordinator Only: Professionals */}
                    {(currentUser.rol.slug === RolSlug.ADMIN || currentUser.rol.slug === RolSlug.COORDINATOR) && (
                        <MenuButton id="users-prof" icon={User} label="Profesionales" />
                    )}

                    {/* Everyone: Patients */}
                    <MenuButton id="users-client" icon={Users} label="Pacientes" />

                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-1 mt-4 hidden md:block">Clínica</div>
                    <MenuButton id="programs" icon={Briefcase} label="Programas" />
                    <MenuButton id="calendar" icon={Calendar} label="Calendario" />
                    <MenuButton id="docs" icon={HardDrive} label="Documentos" />
                </nav>

                <div className="w-full px-3">
                    <button onClick={onLogout} className="w-full p-3 rounded-2xl text-slate-400 hover:text-red-400 hover:bg-slate-800 flex items-center justify-center md:justify-start gap-3 transition-colors">
                        <LogOut size={20}/>
                        <span className="hidden md:block font-medium text-sm">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

             <main className="flex-1 relative bg-slate-50 overflow-hidden flex flex-col">
                <div className="h-full overflow-y-auto">
                    {activeTab === 'global' && <div className="p-4 md:p-8"><AdminGlobalPanel /></div>}
                    
                    {/* Vistas de Usuarios por Rol */}
                    {activeTab === 'users-admin' && <AdminUserManagement roleFilter={RolSlug.ADMIN} title="Administradores" />}
                    {activeTab === 'users-coord' && <AdminUserManagement roleFilter={RolSlug.COORDINATOR} title="Coordinadores" />}
                    {activeTab === 'users-prof' && <AdminUserManagement roleFilter={RolSlug.PROFESSIONAL} title="Profesionales" />}
                    {activeTab === 'users-client' && <AdminUserManagement roleFilter={RolSlug.CLIENT} title="Pacientes" />}

                    {/* Vistas Clínica */}
                    {activeTab === 'programs' && <AdminProgramManagement />}
                    {activeTab === 'calendar' && <AdminCalendarView />}
                    {activeTab === 'docs' && <AdminDocumentManagement />}
                </div>
             </main>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-50">
                <button onClick={() => setActiveTab('global')} className={`p-2 rounded-xl ${activeTab === 'global' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}><Activity size={24}/></button>
                <button onClick={() => setActiveTab('users-client')} className={`p-2 rounded-xl ${activeTab.includes('users') ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}><Users size={24}/></button>
                <button onClick={() => setActiveTab('calendar')} className={`p-2 rounded-xl ${activeTab === 'calendar' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}><Calendar size={24}/></button>
                <button onClick={() => setActiveTab('programs')} className={`p-2 rounded-xl ${activeTab === 'programs' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}><Briefcase size={24}/></button>
                <button onClick={onLogout} className="p-2 text-slate-400"><LogOut size={24}/></button>
            </div>
        </div>
    );
};