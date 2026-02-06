import { Request, Response } from 'express';
import { prisma } from '../server';
import { RolSlug } from '../types';
import { mapUserToUsuario } from './user.controller';

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { clientProfile: true, inscriptions: { include: { program: true } } }
        });

        // En un caso real, validaríamos password con bcrypt. 
        // Aquí usamos lógica simple como en el mock original o siempre '123' según seed.
        // O aceptamos cualquier password si el email existe (para facilitar demo)
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Role mapping
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
        res.status(500).json({ error: 'Error durante el login' });
    }
};
