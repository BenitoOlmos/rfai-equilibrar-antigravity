import { Router } from 'express';
import { login } from '../controllers/auth.controller';
import { validate } from '../middlewares/validation';
import { z } from 'zod';

const router = Router();

const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string()
    })
});

router.post('/login', validate(loginSchema), login);

export default router;
