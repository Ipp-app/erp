import React from 'react';
import { useTheme } from './GlobalUI';

type ThemedTableProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

const ThemedTable: React.FC<ThemedTableProps> = ({ children, style }) => {
  const { currentThemeData } = useTheme();

  return (
    <table
      className="min-w-full rounded-xl overflow-hidden shadow"
      style={{
        background: currentThemeData.surface,
        color: currentThemeData.text,
        borderColor: currentThemeData.border,
        ...style
      }}
    >
      {children}
    </table>
  );
};

export default ThemedTable;
