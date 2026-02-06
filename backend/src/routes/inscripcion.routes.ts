import { Router } from 'express';
import { createInscription } from '../controllers/inscripcion.controller';
import { validate, createInscriptionSchema } from '../middlewares/validation';

const router = Router();

router.post('/', validate(createInscriptionSchema), createInscription);

export default router;
