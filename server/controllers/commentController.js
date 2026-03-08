const Comment = require('../models/commentModel');

// GET /api/comments?productId=xxx
exports.getComments = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.productId) {
      filter.productId = req.query.productId;
    }
    const comments = await Comment.find(filter);
    res.status(200).json({ status: 'success', data: { comments } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/comments
exports.createComment = async (req, res, next) => {
  try {
    const { content, productId } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }
    const comment = await Comment.create({
      content,
      productId,
      authorId: req.user._id,
    });
    res.status(201).json({ status: 'success', data: { comment } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/comments/:id/reply
exports.addReply = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Reply content is required' });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const reply = {
      content,
      authorId: req.user._id,
    };

    comment.replies.push(reply);
    await comment.save();

    const savedReply = comment.replies[comment.replies.length - 1];
    res.status(201).json({ status: 'success', data: { reply: savedReply } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
