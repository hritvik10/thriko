import type { ReactNode } from 'react';
import styles from './SectionHeading.module.css';

interface SectionHeadingProps {
  id: string;
  kicker: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: 'left' | 'center';
  tone?: 'default' | 'onDark';
}

/** Kicker + heading + optional lead paragraph used at the top of each section. */
export default function SectionHeading({ id, kicker, title, lead, align = 'left', tone = 'default' }: SectionHeadingProps) {
  const classes = [styles.heading, align === 'center' && styles.center, tone === 'onDark' && styles.onDark]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <span className={styles.kicker}>{kicker}</span>
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
      {lead && <p className={styles.lead}>{lead}</p>}
    </div>
  );
}
