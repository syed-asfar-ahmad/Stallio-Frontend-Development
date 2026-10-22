// ============================================================================
// Currency & Financial Formatting Utilities
// ============================================================================

/**
 * Formats an integer amount in cents to a formatted currency string (e.g. 500 cents -> "$5.00").
 */
export function formatCents(
  cents: number | null | undefined,
  options: {
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  if (cents === null || cents === undefined || !Number.isFinite(cents)) {
    return '$0.00';
  }

  const {
    currency = 'USD',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;

  const dollars = cents / 100;

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(dollars);
  } catch {
    // Fallback if Intl format fails
    return `$${dollars.toFixed(2)}`;
  }
}

/**
 * Formats basis points into a percentage string (e.g. 2000 bps -> "20%", 1550 bps -> "15.5%").
 */
export function formatBps(bps: number | null | undefined): string {
  if (bps === null || bps === undefined || !Number.isFinite(bps)) {
    return '0%';
  }

  const percent = bps / 100;
  // If it's a whole number, omit decimals (e.g. 20% instead of 20.00%)
  if (percent % 1 === 0) {
    return `${percent.toFixed(0)}%`;
  }
  return `${percent.toFixed(1)}%`;
}

/**
 * Converts a dollar decimal input (e.g. 5 or "5.50") into integer cents (550).
 */
export function dollarsToCents(amount: number | string): number {
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (!Number.isFinite(numeric)) return 0;
  return Math.round(numeric * 100);
}
