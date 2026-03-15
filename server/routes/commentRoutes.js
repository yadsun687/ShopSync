import express from 'express';
import * as commentController from '../controllers/commentController.js';

const router = express.Router();

router.get('/', commentController.getComments);
router.post('/', commentController.createComment);
router.post('/:id/reply', commentController.addReply);

export default router;
