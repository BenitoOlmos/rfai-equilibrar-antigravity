import { UsuarioConectado, PacienteConectado, RolSlug, ProgramaNombre, EstadoInscripcion, Recurso, Sesion, TestQuestion, Programa, Calendario, ModalidadCita, EstadisticasPaciente } from './types';

// --- ROLES BASE ---
const ROL_ADMIN = { id: 'r-1', nombre: 'Administrador', slug: RolSlug.ADMIN };
const ROL_COORD = { id: 'r-2', nombre: 'Coordinador', slug: RolSlug.COORDINATOR };
const ROL_PROF = { id: 'r-3', nombre: 'Profesional', slug: RolSlug.PROFESSIONAL };
const ROL_CLIENT = { id: 'r-4', nombre: 'Paciente', slug: RolSlug.CLIENT };

// --- PROGRAMAS (PRECIOS ACTUALIZADOS) ---
export const PROG_CULPA: Programa = { id: 'p-1', nombre: ProgramaNombre.CULPA, descripcion: 'Tratamiento focalizado en culpa y responsabilidad excesiva.', precio: 250000, recursosAsignadosIds: [] };
export const PROG_ANGUSTIA: Programa = { id: 'p-2', nombre: ProgramaNombre.ANGUSTIA, descripcion: 'Tratamiento focalizado en angustia y crisis de pánico.', precio: 250000, recursosAsignadosIds: [] };
export const PROG_IRRITABILIDAD: Programa = { id: 'p-3', nombre: ProgramaNombre.IRRITABILIDAD, descripcion: 'Tratamiento focalizado en manejo de ira, reactividad y control de impulsos.', precio: 250000, recursosAsignadosIds: [] };

export const ALL_PROGRAMS: Programa[] = [PROG_CULPA, PROG_ANGUSTIA, PROG_IRRITABILIDAD];

// --- SESIONES & RECURSOS (LÓGICA CLÍNICA ACTUALIZADA) ---

// Helper para crear sesiones dinámicas con reglas de negocio:
// - Audios: 1 para semanas 1-2, 1 para semanas 3-4.
// - Tests y Guías: Todas las semanas.
const crearSesionesMock = (progId: string, titulos: string[]): Sesion[] => {
    return titulos.map((titulo, idx) => {
        const semana = idx + 1;
        // Lógica de Audios Bimensuales
        const audioFase = semana <= 2 ? 1 : 2;
        const audioTitulo = semana <= 2 ? 'Audio Fase 1: Fundamentos y Calma' : 'Audio Fase 2: Profundización y Hábito';
        
        return {
            id: `s-${progId}-${semana}`,
            programaId: progId,
            orden: semana,
            titulo: titulo,
            recursos: [
                { id: `rec-${progId}-audio-fase-${audioFase}`, categoriaId: 'AUDIO', url: '#', titulo: audioTitulo, tipo: 'AUDIO' },
                { id: `rec-${progId}-${idx}-test`, categoriaId: 'TEST', url: '#', titulo: `Test de Monitoreo Semanal`, tipo: 'TEST' },
                { id: `rec-${progId}-${idx}-guia`, categoriaId: 'GUIA', url: '#', titulo: `Guía de Trabajo Semana ${semana}`, tipo: 'GUIA' }
            ]
        };
    });
};

// Contenido específico por programa
export const CONTENIDO_SESIONES_CULPA = crearSesionesMock(PROG_CULPA.id, [
    'Comprender la Señal', 'Regulación Emocional', 'Restitución del Vínculo', 'Integración y Cierre'
]);

export const CONTENIDO_SESIONES_ANGUSTIA = crearSesionesMock(PROG_ANGUSTIA.id, [
    'Desactivar la Alerta', 'Seguridad Interna', 'Exposición Gradual', 'Confianza Total'
]);

export const CONTENIDO_SESIONES_IRRITABILIDAD = crearSesionesMock(PROG_IRRITABILIDAD.id, [
    'Identificar el Detonante', 'Enfriar la Reacción', 'Comunicación Asertiva', 'Paz Mental Sostenible'
]);

