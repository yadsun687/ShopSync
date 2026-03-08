import { useState } from 'react';

const CommentItem = ({ comment, depth = 0, onAddReply }) => {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;
    onAddReply(comment._id, replyText.trim());
    setReplyText('');
    setReplying(false);
  };

  return (
    <div style={{ marginLeft: depth * 20 }} className="mt-3">
      <div className="rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 shadow-sm">
        <p className="text-sm text-gray-800 dark:text-gray-200">{comment.content}</p>
        <button
          onClick={() => setReplying(!replying)}
          className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {replying ? 'Cancel' : 'Reply'}
        </button>

        {replying && (
          <div className="mt-2 flex gap-2">
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:outline-none"
            />
            <button
              onClick={handleSubmitReply}
              className="rounded bg-indigo-600 px-3 py-1 text-xs text-white hover:bg-indigo-700"
            >
              Send
            </button>
          </div>
        )}
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              depth={depth + 1}
              onAddReply={onAddReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
