import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const getStoredConfig = () => {
  try {
    const stored = localStorage.getItem('shopsync-theme');
    if (stored) return JSON.parse(stored);
  } catch {}
  return { theme: 'light', primaryColor: '#3B82F6' };
};

export const ThemeProvider = ({ children }) => {
  const [config, setConfig] = useState(getStoredConfig);

  useEffect(() => {
    localStorage.setItem('shopsync-theme', JSON.stringify(config));
  }, [config]);

  // Apply primaryColor as CSS custom property
  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', config.primaryColor);
  }, [config.primaryColor]);

  const setPrimaryColor = (color) => {
    setConfig((prev) => ({ ...prev, primaryColor: color }));
  };

  return (
    <ThemeContext.Provider value={{ config, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
