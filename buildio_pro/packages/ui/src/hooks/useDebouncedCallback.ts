// The fixed and recommended implementation for useDebouncedCallback
import React, { useRef, useCallback } from "react";

export default function useDebouncedCallback<T extends (...args: any[]) => void>(
  fn: T,
  timeout = 500
): T {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // We use useCallback to ensure the returned function has a stable identity
  // across renders, even though it's the debounced wrapper.
  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      // 1. Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // 2. Set a new timer
      timerRef.current = setTimeout(() => {
        fn(...args);
        timerRef.current = null; // Clear ref after execution
      }, timeout);
    },
    [fn, timeout]
  ) as T; // Type assertion to match the input function signature

  // Cleanup effect: clear the timer when the component unmounts
  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return debouncedFn;
}