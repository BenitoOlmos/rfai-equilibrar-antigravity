import { Router } from 'express';
import { createInscription } from '../controllers/inscripcion.controller';

const router = Router();

router.post('/', createInscription);

export default router;
