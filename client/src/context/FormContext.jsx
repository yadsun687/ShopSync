import { createContext, useContext, useState, useEffect } from 'react';

const FormContext = createContext(null);

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) throw new Error('useFormContext must be used within FormProvider');
  return context;
};

const STORAGE_KEY = 'shopsync_register_form';

const defaultData = {
  email: '',
  password: '',
  username: '',
  occupation: '',
  company: '',
  githubUrl: '',
};

export const FormProvider = ({ children }) => {
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultData;
  });

  const [currentStep, setCurrentStep] = useState(1);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const updateFormData = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const resetFormData = () => {
    setFormData(defaultData);
    setCurrentStep(1);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <FormContext.Provider value={{ formData, updateFormData, resetFormData, currentStep, setCurrentStep }}>
      {children}
    </FormContext.Provider>
  );
};
