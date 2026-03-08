import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/axiosInstance';
import CommentItem from '../components/CommentItem';
import { addReply } from '../utils/commentUtils';

const ProductReviewsPage = () => {
  const { productId } = useParams();
  const [comments, setComments] = useState([]);
  const [product, setProduct] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [commentsRes, productsRes] = await Promise.all([
          api.get(`/comments?productId=${productId}`),
          api.get('/products'),
        ]);
        setComments(commentsRes.data.data?.comments || []);
        const found = productsRes.data.data.products.find((p) => p._id === productId);
        setProduct(found || null);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [productId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await api.post('/comments', {
        content: newComment.trim(),
        productId,
      });
      setComments((prev) => [...prev, res.data.data.comment]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleAddReply = async (targetId, content) => {
    try {
      const res = await api.post(`/comments/${targetId}/reply`, { content });
      // Update state immutably using recursive helper
      setComments((prev) => addReply(prev, targetId, res.data.data.reply));
    } catch (err) {
      console.error('Failed to add reply:', err);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12 text-gray-500">Loading reviews...</div>;
  }

  return (
    <div>
      <Link to="/inventory" className="text-sm text-indigo-600 hover:underline">&larr; Back to Inventory</Link>

      <h2 className="mt-4 text-2xl font-bold text-gray-800">
        Reviews: {product?.name || 'Product'}
      </h2>

      {/* New comment input */}
      <div className="mt-4 flex gap-2">
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a review..."
          className="flex-1 rounded border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
        />
        <button
          onClick={handleAddComment}
          className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Post
        </button>
      </div>

      {/* Comments thread */}
      <div className="mt-6">
        {comments.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onAddReply={handleAddReply}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviewsPage;
