const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getUsers);
router.delete('/:id', userController.softDeleteUser);
router.patch('/:id/restore', userController.restoreUser);

module.exports = router;
