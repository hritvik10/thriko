/**
 * Thriko "Brace 3co" logo. The 3 is drawn as a code curly brace, followed by
 * "co" — read aloud as "Thriko".
 */
interface LogoProps {
  /** Rendered height in px; width scales with the 140×80 artwork. */
  height?: number;
  tone?: 'default' | 'onDark';
  /** Show the small spelled-out name under the mark. */
  withName?: boolean;
  className?: string;
}

const BRACE_PATH = 'M8 10H13Q23 10 23 20V31Q23 40 33 40Q23 40 23 49V60Q23 70 13 70H8';

export default function Logo({ height = 32, tone = 'default', withName = false, className }: LogoProps) {
  const braceColor = tone === 'onDark' ? '#8FC1E3' : 'var(--color-primary)';
  const letterColor = tone === 'onDark' ? '#FFFFFF' : 'var(--color-navy)';
  const width = (height * 140) / 80;

  return (
    <span className={className} style={{ display: 'inline-flex', flexDirection: 'column', gap: 6 }}>
      <svg width={width} height={height} viewBox="0 0 140 80" role="img" aria-label="Thriko">
        <path d={BRACE_PATH} fill="none" stroke={braceColor} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M80 41A18 18 0 1 0 80 63" fill="none" stroke={letterColor} strokeWidth={8} strokeLinecap="round" />
        <circle cx={114} cy={52} r={18} fill="none" stroke={letterColor} strokeWidth={8} />
      </svg>
      {withName && (
        <span
          aria-hidden="true"
          style={{
            font: '500 11px/1 var(--font-mono)',
            letterSpacing: '0.42em',
            textTransform: 'uppercase',
            color: tone === 'onDark' ? 'var(--color-on-navy)' : 'var(--color-muted)',
            paddingLeft: 2,
          }}
        >
          Thriko
        </span>
      )}
    </span>
  );
}
