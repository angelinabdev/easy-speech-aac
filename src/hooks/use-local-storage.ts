"use client";

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
    }
  }, [key]);

  const setStoredValue = useCallback((newValue: T | ((val: T) => T)) => {
    if (!isMounted) return;
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
       console.error(`Error setting localStorage key “${key}”:`, error);
    }
  }, [isMounted, key, value]);

  const safeValue = isMounted ? value : initialValue;

  return [safeValue, setStoredValue] as const;
}
