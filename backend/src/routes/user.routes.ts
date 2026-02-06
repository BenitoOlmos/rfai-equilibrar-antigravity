import { Router } from 'express';
import { getUsers, getUserById, createUser } from '../controllers/user.controller';
import { validate, createUserSchema, uuidParamSchema } from '../middlewares/validation';

const router = Router();

router.get('/', getUsers);
router.get('/:id', validate(uuidParamSchema), getUserById);
router.post('/', validate(createUserSchema), createUser);

export default router;
