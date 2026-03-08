const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const postController = require('../controllers/postController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Static routes must come before /:id routes
router.get('/stats', protect, productController.getProductStats);
router.get('/search', protect, postController.searchProducts);

router.get('/', protect, productController.getProducts);
router.post('/', protect, restrictTo('admin', 'editor'), productController.createProduct);
router.delete('/:id', protect, restrictTo('admin'), productController.softDeleteProduct);

module.exports = router;