// Extract all resources for Admin Dashboard
export const ALL_RESOURCES: Recurso[] = [
    ...CONTENIDO_SESIONES_CULPA.flatMap(s => s.recursos || []),
    ...CONTENIDO_SESIONES_ANGUSTIA.flatMap(s => s.recursos || []),
    ...CONTENIDO_SESIONES_IRRITABILIDAD.flatMap(s => s.recursos || [])
];

// --- USUARIOS STAFF ---

export const MOCK_ADMIN: UsuarioConectado = {
  id: 'u-admin', email: 'admin@equilibrar.cl', password: '123', rolId: ROL_ADMIN.id, estaActivo: true,
  rol: ROL_ADMIN,
  perfil: { id: 'pf-admin', usuarioId: 'u-admin', nombre: 'Benito Olmos', telefono: '+56900000000' },
  avatarPlaceholder: 'BO'
};

export const MOCK_COORD: UsuarioConectado = {
  id: 'u-coord', email: 'coord@equilibrar.cl', password: '123', rolId: ROL_COORD.id, estaActivo: true,
  rol: ROL_COORD,
  perfil: { id: 'pf-coord', usuarioId: 'u-coord', nombre: 'Sol Elgueta' },
  avatarPlaceholder: 'SE'
};

export const MOCK_PROF: UsuarioConectado = {
  id: 'u-prof', email: 'prof@equilibrar.cl', password: '123', rolId: ROL_PROF.id, estaActivo: true,
  rol: ROL_PROF,
  programasIds: [PROG_CULPA.id, PROG_ANGUSTIA.id, PROG_IRRITABILIDAD.id], // Claudio hace los 3 programas
  perfil: { id: 'pf-prof', usuarioId: 'u-prof', nombre: 'Claudio Reyes' },
  avatarPlaceholder: 'CR'
};

// --- HELPER DATES FOR WEEKS ---
const today = new Date();
const week1Date = today.toISOString();
const week2Date = new Date(today.getTime() - (8 * 24 * 60 * 60 * 1000)).toISOString(); // 8 days ago
const week3Date = new Date(today.getTime() - (15 * 24 * 60 * 60 * 1000)).toISOString(); // 15 days ago
const week4Date = new Date(today.getTime() - (23 * 24 * 60 * 60 * 1000)).toISOString(); // 23 days ago

// --- GENERADORES DE ESTADÍSTICAS MOCK ---
const generarEstadisticas = (semanasAvance: number): EstadisticasPaciente => {
    const minutosBase = 45;
    const historialTests = [];
    const historialSesiones = [];
    
    // Generar datos históricos
    for (let i = 1; i <= semanasAvance; i++) {
        // Score mejora con el tiempo (simulación clínica positiva)
        const score = Math.max(20, 80 - (i * 10) + Math.floor(Math.random() * 10)); 
        historialTests.push({ semana: `S${i}`, puntaje: score });
        
        historialSesiones.push({
            fecha: new Date(today.getTime() - ((semanasAvance - i) * 7 * 24 * 60 * 60 * 1000)).toLocaleDateString('es-CL'),
            titulo: `Sesión Clínica Sem ${i}`,
            asistencia: 'Asistió'
        });
    }

    return {
        minutosAudioTotal: minutosBase * weeksToDays(semanasAvance),
        diaMasFrecuenteAudio: ['Lunes', 'Miércoles', 'Domingo', 'Jueves'][Math.floor(Math.random() * 4)],
        avanceSemanal: semanasAvance,
        historialTests,
        historialSesiones
    };
};

function weeksToDays(weeks: number) { return weeks * 3; } // Approx days listened

// --- PACIENTES (NOMBRES COMPLETOS Y DIRECCIONES) ---

