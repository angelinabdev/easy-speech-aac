"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

type FontSize = 'default' | 'large';

interface FontSizeContextType {
  fontSize: FontSize;
  toggleFontSize: () => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSize] = useLocalStorage<FontSize>('font-size', 'default');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      if (fontSize === 'large') {
        document.documentElement.classList.add('text-large');
      } else {
        document.documentElement.classList.remove('text-large');
      }
    }
  }, [fontSize, isMounted]);

  const toggleFontSize = useCallback(() => {
    setFontSize(currentSize => (currentSize === 'default' ? 'large' : 'default'));
  }, [setFontSize]);

  // Prevent hydration mismatch
  if (!isMounted) {
    return null;
  }

  return (
    <FontSizeContext.Provider value={{ fontSize, toggleFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export const useFontSize = () => {
  const context = useContext(FontSizeContext);
  if (context === undefined) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
};
