const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/userModel');
const Product = require('./models/productModel');
const Order = require('./models/orderModel');
const Comment = require('./models/commentModel');

const users = [
  { username: 'admin', email: 'admin@shopsync.com', password: 'password123', role: 'admin' },
  { username: 'editor1', email: 'editor@shopsync.com', password: 'password123', role: 'editor' },
  { username: 'staff1', email: 'staff1@shopsync.com', password: 'password123', role: 'staff' },
  { username: 'staff2', email: 'staff2@shopsync.com', password: 'password123', role: 'staff' },
  { username: 'janedoe', email: 'jane@shopsync.com', password: 'password123', role: 'staff' },
];

const products = [
  { name: 'Wireless Headphones', price: 79.99, originalPrice: 99.99, discountPercent: 20, category: 'Electronics', stock: 50, tags: ['audio', 'wireless', 'bluetooth'] },
  { name: 'USB-C Hub', price: 34.99, originalPrice: 49.99, discountPercent: 30, category: 'Electronics', stock: 120, tags: ['accessories', 'usb', 'hub'] },
  { name: 'Standing Desk', price: 299.99, originalPrice: 349.99, discountPercent: 14, category: 'Home', stock: 15, tags: ['furniture', 'ergonomic', 'desk'] },
  { name: 'LED Desk Lamp', price: 24.99, originalPrice: 29.99, discountPercent: 17, category: 'Home', stock: 80, tags: ['lighting', 'led', 'desk'] },
  { name: 'Cotton T-Shirt', price: 19.99, originalPrice: 24.99, discountPercent: 20, category: 'Fashion', stock: 200, tags: ['clothing', 'cotton', 'casual'] },
  { name: 'Denim Jacket', price: 59.99, originalPrice: 79.99, discountPercent: 25, category: 'Fashion', stock: 30, tags: ['clothing', 'denim', 'outerwear'] },
  { name: 'Organic Coffee Beans', price: 14.99, originalPrice: 14.99, discountPercent: 0, category: 'Food', stock: 300, tags: ['coffee', 'organic', 'beans'] },
  { name: 'Dark Chocolate Bar', price: 4.99, originalPrice: 5.99, discountPercent: 17, category: 'Food', stock: 500, tags: ['chocolate', 'snack', 'organic'] },
  { name: 'Mechanical Keyboard', price: 89.99, originalPrice: 119.99, discountPercent: 25, category: 'Electronics', stock: 45, tags: ['keyboard', 'mechanical', 'gaming'] },
  { name: 'Yoga Mat', price: 29.99, originalPrice: 39.99, discountPercent: 25, category: 'Home', stock: 60, tags: ['fitness', 'yoga', 'exercise'] },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Comment.deleteMany({});
    console.log('Cleared existing data');

    // Seed users (passwords hashed by pre-save hook)
    const createdUsers = await User.create(users);
    console.log(`Seeded ${createdUsers.length} users`);

    // Seed products
    const createdProducts = await Product.create(products);
    console.log(`Seeded ${createdProducts.length} products`);

    // Seed orders
    const orders = [
      { productId: createdProducts[0]._id, quantity: 2, totalPrice: createdProducts[0].price * 2, status: 'completed' },
      { productId: createdProducts[2]._id, quantity: 1, totalPrice: createdProducts[2].price * 1, status: 'processing' },
      { productId: createdProducts[4]._id, quantity: 5, totalPrice: createdProducts[4].price * 5, status: 'pending' },
      { productId: createdProducts[6]._id, quantity: 3, totalPrice: createdProducts[6].price * 3, status: 'completed' },
      { productId: createdProducts[8]._id, quantity: 1, totalPrice: createdProducts[8].price * 1, status: 'pending' },
    ];
    const createdOrders = await Order.create(orders);
    console.log(`Seeded ${createdOrders.length} orders`);

    // Seed comments with nested replies
    const comments = [
      {
        content: 'Great headphones, amazing sound quality!',
        authorId: createdUsers[2]._id,
        productId: createdProducts[0]._id,
        replies: [
          {
            content: 'I agree, the bass is incredible.',
            authorId: createdUsers[3]._id,
            replies: [
              { content: 'What genre do you mostly listen to?', authorId: createdUsers[4]._id },
            ],
          },
          { content: 'How is the battery life?', authorId: createdUsers[4]._id },
        ],
      },
      {
        content: 'This standing desk changed my work setup completely.',
        authorId: createdUsers[1]._id,
        productId: createdProducts[2]._id,
        replies: [
          { content: 'Is it easy to assemble?', authorId: createdUsers[3]._id },
        ],
      },
      {
        content: 'Best coffee beans I have ever tried!',
        authorId: createdUsers[4]._id,
        productId: createdProducts[6]._id,
      },
    ];
    const createdComments = await Comment.create(comments);
    console.log(`Seeded ${createdComments.length} comments`);

    console.log('\nSeed completed successfully!');
    console.log('Login credentials: email: admin@shopsync.com / password: password123');

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
