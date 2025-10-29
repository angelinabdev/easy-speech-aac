
"use client";

import { useState, useEffect, useCallback, SetStateAction, Dispatch } from 'react';

// A wrapper for window.localStorage that handles JSON serialization.
const storage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return null;
    }
  },
  setItem: (key: string, value: unknown) => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const oldValue = window.localStorage.getItem(key);
      const newValue = JSON.stringify(value);
      window.localStorage.setItem(key, newValue);
      // Dispatch a storage event so other tabs can sync
      window.dispatchEvent(new StorageEvent('storage', {
          key,
          oldValue,
          newValue,
          storageArea: window.localStorage,
      }));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  },
};

export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  // The `useState` hook is initialized with a function to ensure that
  // localStorage is only accessed on the client-side.
  const [storedValue, setStoredValue] = useState<T>(() => {
    // This part is now for server-side rendering, client-side will be synced by effect
    return initialValue;
  });

  // The `setValue` function is a wrapper around `setStoredValue` that
  // also persists the new value to localStorage.
  const setValue: Dispatch<SetStateAction<T>> = useCallback((value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      storage.setItem(key, valueToStore);
    } catch (error) {
      console.log(error);
    }
  }, [key, storedValue]);

  // This effect synchronizes the state across tabs and from storage on mount
  useEffect(() => {
    // Sync from storage on mount
    const item = storage.getItem(key);
    if (item !== null) {
      setStoredValue(item);
    }
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        try {
            setStoredValue(JSON.parse(event.newValue));
        } catch (error) {
            console.error(`Error parsing storage event value for key "${key}":`, error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue];
}
