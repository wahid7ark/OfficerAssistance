import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error);
      }
    }
  }, [key]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      setStoredValue(prev => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
        return valueToStore;
      });
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue];
}

interface HistoryItem<T> {
  id: string;
  timestamp: number;
  data: T;
}

export function useCalculationHistory<T extends Record<string, unknown>>(calculatorName: string, maxItems: number = 50) {
  const storageKey = `calculation_history_${calculatorName}`;
  const [history, setHistory] = useLocalStorage<HistoryItem<T>[]>(storageKey, []);

  const addToHistory = useCallback((data: T) => {
    const newEntry: HistoryItem<T> = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      data
    };
    setHistory(prev => [newEntry, ...prev].slice(0, maxItems));
  }, [setHistory, maxItems]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  const deleteHistoryItem = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, [setHistory]);

  return {
    history,
    addToHistory,
    clearHistory,
    deleteHistoryItem
  };
}
