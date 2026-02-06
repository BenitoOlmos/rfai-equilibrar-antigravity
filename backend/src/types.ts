/**
 * ARQUITECTURA DE DATOS - CLÍNICA EQUILIBRAR
 * Nivel: Definición de Interfaces (TypeScript)
 * Convención: camelCase (API/Frontend) -> snake_case (DB/Backend)
 * Cumplimiento: 3ra Forma Normal (3NF)
 */

// --- ENUMS (Valores permitidos para tipado fuerte) ---

export enum RolSlug {
    ADMIN = 'admin',
    COORDINATOR = 'coordinador',
    PROFESSIONAL = 'profesional',
    CLIENT = 'paciente'
}

export enum ProgramaNombre {
    CULPA = 'RFAI Culpa',
    ANGUSTIA = 'RFAI Angustia',
    IRRITABILIDAD = 'RFAI Irritabilidad'
}

export enum EstadoInscripcion {
    ACTIVO = 'activo',
    COMPLETADO = 'completado',
    CANCELADO = 'cancelado',
    PENDIENTE = 'pendiente'
}

export enum ModalidadCita {
    ONLINE = 'Teleconsulta',
    PRESENCIAL = 'Presencial'
}

// --- ENTIDADES PRINCIPALES (MATRIZ DE CONTROL) ---

/**
 * Define la jerarquía y permisos.
 */
export interface Rol {
    id: string; // UUID
    nombre: string;
    slug: string; // 'admin', 'paciente'
}

/**
 * Cuenta de acceso y seguridad.
 */
export interface Usuario {
    id: string; // UUID
    email: string;
    password?: string; // hash
    rolId: string; // FK -> Rol
    estaActivo: boolean;
    ultimoLogin?: string; // ISO Date

    // Para Profesionales: IDs de programas que dictan
    programasIds?: string[];

    // Hidratación opcional (Join)
    rol?: Rol;
    perfil?: Perfil;
    inscripciones?: Inscripcion[];

    // Datos analíticos (Mock para UI)
    estadisticas?: EstadisticasPaciente;
}

/**
 * Información geográfica normalizada.
 */
export interface Geografia {
    id: string; // UUID
    pais: string;
    region: string;
    comuna: string;
}

/**
 * Datos demográficos y personales del humano detrás del usuario.
 */
export interface Perfil {
    id: string; // UUID
    usuarioId: string; // FK -> Usuario
    nombre: string; // nombre_completo
    documentoId?: string; // DNI/RUT
    telefono?: string;
    geografiaId?: string; // FK -> Geografia

    // Datos Clínicos Administrativos
    isapre?: string;
    seguroComplementario?: string;
    direccion?: string; // Nueva Dirección
}

/**
 * Ubicación física detallada.
 */
export interface Direccion {
    id: string; // UUID
    perfilId: string; // FK -> Perfil
    calle: string;
    numero: string;
}

/**
 * Producto clínico/terapéutico.
 */
export interface Programa {
    id: string; // UUID
    nombre: string; // 'Angustia', 'Culpa'
    descripcion: string;
    precio: number;
    // IDs de recursos asignados al programa
    recursosAsignadosIds?: string[];
}

/**
 * Unidad de contenido secuencial dentro de un programa.
 */
export interface Sesion {
    id: string; // UUID
    programaId: string; // FK -> Programa
    orden: number;
    titulo: string;

    // Hidratación
    recursos?: Recurso[];
}

/**
 * Contrato que vincula a un paciente con un programa.
 */
export interface Inscripcion {
    id: string; // UUID
    pacienteId: string; // FK -> Usuario
    programaId: string; // FK -> Programa
    fechaInicio: string; // Date YYYY-MM-DD
    estado: EstadoInscripcion; // 'activo', etc.

    // Hidratación
    programa?: Programa;
    progreso?: ProgresoSesion[];
}

/**
 * Traza el avance en una sesión específica.
 */
export interface ProgresoSesion {
    id: string; // UUID
    inscripcionId: string; // FK -> Inscripcion
    sesionId: string; // FK -> Sesion
    completado: boolean;
    impacto?: number; // 1-10
}

/**
 * Catálogo de pasarelas de pago.
 */
export interface MetodoPago {
    id: string; // UUID
    nombre: string; // 'Webpay', 'Stripe'
}

/**
 * Registro contable.
 */
export interface Transaccion {
    id: string; // UUID
    inscripcionId: string; // FK -> Inscripcion
    monto: number;
    metodoId: string; // FK -> MetodoPago
}

/**
 * Tipología de archivos (PDF, Audio).
 */
export interface CategoriaRecurso {
    id: string; // UUID
    nombre: string;
}

export type TipoRecurso = 'AUDIO' | 'VIDEO' | 'PDF' | 'TEST' | 'GUIA';

/**
 * Material digital consumible.
 */
export interface Recurso {
    id: string; // UUID
    sesionId?: string; // FK -> Sesion
    categoriaId: string; // FK -> CategoriaRecurso
    url: string;

