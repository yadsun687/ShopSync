import express from 'express';
import * as authController from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import loginLimiter from '../utils/rateLimiter.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);
router.patch('/change-password', protect, authController.changePassword);

export default router;
