const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const loginLimiter = require('../utils/rateLimiter');

router.post('/register', authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;
