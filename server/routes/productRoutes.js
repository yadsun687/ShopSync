import express from 'express';
import * as productController from '../controllers/productController.js';
import * as postController from '../controllers/postController.js';
import { restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Static routes must come before /:id routes
router.get('/stats', productController.getProductStats);
router.get('/search', postController.searchProducts);

router.get('/', productController.getProducts);
router.post('/', restrictTo('admin', 'editor'), productController.createProduct);
router.delete('/:id', restrictTo('admin'), productController.softDeleteProduct);

export default router;
