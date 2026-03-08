const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const postController = require('../controllers/postController');
const { restrictTo } = require('../middleware/authMiddleware');

// Static routes must come before /:id routes
router.get('/stats', productController.getProductStats);
router.get('/search', postController.searchProducts);

router.get('/', productController.getProducts);
router.post('/', restrictTo('admin', 'editor'), productController.createProduct);
router.delete('/:id', restrictTo('admin'), productController.softDeleteProduct);

module.exports = router;