const crearPaciente = (id: string, nombre: string, email: string, prog: Programa, fechaInicio: string, isapre: string, seguro: string, semanas: number, direccion: string): PacienteConectado => ({
    id, email, password: '123', rolId: ROL_CLIENT.id, estaActivo: true,
    rol: ROL_CLIENT,
    perfil: { 
        id: `pf-${id}`, usuarioId: id, nombre, telefono: '+56912345678',
        isapre, seguroComplementario: seguro, direccion: direccion
    },
    avatarPlaceholder: nombre.charAt(0) + (nombre.split(' ')[1]?.charAt(0) || ''),
    inscripciones: [{
        id: `ins-${id}`, pacienteId: id, programaId: prog.id, fechaInicio, estado: EstadoInscripcion.ACTIVO,
        programa: prog,
        progreso: [] 
    }],
    inscripcionActiva: {
        id: `ins-${id}`, pacienteId: id, programaId: prog.id, fechaInicio, estado: EstadoInscripcion.ACTIVO,
        programa: prog
    },
    estadisticas: generarEstadisticas(semanas)
});

// Patients defined in Login Screen (Updated with Addresses)
export const ALL_USERS: UsuarioConectado[] = [
    MOCK_ADMIN, MOCK_COORD, MOCK_PROF,
    // Programa Culpa
    crearPaciente('c-1', 'Lucía Fernández Soto', 'lucia@client.com', PROG_CULPA, week1Date, 'Colmena', 'MetLife', 1, 'Av. Providencia 1234, Santiago'),
    crearPaciente('c-2', 'Carlos Díaz Muñoz', 'carlos@client.com', PROG_CULPA, week2Date, 'Cruz Blanca', 'Sin Seguro', 2, 'Calle Falsa 123, Ñuñoa'),
    crearPaciente('c-3', 'Pedro Pascal Olivo', 'pedro@client.com', PROG_CULPA, week3Date, 'Fonasa', 'BCI Seguros', 3, 'Los Leones 45, Providencia'),
    crearPaciente('c-4', 'Ana Ruiz Tagle', 'ana@client.com', PROG_CULPA, week4Date, 'Banmédica', 'Zurich', 4, 'El Bosque 555, Las Condes'),
    // Programa Angustia
    crearPaciente('c-a1', 'Paula Angustia Vera', 'paula@angustia.com', PROG_ANGUSTIA, week1Date, 'Consalud', 'Sin Seguro', 1, 'Alameda 333, Santiago'),
    crearPaciente('c-a2', 'Jorge Angustia Lagos', 'jorge@angustia.com', PROG_ANGUSTIA, week2Date, 'Fonasa', 'Chilena Consolidada', 2, 'Irarrázaval 500, Ñuñoa'),
    crearPaciente('c-a3', 'Camila Angustia Perez', 'camila@angustia.com', PROG_ANGUSTIA, week3Date, 'Colmena', 'MetLife', 3, 'Vitacura 9000, Vitacura'),
    crearPaciente('c-a4', 'Luis Angustia Molina', 'luis@angustia.com', PROG_ANGUSTIA, week4Date, 'Cruz Blanca', 'Sin Seguro', 4, 'Pajaritos 22, Maipú'),
    // Programa Irritabilidad
    crearPaciente('c-i1', 'Ignacio Ira Varas', 'ignacio@ira.com', PROG_IRRITABILIDAD, week1Date, 'Banmédica', 'Confuturo', 1, 'Tobalaba 100, Providencia'),
    crearPaciente('c-i2', 'Isabel Ira Silva', 'isabel@ira.com', PROG_IRRITABILIDAD, week2Date, 'Fonasa', 'Sin Seguro', 2, 'Gran Avenida 40, San Miguel'),
    crearPaciente('c-i3', 'Iván Ira Castro', 'ivan@ira.com', PROG_IRRITABILIDAD, week3Date, 'Consalud', 'Sura', 3, 'Vicuña Mackenna 10, Santiago'),
    crearPaciente('c-i4', 'Irene Ira Rojas', 'irene@ira.com', PROG_IRRITABILIDAD, week4Date, 'Nueva Masvida', 'MetLife', 4, 'Apoquindo 3000, Las Condes'),
];

// --- HELPER PARA TESTS Y GUIAS ---

