import express from 'express';
import * as userController from '../controllers/userController.js';

const router = express.Router();

router.get('/', userController.getUsers);
router.delete('/:id', userController.softDeleteUser);
router.patch('/:id/restore', userController.restoreUser);

export default router;
