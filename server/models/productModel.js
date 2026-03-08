const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      unique: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      required: [true, 'Original price is required'],
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100'],
    },
    category: {
      type: String,
      enum: ['Electronics', 'Home', 'Fashion', 'Food'],
      required: [true, 'Category is required'],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    tags: [String],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field: calculated sale price
productSchema.virtual('salePrice').get(function () {
  return this.originalPrice * ((100 - this.discountPercent) / 100);
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
