import Product from '../models/productModel.js';

// POST /api/products
export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ status: 'success', data: { product } });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Product name already exists' });
    }
    res.status(500).json({ message: err.message });
  }
};

// GET /api/products
export const getProducts = async (req, res, next) => {
  try {
    const filter = { isDeleted: false };

    if (req.query.minPrice) {
      filter.price = { $gte: Number(req.query.minPrice) };
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const products = await Product.find(filter);
    res.status(200).json({ status: 'success', results: products.length, data: { products } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/products/:id (soft delete)
export const softDeleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ status: 'success', message: 'Product soft deleted', data: { product } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/products/stats
export const getProductStats = async (req, res, next) => {
  try {
    const stats = await Product.aggregate([
      { $match: { isDeleted: false } },
      {
        $project: {
          category: 1,
          salePrice: {
            $multiply: ['$originalPrice', { $divide: [{ $subtract: [100, '$discountPercent'] }, 100] }],
          },
        },
      },
      {
        $group: {
          _id: null,
          maxSalePrice: { $max: '$salePrice' },
          avgSalePrice: { $avg: '$salePrice' },
        },
      },
    ]);

    const totalByCategory = await Product.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        maxSalePrice: stats[0]?.maxSalePrice || 0,
        avgSalePrice: stats[0]?.avgSalePrice || 0,
        totalByCategory,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
