import express from 'express';
import { register, login, refreshToken, logout } from '../controllers/auth.controller.js';
import { validateRegister, validateLogin } from '../middleware/validation.middleware.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

export default router;

