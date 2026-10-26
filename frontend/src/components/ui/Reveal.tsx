import { useEffect, useState, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { useInView } from '../../hooks/useInView';

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Stagger delay in milliseconds. */
  delay?: number;
}

/**
 * Fades content up as it scrolls into view. Content renders visible on the
 * server/first paint and is only hidden after mount, so nothing is lost if
 * JavaScript fails. Motion is disabled by CSS for reduced-motion users.
 */
export default function Reveal({ children, as: Tag = 'div', className, delay = 0 }: RevealProps) {
  const { ref, inView } = useInView<HTMLElement>();
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  const classes = [className, ready && 'reveal-ready', inView && 'reveal-visible'].filter(Boolean).join(' ');
  const style: CSSProperties | undefined = delay ? { transitionDelay: `${delay}ms` } : undefined;

  return (
    <Tag ref={ref} className={classes || undefined} style={style}>
      {children}
    </Tag>
  );
}
