import React from 'react';
import { useTheme } from './GlobalUI';

type ThemedInputProps = React.InputHTMLAttributes<HTMLInputElement>;

const ThemedInput: React.FC<ThemedInputProps> = ({ style, ...props }) => {
  const { currentThemeData } = useTheme();

  return (
    <input
      style={{
        background: currentThemeData.bg,
        color: currentThemeData.text,
        border: `1px solid ${currentThemeData.border}`,
        borderRadius: 8,
        padding: '12px 16px',
        marginBottom: 8,
        width: '100%',
        transition: 'all 0.2s',
        ...style
      }}
      className="focus:outline-none focus:ring-2"
      {...props}
    />
  );
};

export default ThemedInput;
