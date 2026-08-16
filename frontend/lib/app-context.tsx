'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { api } from './api';
import type { ColorMode, ThemeMode, User } from './types';

interface AppContextValue {
  user: User | null;
  loading: boolean;
  themeMode: ThemeMode;
  colorMode: ColorMode;
  setThemeMode: (mode: ThemeMode) => void;
  setColorMode: (mode: ColorMode) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const THEME_KEY = 'pyramid_theme';
const COLOR_KEY = 'pyramid_color';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [themeMode, setThemeModeState] = useState<ThemeMode>('LIGHT');
  const [colorMode, setColorModeState] = useState<ColorMode>('BLUE');

  // Apply to <html> immediately so there's no flash of the wrong theme
  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      themeMode === 'DARK' ? 'dark' : 'light',
    );
    document.documentElement.setAttribute('data-color', colorMode.toLowerCase());
  }, [themeMode, colorMode]);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    try {
      const me = await api.get<User>('/users/me');
      setUser(me);
      setThemeModeState(me.themeMode);
      setColorModeState(me.colorMode);
    } catch {
      setUser(null);
      const savedTheme = localStorage.getItem(THEME_KEY) as ThemeMode | null;
      const savedColor = localStorage.getItem(COLOR_KEY) as ColorMode | null;
      if (savedTheme) setThemeModeState(savedTheme);
      if (savedColor) setColorModeState(savedColor);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      setThemeModeState(mode);
      localStorage.setItem(THEME_KEY, mode);
      if (user) api.patch('/users/me', { themeMode: mode }).catch(() => {});
    },
    [user],
  );

  const setColorMode = useCallback(
    (mode: ColorMode) => {
      setColorModeState(mode);
      localStorage.setItem(COLOR_KEY, mode);
      if (user) api.patch('/users/me', { colorMode: mode }).catch(() => {});
    },
    [user],
  );

  const logout = useCallback(async () => {
    await api.post('/auth/logout');
    setUser(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        themeMode,
        colorMode,
        setThemeMode,
        setColorMode,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
