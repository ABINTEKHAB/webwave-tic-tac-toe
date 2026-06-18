import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppTheme, ThemeName, themes } from './themes';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (name: ThemeName) => Promise<void>;
  isThemeLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: themes.cyber,
  setTheme: async () => {},
  isThemeLoaded: true,
});

const THEME_STORAGE_KEY = '@webwave_tic_tac_toe:active_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTheme, setActiveTheme] = useState<AppTheme>(themes.cyber);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme && themes[storedTheme as ThemeName]) {
          setActiveTheme(themes[storedTheme as ThemeName]);
        }
      } catch (e) {
        // Fallback to default silently
      } finally {
        setIsThemeLoaded(true);
      }
    };
    loadTheme();
  }, []);

  const setTheme = async (name: ThemeName) => {
    if (themes[name]) {
      setActiveTheme(themes[name]);
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, name);
      } catch (e) {
        // Ignore write failures silently
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme: activeTheme, setTheme, isThemeLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
