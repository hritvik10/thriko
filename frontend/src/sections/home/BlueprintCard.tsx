import { useEffect, useState } from 'react';
import styles from './BlueprintCard.module.css';

/**
 * Hero visual: a "project blueprint" written as code, which types itself in
 * line by line. It echoes the brace logo and summarises how Thriko works.
 */
type TokenKind = 'keyword' | 'key' | 'string' | 'punct' | 'comment' | 'plain';
type Line = [TokenKind, string][];

const LINES: Line[] = [
  [['comment', '// thriko.blueprint.ts']],
  [['keyword', 'export const '], ['plain', 'project'], ['punct', ' = {']],
  [['key', '  name'], ['punct', ': '], ['string', '"Your next product"'], ['punct', ',']],
  [['key', '  platforms'], ['punct', ': ['], ['string', '"web"'], ['punct', ', '], ['string', '"ios"'], ['punct', ', '], ['string', '"android"'], ['punct', '],']],
  [['key', '  pricing'], ['punct', ': '], ['string', '"fixed"'], ['punct', ','], ['comment', '   // agreed up front']],
  [['key', '  demos'], ['punct', ': '], ['string', '"weekly"'], ['punct', ',']],
  [['key', '  team'], ['punct', ': '], ['string', '"dedicated"'], ['punct', ',']],
  [['key', '  ai'], ['punct', ': { '], ['key', 'llm'], ['punct', ': '], ['keyword', 'true'], ['punct', ', '], ['key', 'mcp'], ['punct', ': '], ['keyword', 'true'], ['punct', ' },']],
  [['key', '  owner'], ['punct', ': '], ['string', '"you"'], ['punct', ','], ['comment', '   // 100% of the IP']],
  [['punct', '};']],
];

const LINE_DELAY_MS = 260;

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function BlueprintCard() {
  const [visibleLines, setVisibleLines] = useState(() => (prefersReducedMotion() ? LINES.length : 0));

  useEffect(() => {
    if (visibleLines >= LINES.length) return;
    const timer = window.setTimeout(() => setVisibleLines((count) => count + 1), LINE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [visibleLines]);

  const done = visibleLines >= LINES.length;

  return (
    <div
      className={styles.wrapper}
      role="img"
      aria-label="A project blueprint written as code: web, iOS and Android platforms, fixed pricing, weekly demos, a dedicated team, AI with LLMs and MCP, and you own the IP."
    >
      <div className={styles.card}>
        <div className={styles.titleBar}>
          <span className={styles.dots}>
            <i />
            <i />
            <i />
          </span>
          <span className={styles.fileName}>thriko.blueprint.ts</span>
        </div>
        <pre className={styles.code}>
          {LINES.map((line, index) => (
            <span key={index} className={styles.line} data-visible={index < visibleLines}>
              <span className={styles.lineNumber}>{index + 1}</span>
              {line.map(([kind, text], tokenIndex) => (
                <span key={tokenIndex} className={styles[kind]}>
                  {text}
                </span>
              ))}
              {index === Math.min(visibleLines, LINES.length) - 1 && <span className={styles.cursor} />}
            </span>
          ))}
        </pre>
        <div className={styles.status} data-done={done}>
          <span className={styles.statusDot} />
          {done ? 'Blueprint ready: let’s scope it together' : 'Writing your blueprint…'}
        </div>
      </div>

      <span className={`${styles.chip} ${styles.chipTop}`}>Web · iOS · Android</span>
      <span className={`${styles.chip} ${styles.chipBottom}`}>AI-ready</span>
    </div>
  );
}
