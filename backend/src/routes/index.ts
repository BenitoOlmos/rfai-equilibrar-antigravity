import { Router } from 'express';
import userRoutes from './user.routes';
import profileRoutes from './profile.routes';
import inscriptionRoutes from './inscripcion.routes';

const router = Router();

router.use('/users', userRoutes);
router.use('/profiles', profileRoutes);
router.use('/inscriptions', inscriptionRoutes);

export default router;
