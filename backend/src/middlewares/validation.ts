import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError, z } from 'zod';

// --- MIDDLEWARE GENÉRICO ---

export const validate = (schema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        return next();
    } catch (error) {
        if (error instanceof ZodError) {
            // Respuesta Espejo: Estructura de error controlada
            return res.status(400).json({
                error: 'Validation Error',
                details: error.errors.map(e => ({
                    path: e.path.join('.'),
                    message: e.message
                }))
            });
        }
        return res.status(500).json({ error: 'Internal Server Error during validation' });
    }
};

// --- ESQUEMAS ---

// Validadores de Usuario
export const createUserSchema = z.object({
    body: z.object({
        name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
        email: z.string().email("Formato de correo inválido"),
        role: z.enum(['ADMIN', 'COORDINATOR', 'PROFESSIONAL', 'CLIENT']),
        programasIds: z.array(z.string().uuid()).optional(),
    })
});

// Validadores de Perfil
// Requisito: Fechas de nacimiento no futuras (aunque el schema actual no tiene fechaNacimiento explicita en Perfil DB, validaremos si recibimos fechas en otros campos o agregamos la lógica para futuras implementaciones de fecha nacimiento. 
// Para el ejercicio y types.ts actual, validamos campos existentes.)
// Voy a añadir fechaNacimiento opcional al schema de validación por si se implementa, ya que el prompt lo menciona explícitamente ("Validación de Perfil: Asegurar que las fechas de nacimiento no sean futuras"). 
export const updateProfileSchema = z.object({
    params: z.object({
        userId: z.string().uuid("ID de usuario inválido"),
    }),
    body: z.object({
        nombre: z.string().min(2).optional(),
        documentoId: z.string().min(5).optional(),
        telefono: z.string().regex(/^\+?[\d\s-]{8,}$/, "Teléfono inválido").optional(),
        isapre: z.string().optional(),
        seguroComplementario: z.string().optional(),
        direccion: z.string().min(5).optional(),
        // Validación fecha nacimiento (si viniera en un futuro)
        fechaNacimiento: z.string().datetime().refine((date) => new Date(date) <= new Date(), {
            message: "La fecha de nacimiento no puede ser futura"
        }).optional()
    })
});

// Validadores de Inscripción
export const createInscriptionSchema = z.object({
    body: z.object({
        pacienteId: z.string().uuid("ID de paciente inválido"),
        programaId: z.string().uuid("ID de programa inválido"),
        fechaInicio: z.string().datetime()
    })
});

// Validadores de Progreso (ClientWeekProgress y ClinicalTestResults)
// Requisito: Puntajes estrictamente dentro del rango de la escala clínica.
export const updateProgressSchema = z.object({
    params: z.object({
        progressId: z.string().uuid("ID de progreso inválido").optional(),
        clientId: z.string().uuid("ID de cliente inválido").optional(),
        weekNumber: z.coerce.number().min(1).max(4).optional()
    }),
    body: z.object({
        isCompleted: z.boolean().optional(),
        guideCompleted: z.boolean().optional(),
        audioListenedCount: z.number().min(0).optional(),
        meetingAttended: z.boolean().optional(),

        // Si se envían resultados de tests (incrustados o en endpoint separado)
        testResults: z.object({
            scoreAutojuicio: z.number().min(6).max(30),
            scoreCulpaNoAdaptativa: z.number().min(5).max(25),
            scoreResponsabilidadConsciente: z.number().min(7).max(35),
            scoreHumanizacionError: z.number().min(2).max(10)
        }).optional()
    })
});

// Validar parámetros UUID genéricos
export const uuidParamSchema = z.object({
    params: z.object({
        id: z.string().uuid("El ID proporcionado no es un UUID válido")
    })
});
