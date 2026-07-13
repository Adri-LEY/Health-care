import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // On lance un timer
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Si la valeur change avant la fin du délai, on nettoie (annule) le timer précédent
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}