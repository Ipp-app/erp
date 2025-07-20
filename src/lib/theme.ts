// Centralized theme configuration
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

export const themesConfig: Record<string, ThemeFunc> = {
  'neon-blue': (isLightMode) => ({
    name: 'Neon Blue',
    primary: isLightMode ? '#00a8cc' : '#00d4ff',
    secondary: '#0a0a0a',
    accent: isLightMode ? '#e65c2e' : '#ff6b35',
    bg: isLightMode ? '#f0f4f8' : '#121212',  // lighter bg for light mode, darker for dark mode
    surface: isLightMode ? '#ffffff' : '#1e1e1e',  // white surface for light, dark gray for dark

    text: isLightMode ? '#1f2937' : '#e0e0e0',  // dark text for light, light text for dark
    textSecondary: isLightMode ? '#4b5563' : '#a0a0a0',  // medium gray for light, lighter gray for dark


    border: isLightMode ? '#e5e7eb' : '#333333'  // light border for light, dark border for dark
  }),
  'cyber-purple': (isLightMode) => ({
    name: 'Cyber Purple',
    primary: isLightMode ? '#7b2cbf' : '#9d4edd',
    secondary: '#240046',
    accent: isLightMode ? '#d90467' : '#f72585',
    bg: isLightMode ? '#faf5ff' : '#1a002b',
    surface: isLightMode ? '#ffffff' : '#2a0040',

    text: isLightMode ? '#4c1d95' : '#e0e0e0',
    textSecondary: isLightMode ? '#a78bfa' : '#b9a6e0',


    border: isLightMode ? '#ddd6fe' : '#3c096c'
  }),
  'matrix-green': (isLightMode) => ({
    name: 'Matrix Green',
    primary: isLightMode ? '#28b40e' : '#39ff14',
    secondary: '#001100',
    accent: isLightMode ? '#cc062e' : '#ff073a',
    bg: isLightMode ? '#f0fff4' : '#000000',
    surface: isLightMode ? '#ffffff' : '#001100',

    text: isLightMode ? '#14532d' : '#bbf7d0',
    textSecondary: isLightMode ? '#16a34a' : '#86efac',


    border: isLightMode ? '#bbf7d0' : '#003300'
  }),
  'sunset-orange': (isLightMode) => ({
    name: 'Sunset Orange',
    primary: isLightMode ? '#e65c2e' : '#ff6b35',
    secondary: '#2d1b69',
    accent: isLightMode ? '#d90467' : '#f72585',
    bg: isLightMode ? '#fff7ed' : '#1a0033',
    surface: isLightMode ? '#ffffff' : '#2d1b69',

    text: isLightMode ? '#9a3412' : '#fed7aa',
    textSecondary: isLightMode ? '#ea580c' : '#fbcfe8',


    border: isLightMode ? '#fed7aa' : '#533483'
  })
};
