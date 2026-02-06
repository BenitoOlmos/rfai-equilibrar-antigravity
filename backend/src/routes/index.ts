import { Router } from 'express';
import userRoutes from './user.routes';
import profileRoutes from './profile.routes';
import inscriptionRoutes from './inscripcion.routes';
import authRoutes from './auth.routes';
import progressRoutes from './progress.routes';
import { healthCheck } from '../controllers/health.controller';

const router = Router();

router.get('/health', healthCheck);

router.use('/users', userRoutes);
router.use('/profiles', profileRoutes);
router.use('/inscriptions', inscriptionRoutes);
router.use('/auth', authRoutes);
router.use('/progress', progressRoutes);

export default router;
