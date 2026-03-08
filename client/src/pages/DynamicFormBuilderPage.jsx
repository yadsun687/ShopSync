import { useState } from 'react';
import DynamicFormBuilder from '../components/DynamicFormBuilder';
import api from '../services/axiosInstance';

const productFieldConfig = [
  { name: 'name', label: 'Product Name', type: 'text', required: true, min: 3 },
  {
    name: 'category',
    label: 'Category',
    type: 'select',
    required: true,
    options: ['Electronics', 'Home', 'Fashion', 'Food'],
  },
  { name: 'stock', label: 'Stock Quantity', type: 'number', required: true, min: 0 },
  { name: 'tags', label: 'Tags (comma-separated)', type: 'text' },
  {
    name: 'pricing',
    label: 'Pricing',
    type: 'group',
    fields: [
      { name: 'price', label: 'Selling Price ($)', type: 'number', required: true, min: 0 },
      { name: 'originalPrice', label: 'Original Price ($)', type: 'number', required: true, min: 0 },
      { name: 'hasDiscount', label: 'Apply Discount', type: 'checkbox' },
      {
        name: 'discountPercent',
        label: 'Discount (%)',
        type: 'number',
        min: 0,
        max: 100,
        showIf: { hasDiscount: true },
        required: true,
      },
    ],
  },
];

const DynamicFormBuilderPage = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (data) => {
    setError('');
    setResult(null);

    // Transform nested form data into the flat API payload
    const payload = {
      name: data.name,
      category: data.category,
      stock: data.stock,
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      price: data.pricing.price,
      originalPrice: data.pricing.originalPrice,
      discountPercent: data.pricing.hasDiscount ? data.pricing.discountPercent : 0,
    };

    try {
      const res = await api.post('/products', payload);
      setResult(res.data.data.product);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product');
    }
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Add New Product</h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Product Details</h3>
          <DynamicFormBuilder fieldConfig={productFieldConfig} onSubmit={handleSubmit} />
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>

        {/* Created product preview */}
        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Created Product</h3>
          {result ? (
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="rounded bg-green-100 dark:bg-green-900 px-3 py-2 text-green-800 dark:text-green-200 font-medium">
                Product created successfully!
              </div>
              <p><span className="font-medium">Name:</span> {result.name}</p>
              <p><span className="font-medium">Category:</span> {result.category}</p>
              <p><span className="font-medium">Price:</span> ${result.price}</p>
              <p><span className="font-medium">Original Price:</span> ${result.originalPrice}</p>
              <p><span className="font-medium">Discount:</span> {result.discountPercent}%</p>
              <p><span className="font-medium">Stock:</span> {result.stock}</p>
              {result.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  <span className="font-medium">Tags:</span>
                  {result.tags.map((tag) => (
                    <span key={tag} className="rounded bg-indigo-100 dark:bg-indigo-900 px-2 py-0.5 text-xs text-indigo-700 dark:text-indigo-300">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Fill out and submit the form to create a product.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicFormBuilderPage;
