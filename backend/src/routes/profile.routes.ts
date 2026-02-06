import { Router } from 'express';
import { updateProfile } from '../controllers/profile.controller';
import { validate, updateProfileSchema } from '../middlewares/validation';

const router = Router();

router.put('/:userId', validate(updateProfileSchema), updateProfile);

export default router;
