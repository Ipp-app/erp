import React from 'react';
import { Moon, Sun, Palette } from 'lucide-react';
import { useTheme } from '../ui/GlobalUI';
import { themesConfig } from '../../lib/theme';

interface ThemeSelectorProps {
  showDropdown: boolean;
  setShowDropdown: (show: boolean) => void;
  className?: string;
}

export function ThemeSelector({ showDropdown, setShowDropdown, className = "" }: ThemeSelectorProps) {
  const { isLightMode, setIsLightMode, currentTheme, setCurrentTheme, currentThemeData } = useTheme();

  return (
    <div className={`flex gap-3 ${className}`}>
      <button
        onClick={() => setIsLightMode(!isLightMode)}
        className="p-3 rounded-full backdrop-blur-lg border transition-all duration-300 hover:scale-110"
        style={{
          background: `${currentThemeData.surface}80`,
          borderColor: currentThemeData.border,
          color: currentThemeData.text
        }}
      >
        {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
      </button>
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="p-3 rounded-full backdrop-blur-lg border transition-all duration-300 hover:scale-110"
          style={{
            background: `${currentThemeData.surface}80`,
            borderColor: currentThemeData.border,
            color: currentThemeData.text
          }}
        >
          <Palette size={20} />
        </button>
        {showDropdown && (
          <div
            className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl border backdrop-blur-lg z-30"
            style={{
              background: `${currentThemeData.surface}95`,
              borderColor: currentThemeData.border
            }}
          >
            {Object.entries(themesConfig).map(([key, themeFunc]) => {
              const theme = themeFunc(isLightMode);
              return (
                <button
                  key={key}
                  onClick={() => {
                    setCurrentTheme(key);
                    setShowDropdown(false);
                  }}
                  className="w-full p-3 text-left hover:bg-opacity-50 transition-all duration-200 first:rounded-t-xl last:rounded-b-xl flex items-center gap-3"
                  style={{
                    color: key === currentTheme ? theme.primary : currentThemeData.text,
                    backgroundColor: key === currentTheme ? `${theme.primary}20` : 'transparent'
                  }}
                >
                  <div className="w-4 h-4 rounded-full" style={{ background: theme.primary }} />
                  {theme.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
