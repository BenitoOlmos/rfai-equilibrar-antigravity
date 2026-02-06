import { Router } from 'express';
import { updateProfile } from '../controllers/profile.controller';

const router = Router();

router.put('/:userId', updateProfile);

export default router;
