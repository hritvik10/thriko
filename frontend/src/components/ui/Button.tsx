import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './Button.module.css';

type Variant = 'primary' | 'outline' | 'light' | 'ghostLight';
type Size = 'md' | 'sm';

interface BaseProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  /** Show a trailing arrow that nudges on hover. */
  withArrow?: boolean;
}

type LinkButtonProps = BaseProps & { to: string; href?: never };
type AnchorButtonProps = BaseProps & { href: string; to?: never };
type NativeButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & { to?: never; href?: never };

export type ButtonProps = LinkButtonProps | AnchorButtonProps | NativeButtonProps;

/**
 * One button component for three jobs: in-app navigation (`to`),
 * external/mailto links (`href`) and form actions (neither).
 */
export default function Button({ children, variant = 'primary', size = 'md', className, withArrow = false, ...rest }: ButtonProps) {
  const classes = [styles.button, styles[variant], styles[size], className].filter(Boolean).join(' ');

  const content = (
    <>
      {children}
      {withArrow && (
        <svg className={styles.arrow} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      )}
    </>
  );

  if (rest.to) {
    return (
      <Link to={rest.to} className={classes}>
        {content}
      </Link>
    );
  }

  if (rest.href) {
    return (
      <a href={rest.href} className={classes}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" {...(rest as Omit<NativeButtonProps, keyof BaseProps>)} className={classes}>
      {content}
    </button>
  );
}
