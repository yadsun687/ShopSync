const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, commentController.getComments);
router.post('/', protect, commentController.createComment);
router.post('/:id/reply', protect, commentController.addReply);

module.exports = router;
