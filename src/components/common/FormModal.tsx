import React from 'react';
import ThemedButton from '../ui/ThemedButton';
import { useTheme } from '../ui/GlobalUI';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  children: React.ReactNode;
  submitText?: string;
  cancelText?: string;
}

export function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitText = "Save",
  cancelText = "Cancel"
}: FormModalProps) {
  const { currentThemeData } = useTheme();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <form
        className="p-6 rounded-xl min-w-[400px] max-w-lg w-full"
        style={{
          backgroundColor: currentThemeData.surface,
          color: currentThemeData.text,
          boxShadow: `0 8px 24px ${currentThemeData.border}40`
        }}
        onSubmit={onSubmit}
      >
        <h2 className="text-xl font-semibold mb-6" style={{ color: currentThemeData.text }}>

          {title}
        </h2>
        {children}
        <div className="flex justify-end gap-2 mt-4">
          <ThemedButton
            type="button"
            variant="outline"
            onClick={onClose}
            style={{ borderColor: currentThemeData.border, color: currentThemeData.textSecondary }}
          >
            {cancelText}
          </ThemedButton>
          <ThemedButton type="submit" style={{ backgroundColor: currentThemeData.primary }}>
            {submitText}
          </ThemedButton>
        </div>
      </form>
    </div>
  );
}
