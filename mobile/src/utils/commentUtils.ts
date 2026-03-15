export const addReply = (comments: any[], targetId: string, reply: any): any[] => {
  return comments.map((comment) => {
    if (comment._id === targetId) {
      return { ...comment, replies: [...(comment.replies || []), reply] };
    }
    if (comment.replies?.length) {
      return { ...comment, replies: addReply(comment.replies, targetId, reply) };
    }
    return comment;
  });
};
