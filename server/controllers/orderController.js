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
