import { useEffect, useRef, useState } from 'react';

/**
 * One IntersectionObserver shared by every element on the page (cheaper than
 * one observer per element). Each element is unobserved once it has been seen.
 */
type Callback = () => void;
const callbacks = new WeakMap<Element, Callback>();
let sharedObserver: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver {
  sharedObserver ??= new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        callbacks.get(entry.target)?.();
        callbacks.delete(entry.target);
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  return sharedObserver;
}

/** Reports once an element has scrolled into view. Falls back to "visible" without IntersectionObserver. */
export function useInView<T extends Element>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = getObserver();
    callbacks.set(node, () => setInView(true));
    observer.observe(node);
    return () => {
      callbacks.delete(node);
      observer.unobserve(node);
    };
  }, []);

  return { ref, inView };
}
