import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFormContext } from '../context/FormContext';
import { step1Schema, step2Schema } from '../schemas/registerSchema';
import api from '../services/axiosInstance';
import { useNavigate } from 'react-router-dom';

const RESERVED_USERNAMES = ['admin', 'root', 'superuser'];

const Step1 = ({ onNext }) => {
  const { formData, updateFormData } = useFormContext();
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      email: formData.email,
      password: formData.password,
      username: formData.username,
    },
  });

  const checkUsername = async (username) => {
    setCheckingUsername(true);
    setUsernameError('');
    await new Promise((r) => setTimeout(r, 500));
    if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
      setUsernameError('Username not available');
      setCheckingUsername(false);
      return false;
    }
    setCheckingUsername(false);
    return true;
  };

  const onSubmit = async (data) => {
    const available = await checkUsername(data.username);
    if (!available) return;
    updateFormData(data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Step 1: Account Setup</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
        <input {...register('email')} type="email" className="mt-1 w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:outline-none" />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
        <input {...register('username')} className="mt-1 w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:outline-none" />
        {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>}
        {usernameError && <p className="mt-1 text-sm text-red-600">{usernameError}</p>}
        {checkingUsername && <p className="mt-1 text-sm text-gray-500">Checking username...</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
        <input {...register('password')} type="password" className="mt-1 w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:outline-none" />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
      </div>

      <button type="submit" disabled={checkingUsername} className="w-full rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50">
        {checkingUsername ? 'Checking...' : 'Next'}
      </button>
    </form>
  );
};

const Step2 = ({ onNext, onBack }) => {
  const { formData, updateFormData } = useFormContext();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      occupation: formData.occupation,
      company: formData.company,
      githubUrl: formData.githubUrl,
    },
  });

  const occupation = watch('occupation');

  const onSubmit = (data) => {
    updateFormData(data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Step 2: Professional Profile</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Occupation</label>
        <select {...register('occupation')} className="mt-1 w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:outline-none">
          <option value="">Select occupation</option>
          <option value="Developer">Developer</option>
          <option value="Designer">Designer</option>
          <option value="Manager">Manager</option>
        </select>
        {errors.occupation && <p className="mt-1 text-sm text-red-600">{errors.occupation.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company</label>
        <input {...register('company')} className="mt-1 w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:outline-none" />
        {errors.company && <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>}
      </div>

      {occupation === 'Developer' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">GitHub URL</label>
          <input {...register('githubUrl')} className="mt-1 w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:outline-none" />
          {errors.githubUrl && <p className="mt-1 text-sm text-red-600">{errors.githubUrl.message}</p>}
        </div>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex-1 rounded border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
          Back
        </button>
        <button type="submit" className="flex-1 rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
          Next
        </button>
      </div>
    </form>
  );
};

const Step3 = ({ onBack }) => {
  const { formData, resetFormData } = useFormContext();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      await api.post('/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      resetFormData();
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Step 3: Review & Confirm</h2>

      <div className="rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-4 space-y-2">
        <p className="dark:text-gray-200"><span className="font-medium">Email:</span> {formData.email}</p>
        <p className="dark:text-gray-200"><span className="font-medium">Username:</span> {formData.username}</p>
        <p className="dark:text-gray-200"><span className="font-medium">Occupation:</span> {formData.occupation}</p>
        <p className="dark:text-gray-200"><span className="font-medium">Company:</span> {formData.company}</p>
        {formData.githubUrl && <p className="dark:text-gray-200"><span className="font-medium">GitHub:</span> {formData.githubUrl}</p>}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex-1 rounded border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
          Back
        </button>
        <button onClick={handleSubmit} disabled={submitting} className="flex-1 rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50">
          {submitting ? 'Submitting...' : 'Create Account'}
        </button>
      </div>
    </div>
  );
};

const RegisterPage = () => {
  const { currentStep, setCurrentStep } = useFormContext();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-center text-indigo-600 dark:text-indigo-400">ShopSync Registration</h1>

        {/* Step indicator */}
        <div className="mb-6 flex justify-center gap-2">
          {[1, 2, 3].map((step) => (
            <div key={step} className={`h-2 w-16 rounded-full ${currentStep >= step ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`} />
          ))}
        </div>

        {currentStep === 1 && <Step1 onNext={() => setCurrentStep(2)} />}
        {currentStep === 2 && <Step2 onNext={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)} />}
        {currentStep === 3 && <Step3 onBack={() => setCurrentStep(2)} />}
      </div>
    </div>
  );
};

export default RegisterPage;
