import React, { useState, createContext, useContext } from 'react';
import { themesConfig, type ThemeData } from '../../lib/theme';
import ThemedButton from './ThemedButton';
import ThemedInput from './ThemedInput';
import ThemedTable from './ThemedTable';

// Export theme config for use in other components
export { themesConfig };

// Theme Context
const ThemeContext = createContext({
  isLightMode: false,
  setIsLightMode: (_: boolean) => {},
  currentTheme: 'neon-blue',
  setCurrentTheme: (_: string) => {},
  currentThemeData: themesConfig['neon-blue'](false)
});

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx || !ctx.currentThemeData) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [isLightMode, setIsLightMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('neon-blue');
  const currentThemeData = themesConfig[currentTheme](isLightMode);
  
  return (
    <ThemeContext.Provider value={{ 
      isLightMode, 
      setIsLightMode, 
      currentTheme, 
      setCurrentTheme, 
      currentThemeData 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Export themed components
export { ThemedButton, ThemedInput, ThemedTable };
