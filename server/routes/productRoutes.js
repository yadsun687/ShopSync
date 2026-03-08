const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Stats route must come before /:id routes
router.get('/stats', protect, productController.getProductStats);

router.get('/', protect, productController.getProducts);
router.post('/', protect, restrictTo('admin', 'editor'), productController.createProduct);
router.delete('/:id', protect, restrictTo('admin'), productController.softDeleteProduct);

module.exports = router;
