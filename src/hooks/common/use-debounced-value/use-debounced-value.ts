import { useEffect, useState } from 'react';

/**
 * Returns `value` only after it has stayed unchanged for `delay` milliseconds.
 * Useful to keep a fast-changing input from firing a request on every keystroke.
 */
export const useDebouncedValue = <T,>(value: T, delay = 400): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay);

    return () => clearTimeout(timeout);
  }, [delay, value]);

  return debouncedValue;
};
