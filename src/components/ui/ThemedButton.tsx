import React from 'react';
import { useTheme } from './GlobalUI';

type ThemedButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  children: React.ReactNode;
};

const ThemedButton: React.FC<ThemedButtonProps> = ({
  variant = 'primary',
  children,
  style,
  ...props
}) => {
  const { currentThemeData } = useTheme();

  let bg, color, border;
  switch (variant) {
    case 'primary':
      bg = `linear-gradient(45deg, ${currentThemeData.primary}, ${currentThemeData.accent})`;
      color = currentThemeData.bg;
      border = `1px solid ${currentThemeData.primary}`;
      break;
    case 'accent':
      bg = currentThemeData.accent;
      color = currentThemeData.bg;
      border = `1px solid ${currentThemeData.accent}`;
      break;
    case 'secondary':
      bg = currentThemeData.surface;
      color = currentThemeData.primary;
      border = `1px solid ${currentThemeData.primary}`;
      break;
    case 'outline':
      bg = 'transparent';
      color = currentThemeData.primary;
      border = `1px solid ${currentThemeData.primary}`;
      break;
    default:
      bg = currentThemeData.primary;
      color = currentThemeData.bg;
      border = `1px solid ${currentThemeData.primary}`;
  }

  return (
    <button
      style={{
        background: bg,
        color,
        border,
        borderRadius: 8,
        padding: '10px 20px',
        fontWeight: 600,
        transition: 'all 0.2s',
        ...style
      }}
      className="hover:scale-105 active:scale-95"
      {...props}
    >
      {children}
    </button>
  );
};

export default ThemedButton;
