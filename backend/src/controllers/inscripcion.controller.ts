import { Request, Response } from 'express';
import { prisma } from '../server';
import { z } from 'zod';
import { Inscripcion } from '../types';

const CreateInscriptionSchema = z.object({
    pacienteId: z.string().uuid(),
    programaId: z.string().uuid(),
    fechaInicio: z.string().datetime(), // ISO String
});

export const createInscription = async (req: Request, res: Response) => {
    try {
        const data = CreateInscriptionSchema.parse(req.body);

        const inscription = await prisma.inscription.create({
            data: {
                patientId: data.pacienteId,
                programId: data.programaId,
                startDate: new Date(data.fechaInicio),
                status: 'active'
            },
            include: { program: true }
        });

        const mappedInscription: Inscripcion = {
            id: inscription.id,
            pacienteId: inscription.patientId,
            programaId: inscription.programId,
            fechaInicio: inscription.startDate.toISOString().split('T')[0],
            estado: inscription.status as any,
            programa: {
                id: inscription.program.id,
                nombre: inscription.program.name,
                descripcion: inscription.program.description,
                precio: inscription.program.price
            }
        };

        res.status(201).json(mappedInscription);

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        res.status(500).json({ error: 'Error creating inscription' });
    }
};
