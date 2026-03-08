import { useState } from 'react';
import DynamicFormBuilder from '../components/DynamicFormBuilder';

const sampleFieldConfig = [
  { name: 'productName', label: 'Product Name', type: 'text', required: true, min: 3 },
  { name: 'price', label: 'Price', type: 'number', required: true, min: 0 },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    required: true,
    options: ['admin', 'guest'],
  },
  {
    name: 'adminCode',
    label: 'Admin Code',
    type: 'text',
    showIf: { role: 'admin' },
    required: true,
    min: 4,
  },
  { name: 'featured', label: 'Featured Product', type: 'checkbox' },
  {
    name: 'specs',
    label: 'Specifications',
    type: 'group',
    fields: [
      { name: 'weight', label: 'Weight (kg)', type: 'number' },
      { name: 'color', label: 'Color', type: 'text' },
      { name: 'material', label: 'Material', type: 'select', options: ['Metal', 'Plastic', 'Wood'] },
    ],
  },
];

const DynamicFormBuilderPage = () => {
  const [submittedData, setSubmittedData] = useState(null);

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Dynamic Form Builder</h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Generated Form</h3>
          <DynamicFormBuilder fieldConfig={sampleFieldConfig} onSubmit={setSubmittedData} />
        </div>

        {/* Submitted data preview */}
        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Submitted Payload</h3>
          {submittedData ? (
            <pre className="overflow-auto rounded bg-gray-50 dark:bg-gray-900 p-4 text-sm text-gray-800 dark:text-gray-200">
              {JSON.stringify(submittedData, null, 2)}
            </pre>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Submit the form to see the payload here.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicFormBuilderPage;
