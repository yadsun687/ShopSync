import express from 'express';
import * as orderController from '../controllers/orderController.js';

const router = express.Router();

router.get('/', orderController.getOrders);
router.post('/', orderController.createOrder);
router.delete('/:id', orderController.cancelOrder);

export default router;
