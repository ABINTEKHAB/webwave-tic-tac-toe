import React, { createContext, useContext } from 'react';
import { AppTheme, themes } from './themes';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (name: any) => Promise<void>;
  isThemeLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: themes.cyber,
  setTheme: async () => {},
  isThemeLoaded: true,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeContext.Provider value={{ theme: themes.cyber, setTheme: async () => {}, isThemeLoaded: true }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

