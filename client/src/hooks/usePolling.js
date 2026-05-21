import { useEffect, useRef } from 'react';

/**
 * A custom hook to execute an action immediately and then poll at a specified interval.
 * @param {Function} action - The function to execute on each tick.
 * @param {number} intervalTime - Interval time in milliseconds.
 * @param {Array} deps - Dependency list that resets the polling cycle.
 */
export default function usePolling(action, intervalTime = 10000, deps = []) {
  const savedCallback = useRef(action);

  // Remember the latest callback if it changes.
  useEffect(() => {
    savedCallback.current = action;
  }, [action]);

  // Set up the interval.
  useEffect(() => {
    // Execute immediately on mount/dependency change
    savedCallback.current();

    if (intervalTime === null || intervalTime <= 0) return;

    const id = setInterval(() => {
      savedCallback.current();
    }, intervalTime);

    return () => clearInterval(id);
  }, [intervalTime, ...deps]);
}
