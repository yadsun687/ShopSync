export const addReply = (comments, targetId, newReply) => {
  return comments.map((c) => {
    if (c._id === targetId) {
      return { ...c, replies: [...(c.replies || []), newReply] };
    }
    if (c.replies && c.replies.length > 0) {
      return { ...c, replies: addReply(c.replies, targetId, newReply) };
    }
    return c;
  });
};
