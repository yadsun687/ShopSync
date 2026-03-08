const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/', protect, restrictTo('admin'), userController.getUsers);
router.delete('/:id', protect, restrictTo('admin'), userController.softDeleteUser);
router.patch('/:id/restore', protect, restrictTo('admin'), userController.restoreUser);

module.exports = router;
