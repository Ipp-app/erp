import React, { createContext, useContext } from 'react';

export type ThemeData = {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
};

export type ThemeFunc = (isLightMode: boolean) => ThemeData;

export const ThemeContext = createContext<any>(null);

export function useTheme() {
  return useContext(ThemeContext);
}
