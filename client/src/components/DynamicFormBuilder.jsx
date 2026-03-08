import { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Dynamically build a Zod schema from a fieldConfig array
const buildZodSchema = (fields) => {
  const shape = {};

  for (const field of fields) {
    if (field.type === 'group') {
      shape[field.name] = buildZodSchema(field.fields || []);
      continue;
    }

    if (field.type === 'checkbox') {
      let schema = z.boolean();
      if (field.required) schema = schema.refine((v) => v === true, { message: `${field.label || field.name} is required` });
      shape[field.name] = schema;
      continue;
    }

    if (field.type === 'number') {
      let schema = z.coerce.number();
      if (field.min !== undefined) schema = schema.min(field.min);
      if (field.max !== undefined) schema = schema.max(field.max);
      if (!field.required) schema = schema.optional();
      shape[field.name] = schema;
      continue;
    }

    // text, select — string-based
    let schema = z.string();
    if (field.required) schema = schema.min(field.min || 1, { message: `${field.label || field.name} is required` });
    else if (field.min) schema = schema.min(field.min);
    if (field.max) schema = schema.max(field.max);
    if (!field.required) schema = schema.optional().or(z.literal(''));
    shape[field.name] = schema;
  }

  return z.object(shape);
};

// Recursive field renderer
const FieldRenderer = ({ field, register, errors, control, prefix }) => {
  const fullName = prefix ? `${prefix}.${field.name}` : field.name;

  // Watch all form values for conditional rendering
  const formValues = useWatch({ control });

  // showIf: check if condition is met
  if (field.showIf) {
    const conditionMet = Object.entries(field.showIf).every(([key, value]) => {
      // Resolve value from potentially nested prefix
      const resolvedValue = prefix
        ? prefix.split('.').reduce((obj, k) => obj?.[k], formValues)?.[key]
        : formValues?.[key];
      return resolvedValue === value;
    });
    if (!conditionMet) return null;
  }

  // Recursive group rendering
  if (field.type === 'group') {
    return (
      <fieldset key={fullName} className="rounded border border-gray-300 dark:border-gray-600 p-4 mt-2">
        <legend className="px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          {field.label || field.name}
        </legend>
        <div className="space-y-4">
          {(field.fields || []).map((subField) => (
            <FieldRenderer
              key={subField.name}
              field={subField}
              register={register}
              errors={errors?.[field.name] || {}}
              control={control}
              prefix={fullName}
            />
          ))}
        </div>
      </fieldset>
    );
  }

  const fieldError = prefix
    ? prefix.split('.').reduce((obj, k) => obj?.[k], errors)?.[field.name]
    : errors?.[field.name];

  const label = field.label || field.name;
  const inputClasses =
    'mt-1 w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:outline-none';

  return (
    <div key={fullName}>
      {field.type === 'checkbox' ? (
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <input type="checkbox" {...register(fullName)} className="h-4 w-4 rounded" />
          {label}
        </label>
      ) : (
        <>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
          {field.type === 'select' ? (
            <select {...register(fullName)} className={inputClasses}>
              <option value="">Select {label}</option>
              {(field.options || []).map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type={field.type === 'number' ? 'number' : 'text'}
              {...register(fullName, field.type === 'number' ? { valueAsNumber: true } : undefined)}
              className={inputClasses}
            />
          )}
        </>
      )}
      {fieldError && <p className="mt-1 text-sm text-red-600">{fieldError.message}</p>}
    </div>
  );
};

const DynamicFormBuilder = ({ fieldConfig, onSubmit: externalSubmit }) => {
  const schema = useMemo(() => buildZodSchema(fieldConfig), [fieldConfig]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data) => {
    if (externalSubmit) {
      externalSubmit(data);
    } else {
      console.log('Form submitted:', data);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {fieldConfig.map((field) => (
        <FieldRenderer
          key={field.name}
          field={field}
          register={register}
          errors={errors}
          control={control}
          prefix=""
        />
      ))}
      <button
        type="submit"
        className="w-full rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
      >
        Submit
      </button>
    </form>
  );
};

export default DynamicFormBuilder;
