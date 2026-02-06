import { Request, Response } from 'express';
import { prisma } from '../server';

export const updateProgress = async (req: Request, res: Response) => {
    const { clientId, weekNumber } = req.params;
    const { isCompleted, guideCompleted, audioListenedCount, meetingAttended, testResults } = req.body;

    try {
        const weekNum = parseInt(weekNumber);

        // 1. Actualizar (o crear) ClientWeekProgress
        const progress = await prisma.clientWeekProgress.upsert({
            where: {
                clientId_weekNumber: {
                    clientId: clientId,
                    weekNumber: weekNum
                }
            },
            update: {
                isCompleted: isCompleted !== undefined ? isCompleted : undefined,
                guideCompleted: guideCompleted !== undefined ? guideCompleted : undefined,
                audioListenedCount: audioListenedCount !== undefined ? audioListenedCount : undefined,
                meetingAttended: meetingAttended !== undefined ? meetingAttended : undefined,
                isLocked: false // Si se actualiza, asumimos desbloqueo si estaba locked? O lógica de negocio aparte.
            },
            create: {
                clientId: clientId,
                weekNumber: weekNum,
                isLocked: false,
                isCompleted: isCompleted || false,
                guideCompleted: guideCompleted || false,
                audioListenedCount: audioListenedCount || 0,
                meetingAttended: meetingAttended || false
            }
        });

        // 2. Si hay resultados de test, guardar en ClinicalTestResult
        if (testResults) {
            await prisma.clinicalTestResult.create({
                data: {
                    clientId: clientId,
                    weekNumber: weekNum,
                    scoreAutojuicio: testResults.scoreAutojuicio,
                    scoreCulpaNoAdaptativa: testResults.scoreCulpaNoAdaptativa,
                    scoreResponsabilidadConsciente: testResults.scoreResponsabilidadConsciente,
                    scoreHumanizacionError: testResults.scoreHumanizacionError,
                    date: new Date()
                }
            });
        }

        res.json(progress);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating progress' });
    }
};
