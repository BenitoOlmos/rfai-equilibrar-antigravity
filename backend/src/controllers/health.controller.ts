import { Request, Response } from 'express';
import { prisma } from '../server';

export const healthCheck = async (req: Request, res: Response) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'OK', database: 'Connected', timestamp: new Date().toISOString() });
    } catch (error) {
        res.status(500).json({ status: 'ERROR', database: 'Disconnected' });
    }
};
