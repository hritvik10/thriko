import type { ReactNode } from 'react';
import styles from './Container.module.css';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/** Centres content and applies the site-wide max width and gutters. */
export default function Container({ children, className }: ContainerProps) {
  return <div className={[styles.container, className].filter(Boolean).join(' ')}>{children}</div>;
}
