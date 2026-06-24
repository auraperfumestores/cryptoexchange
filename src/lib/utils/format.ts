/**
 * Formatting helpers for Indian rupee amounts, crypto amounts,
 * wallet addresses, dates, and the few ad-hoc labels we render
 * repeatedly in the UI.
 *
 * Indian number formatting: first three digits from the right,
 * then every two digits. 1,23,456.78 — 1 lakh 23 thousand 456.
 */

const INDIAN_NUMBER_FORMATTER = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const INDIAN_INTEGER_FORMATTER = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

const INDIAN_RATE_FORMATTER = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

/** Format an INR amount without the symbol, e.g. 1,23,456.78 */
export function formatINRNumber(amount: number | null | undefined, options?: { showSymbol?: boolean }): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return options?.showSymbol === false ? '—' : '—';
  const formatted = INDIAN_NUMBER_FORMATTER.format(amount);
  return options?.showSymbol === false ? formatted : `₹${formatted}`;
}

/** Format an INR amount like ₹1,23,456.78 */
export function formatINR(amount: number | null | undefined, options?: { showSymbol?: boolean }): string {
  return formatINRNumber(amount, options);
}

/** Format a rate (price per 1 unit) like ₹92.45 */
export function formatRate(rate: number): string {
  if (Number.isNaN(rate) || rate === undefined || rate === null) return '—';
  return `₹${INDIAN_RATE_FORMATTER.format(rate)}`;
}

/** Format an integer with Indian grouping, no decimals */
export function formatInt(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return INDIAN_INTEGER_FORMATTER.format(n);
}

/** Format a crypto amount to 6 decimal places, monospace-styled. */
export function formatCrypto(amount: number | null | undefined, symbol?: string): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return symbol ? `0.000000 ${symbol}` : '0.000000';
  const fixed = amount.toFixed(6);
  // group integer part with Indian commas (rarely needed for crypto but harmless)
  const [intPart, decPart] = fixed.split('.');
  const grouped = new Intl.NumberFormat('en-IN').format(Number(intPart));
  const out = `${grouped}.${decPart}`;
  return symbol ? `${out} ${symbol}` : out;
}

/** Format a percentage like 2.5% */
export function formatPercent(n: number, decimals = 2): string {
  if (Number.isNaN(n) || n === undefined || n === null) return '—';
  return `${n.toFixed(decimals)}%`;
}

/** Shorten an address like 0x1234…abcd */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

/** Truncate a tx hash for display */
export function shortenTxHash(hash: string, chars = 6): string {
  if (!hash) return '';
  if (hash.length <= chars * 2 + 3) return hash;
  return `${hash.slice(0, chars)}…${hash.slice(-chars)}`;
}

/** Human-friendly relative time: "3 minutes ago", "yesterday" */
export function timeAgo(date: string | Date): string {
  const now = Date.now();
  const then = typeof date === 'string' ? new Date(date).getTime() : date.getTime();
  const diff = Math.max(0, now - then);
  const sec = Math.floor(diff / 1000);
  if (sec < 45) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} minute${min === 1 ? '' : 's'} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`;
  const day = Math.floor(hr / 24);
  if (day === 1) return 'yesterday';
  if (day < 7) return `${day} days ago`;
  return new Date(then).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Long-form date: 13 Jun 2026, 4:23 PM */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** "13 Jun 2026" */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Generate a proper 10-digit numeric transaction ID, e.g. 4827193056 */
export function generateOrderId(): string {
  let out = String(Math.floor(Math.random() * 9) + 1); // first digit 1-9, never leading zero
  for (let i = 0; i < 9; i++) {
    out += String(Math.floor(Math.random() * 10));
  }
  return out;
}
