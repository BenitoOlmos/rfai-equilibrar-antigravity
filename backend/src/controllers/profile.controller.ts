import { Request, Response } from 'express';
import { prisma } from '../server';
import { z } from 'zod';
import { Perfil } from '../types';

const UpdateProfileSchema = z.object({
    nombre: z.string().optional(),
    documentoId: z.string().optional(),
    telefono: z.string().optional(),
    isapre: z.string().optional(),
    seguroComplementario: z.string().optional(),
    direccion: z.string().optional(),
});

export const updateProfile = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const data = UpdateProfileSchema.parse(req.body);

        const updatedProfile = await prisma.clientProfile.update({
            where: { userId },
            data: {
                documentId: data.documentoId,
                phone: data.telefono,
                isapre: data.isapre,
                insurance: data.seguroComplementario,
                address: data.direccion
                // Nombre está en tabla users, no en clientProfile. Necesitamos actualizar user también.
            },
            include: { user: true }
        });

        if (data.nombre) {
            await prisma.user.update({
                where: { id: userId },
                data: { name: data.nombre }
            });
            updatedProfile.user.name = data.nombre;
        }

        const mappedProfile: Perfil = {
            id: updatedProfile.userId, // El mismo ID que el usuario por ser 1:1 en schema
            usuarioId: updatedProfile.userId,
            nombre: updatedProfile.user.name,
            documentoId: updatedProfile.documentId || undefined,
            telefono: updatedProfile.phone || undefined,
            isapre: updatedProfile.isapre || undefined,
            seguroComplementario: updatedProfile.insurance || undefined,
            direccion: updatedProfile.address || undefined
        };

        res.json(mappedProfile);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Error updating profile' });
    }
};
