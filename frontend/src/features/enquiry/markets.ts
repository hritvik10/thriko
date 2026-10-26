/**
 * Target countries, their currencies and budget thresholds.
 * Data lives in /shared/markets.json, which the Python backend also reads.
 */
import data from '../../../../shared/markets.json';

export interface Market {
  code: string;
  name: string;
  /** ISO 4217 code, e.g. "GBP". */
  currency: string;
  /** Locale used to format amounts, e.g. "en-IN" gives ₹4,00,000. */
  locale: string;
  /** Budgets (whole units of `currency`) below this show the "affordable prices guaranteed" note. */
  lowBudgetBelow: number;
}

export const OTHER_MARKET = 'OTHER';
/** Upper bound on a typed budget (mirrors backend/app/schemas.py). */
export const MAX_BUDGET = 1_000_000_000;

export const markets: readonly Market[] = data.markets;

export function findMarket(code: string): Market | undefined {
  return markets.find((market) => market.code === code);
}

/** Format a whole amount in the market's currency, e.g. 12500 → "£12,500". */
export function formatAmount(market: Market, amount: number): string {
  return new Intl.NumberFormat(market.locale, {
    style: 'currency',
    currency: market.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Currency symbol on its own, e.g. "£", "₹", "AED". */
export function currencySymbol(market: Market): string {
  const parts = new Intl.NumberFormat(market.locale, { style: 'currency', currency: market.currency }).formatToParts(0);
  return parts.find((part) => part.type === 'currency')?.value ?? market.currency;
}

/**
 * Parse what the visitor typed into a whole number.
 * Accepts digits with spaces or thousands separators ("12,500", "12.500", "12 500", "4,00,000").
 * Returns null for empty input, decimals ("12.50") or anything that is not a whole amount.
 */
export function parseAmount(input: string): number | null {
  const trimmed = input.trim();
  // A separator followed by only 1–2 digits at the end is a decimal part, not a thousands group.
  if (/[.,]\d{1,2}$/.test(trimmed)) return null;
  const cleaned = trimmed.replace(/[\s,.'’_]/g, '');
  if (!/^\d{1,13}$/.test(cleaned)) return null;
  return Number(cleaned);
}
