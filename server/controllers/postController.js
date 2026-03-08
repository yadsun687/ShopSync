const Product = require('../models/productModel');

// GET /api/products/search
exports.searchProducts = async (req, res, next) => {
  try {
    const { tags, page = 1, limit = 5 } = req.query;

    const filter = { isDeleted: false };

    if (tags) {
      const tagArray = tags.split(',').map((t) => t.trim());
      filter.tags = { $all: tagArray };
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [products, totalCount] = await Promise.all([
      Product.find(filter).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      status: 'success',
      data: products,
      totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
