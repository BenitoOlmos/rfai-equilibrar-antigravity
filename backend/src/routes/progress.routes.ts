import { Router } from 'express';
import { updateProgress } from '../controllers/progress.controller';
import { validate, updateProgressSchema } from '../middlewares/validation';

const router = Router();

router.put('/:clientId/week/:weekNumber', validate(updateProgressSchema), updateProgress);

export default router;