export const TEST_QUESTIONS_CULPA: TestQuestion[] = [
    { id: 1, text: 'Me siento responsable de cosas que no controlo', category: 'Responsabilidad Excesiva' },
    { id: 2, text: 'Me cuesta perdonarme mis errores pasados', category: 'Autocompasión' },
    { id: 3, text: 'Siento que decepciono a los demás', category: 'Expectativas' },
    { id: 4, text: 'Pienso mucho en lo que "debería" haber hecho', category: 'Rumia' },
    { id: 5, text: 'Creo que merezco castigo cuando fallo', category: 'Autocastigo' }
];

export const TEST_QUESTIONS_ANGUSTIA: TestQuestion[] = [
    { id: 1, text: 'Siento opresión en el pecho o dificultad para respirar', category: 'Somatización' },
    { id: 2, text: 'Tengo miedo constante de que algo malo suceda', category: 'Anticipación Catastrófica' },
    { id: 3, text: 'Me cuesta relajarme o estar quieto', category: 'Agitación' },
    { id: 4, text: 'Siento inseguridad al enfrentar situaciones nuevas', category: 'Seguridad' },
    { id: 5, text: 'Duermo mal pensando en mis problemas', category: 'Sueño' }
];

export const TEST_QUESTIONS_IRRITABILIDAD: TestQuestion[] = [
    { id: 1, text: 'Reacciono con rabia ante situaciones pequeñas', category: 'Reactividad' },
    { id: 2, text: 'Siento que los demás hacen cosas para molestarme', category: 'Percepción Hostil' },
    { id: 3, text: 'Me cuesta calmarme una vez que me he enojado', category: 'Regulación' },
    { id: 4, text: 'He dicho cosas hirientes de las que luego me arrepiento', category: 'Impulsividad' },
    { id: 5, text: 'Siento tensión física (mandíbula, puños) frecuentemente', category: 'Somatización' }
];

// --- CALENDARIO MOCK (LÓGICA ACTUALIZADA) ---
// Claudio Reyes atiende:
// Semana 1: Después de test inicial y guía (Inicio tratamiento)
// Semana 4: Antes de test final y guía (Cierre tratamiento)
// Las semanas intermedias (2 y 3) son de auto-trabajo.

const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(10, 0, 0);
const dayAfter = new Date(); dayAfter.setDate(dayAfter.getDate() + 2); dayAfter.setHours(15, 30, 0);
const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 5); nextWeek.setHours(11, 0, 0);

const GOOGLE_MEET_LINK = "https://meet.google.com/abc-defg-hij";

export const MOCK_APPOINTMENTS: Calendario[] = [
    // Pacientes en Semana 1 (Tienen cita de inicio)
    { id: 'cal-1', profesionalId: 'u-prof', pacienteId: 'c-1', fechaHora: tomorrow.toISOString(), modalidad: ModalidadCita.ONLINE, linkReunion: GOOGLE_MEET_LINK }, // Lucía (S1)
    { id: 'cal-2', profesionalId: 'u-prof', pacienteId: 'c-a1', fechaHora: dayAfter.toISOString(), modalidad: ModalidadCita.PRESENCIAL }, // Paula (S1)
    { id: 'cal-3', profesionalId: 'u-prof', pacienteId: 'c-i1', fechaHora: nextWeek.toISOString(), modalidad: ModalidadCita.ONLINE, linkReunion: GOOGLE_MEET_LINK }, // Ignacio (S1)

    // Pacientes en Semana 4 (Tienen cita de cierre)
    { id: 'cal-4', profesionalId: 'u-prof', pacienteId: 'c-4', fechaHora: tomorrow.toISOString(), modalidad: ModalidadCita.ONLINE, linkReunion: GOOGLE_MEET_LINK }, // Ana (S4)
    { id: 'cal-5', profesionalId: 'u-prof', pacienteId: 'c-a4', fechaHora: dayAfter.toISOString(), modalidad: ModalidadCita.PRESENCIAL }, // Luis (S4)
    
    // NOTA: Pacientes de Semana 2 y 3 no tienen citas agendadas por protocolo.
];