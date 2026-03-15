import mongoose from 'mongoose';

const replySchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Reply content is required'],
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Allow nested replies (recursive)
replySchema.add({ replies: [replySchema] });

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Comment content is required'],
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    replies: [replySchema],
  },
  { timestamps: true }
);

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