    // Atributos extra para UI (No estrictos en matriz DB pero necesarios para lógica visual)
    titulo?: string;
    tipo?: TipoRecurso;
}

/**
 * Agenda de citas.
 */
export interface Calendario {
    id: string; // UUID
    profesionalId: string; // FK -> Usuario
    pacienteId: string; // FK -> Usuario
    fechaHora: string; // ISO DateTime
    modalidad: ModalidadCita;
    linkReunion?: string; // Google Meet Link
}

/**
 * Confirmación de asistencia.
 */
export interface Asistencia {
    id: string; // UUID
    calendarioId: string; // FK -> Calendario
    asistio: boolean;
}

/**
 * Seguridad y trazabilidad.
 */
export interface LogAuditoria {
    id: string; // UUID
    usuarioId?: string; // FK -> Usuario
    accion: string;
    tabla: string;
}

/**
 * Definición de instrumento diagnóstico.
 */
export interface Evaluacion {
    id: string; // UUID
    programaId?: string; // FK -> Programa
    tipo: string; // 'Pre', 'Post', 'Seguimiento'
    titulo?: string; // Helper UI
}

/**
 * Data cruda de respuesta de paciente.
 */
export interface Respuesta {
    id: string; // UUID
    evaluacionId: string; // FK -> Evaluacion
    pacienteId: string; // FK -> Usuario
    valor: string; // JSON o Texto plano
}

/**
 * Etiqueta profesional.
 */
export interface Especialidad {
    id: string; // UUID
    nombre: string;
}

/**
 * Mensajería interna.
 */
export interface Notificacion {
    id: string; // UUID
    usuarioId: string; // FK -> Usuario
    mensaje: string;
    estaLeido: boolean;
}

/**
 * NPS o valoración.
 */
export interface Feedback {
    id: string; // UUID
    inscripcionId: string; // FK -> Inscripcion
    puntaje: number; // 1-5
}

/**
 * Legal.
 */
export interface Consentimiento {
    id: string; // UUID
    usuarioId: string; // FK -> Usuario
    version: string;
    aceptado: boolean;
}

/**
 * Estado clínico inicial.
 */
export interface Diagnostico {
    id: string; // UUID
    inscripcionId: string; // FK -> Inscripcion
    descripcion: string;
}

/**
 * Bitácora privada.
 */
export interface NotaClinica {
    id: string; // UUID
    inscripcionId: string; // FK -> Inscripcion
    contenido: string;
}

/**
 * Metas del tratamiento.
 */
export interface Objetivo {
    id: string; // UUID
    inscripcionId: string; // FK -> Inscripcion
    logrado: boolean;
    descripcion?: string; // Helper implícito
}

/**
 * Archivos de paciente.
 */
export interface DocumentoAdjunto {
    id: string; // UUID
    perfilId: string; // FK -> Perfil
    url: string;

    // Datos Clínicos Administrativos
    // (Nota: Se duplicaron campos en tipos originales, limpiando para consistencia con Perfil)
}

/**
 * Mesa de ayuda.
 */
export interface TicketSoporte {
    id: string; // UUID
    usuarioId: string; // FK -> Usuario
    estado: string; // 'abierto', 'cerrado'
}

/**
 * Variables globales.
 */
export interface Configuracion {
    id: string; // UUID
    clave: string;
    valor: string;
}

/**
 * Riesgo clínico.
 */
export interface AlertaClinica {
    id: string; // UUID
    inscripcionId: string; // FK -> Inscripcion
    prioridad: string; // 'Alta', 'Baja'
}

/**
 * Sesión JWT/Auth.
 */
export interface TokenAcceso {
    id: string; // UUID
    usuarioId: string; // FK -> Usuario
    token: string;
    expira: string; // Date
}

// --- ANALYTICS INTERFACES ---

export interface TestResultData {
    semana: string;
    puntaje: number; // 0-100 o escala
}

export interface SesionData {
    fecha: string;
    titulo: string;
    asistencia: 'Asistió' | 'No asistió' | 'Pendiente';
}

export interface EstadisticasPaciente {
    minutosAudioTotal: number;
    diaMasFrecuenteAudio: string;
    avanceSemanal: number; // 1-4
    historialTests: TestResultData[];
    historialSesiones: SesionData[];
}

// --- DTOs / VIEW MODELS (Para uso en Componentes React) ---

export interface UsuarioConectado extends Usuario {
    perfil: Perfil; // Perfil es obligatorio para un usuario conectado
    rol: Rol;
    // Campos computados para UI
    avatarPlaceholder: string;
}

export interface PacienteConectado extends UsuarioConectado {
    inscripcionActiva: Inscripcion; // Debe tener una inscripción para ver el dashboard
}

// --- UI HELPERS ---

export type ProgramType = 'CULPA' | 'ANGUSTIA' | 'IRRITABILIDAD';

export interface GuideQuestion {
    id: string;
    text: string;
    type: 'text' | 'choice';
}

export interface GuideStep {
    title: string;
    description: string;
    questions: GuideQuestion[];
}

export interface TestQuestion {
    id: number;
    text: string;
    category: string;
}
