'use client';
import { useEffect, useState } from 'react';

/**
 * Starts false and corrects in an effect, because the static export renders
 * on the server where no media query exists. Consumers must tolerate a
 * single motion-enabled frame before this settles.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
