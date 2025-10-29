
"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface CalmModeContextType {
  isCalmMode: boolean;
  toggleCalmMode: () => void;
}

const CalmModeContext = createContext<CalmModeContextType | undefined>(undefined);

export function CalmModeProvider({ children }: { children: ReactNode }) {
  const [isCalmMode, setIsCalmMode] = useLocalStorage<boolean>('calm-mode', false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      if (isCalmMode) {
        document.documentElement.classList.add('calm-mode');
      } else {
        document.documentElement.classList.remove('calm-mode');
      }
    }
  }, [isCalmMode, isMounted]);

  const toggleCalmMode = useCallback(() => {
    setIsCalmMode(currentMode => !currentMode);
  }, [setIsCalmMode]);

  // Prevent hydration mismatch
  if (!isMounted) {
    return null;
  }

  return (
    <CalmModeContext.Provider value={{ isCalmMode, toggleCalmMode }}>
      {children}
    </CalmModeContext.Provider>
  );
}

export const useCalmMode = () => {
  const context = useContext(CalmModeContext);
  if (context === undefined) {
    throw new Error('useCalmMode must be used within a CalmModeProvider');
  }
  return context;
};
