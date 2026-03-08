const Order = require('../models/orderModel');
const Product = require('../models/productModel');

// POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Please provide productId and quantity' });
    }

    // 1. Find product
    const product = await Product.findOne({ _id: productId, isDeleted: false });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // 2. Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // 3. Atomic stock decrement
    const updated = await Product.findOneAndUpdate(
      { _id: productId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { new: true }
    );

    if (!updated) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // 4. Calculate totalPrice server-side
    const totalPrice = product.price * quantity;

    // 5. Create order
    const order = await Order.create({
      productId,
      quantity,
      totalPrice,
      status: 'pending',
    });

    // 6. Return order
    res.status(201).json({ status: 'success', data: { order } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/orders/:id — cancel order and revert stock
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    // Revert stock atomically
    await Product.findByIdAndUpdate(
      order.productId,
      { $inc: { stock: order.quantity } }
    );

    order.status = 'cancelled';
    await order.save();

    const populated = await Order.findById(order._id).populate('productId', 'name price');
    res.status(200).json({ status: 'success', message: 'Order cancelled and stock reverted', data: { order: populated } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('productId', 'name price').sort('-createdAt');
    res.status(200).json({ status: 'success', results: orders.length, data: { orders } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
