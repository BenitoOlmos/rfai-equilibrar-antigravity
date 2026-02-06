import { Request, Response } from 'express';
import { prisma } from '../server';
import { z } from 'zod';
import { Usuario, RolSlug, Rol } from '../types';

// Validaciones Zod
const CreateUserSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    role: z.enum(['ADMIN', 'COORDINATOR', 'PROFESSIONAL', 'CLIENT']),
    programasIds: z.array(z.string()).optional(), // Para profesionales
});

// Helper para mapear User de Prisma a Usuario de types.ts
export const mapUserToUsuario = (prismaUser: any, roleSlug: RolSlug): Usuario => {
    const rol: Rol = {
        id: prismaUser.role === 'ADMIN' ? 'r-1' :
            prismaUser.role === 'COORDINATOR' ? 'r-2' :
                prismaUser.role === 'PROFESSIONAL' ? 'r-3' : 'r-4',
        nombre: prismaUser.role,
        slug: roleSlug
    };

    return {
        id: prismaUser.id,
        email: prismaUser.email,
        rolId: rol.id,
        estaActivo: prismaUser.status === 'ACTIVE',
        rol: rol,
        // Hidratar perfil si viene incluido
        perfil: prismaUser.clientProfile ? {
            id: prismaUser.clientProfile.userId, // Usando userId como id de perfil o generar uno
            usuarioId: prismaUser.id,
            nombre: prismaUser.name,
            telefono: prismaUser.clientProfile.phone || undefined,
            documentoId: prismaUser.clientProfile.documentId || undefined,
            isapre: prismaUser.clientProfile.isapre || undefined,
            seguroComplementario: prismaUser.clientProfile.insurance || undefined,
            direccion: prismaUser.clientProfile.address || undefined
        } : undefined
    };
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            include: { clientProfile: true }
        });

        const mappedUsers = users.map(u => {
            // Determinar slug basado en enum
            let slug = RolSlug.CLIENT;
            if (u.role === 'ADMIN') slug = RolSlug.ADMIN;
            if (u.role === 'COORDINATOR') slug = RolSlug.COORDINATOR;
            if (u.role === 'PROFESSIONAL') slug = RolSlug.PROFESSIONAL;

            return mapUserToUsuario(u, slug);
        });

        res.json(mappedUsers);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            include: { clientProfile: true, inscriptions: { include: { program: true } } }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let slug = RolSlug.CLIENT;
        if (user.role === 'ADMIN') slug = RolSlug.ADMIN;
        if (user.role === 'COORDINATOR') slug = RolSlug.COORDINATOR;
        if (user.role === 'PROFESSIONAL') slug = RolSlug.PROFESSIONAL;

        const mappedUser = mapUserToUsuario(user, slug);

        // Mapear inscripciones
        if (user.inscriptions && user.inscriptions.length > 0) {
            mappedUser.inscripciones = user.inscriptions.map(ins => ({
                id: ins.id,
                pacienteId: ins.patientId,
                programaId: ins.programId,
                fechaInicio: ins.startDate.toISOString().split('T')[0],
                estado: ins.status as any,
                programa: {
                    id: ins.program.id,
                    nombre: ins.program.name,
                    descripcion: ins.program.description,
                    precio: ins.program.price
                }
            }));
        }

        res.json(mappedUser);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user' });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const data = CreateUserSchema.parse(req.body);

        // Crear usuario
        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                role: data.role as any,
                status: 'ACTIVE'
            }
        });

        // Crear perfil vacío si es cliente
        if (data.role === 'CLIENT') {
            await prisma.clientProfile.create({
                data: {
                    userId: user.id,
                    startDate: new Date()
                }
            });
        }

        res.status(201).json(user);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Error creating user' });
    }
};
