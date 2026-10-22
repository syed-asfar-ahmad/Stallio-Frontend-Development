// ============================================================================
// Payout batch CSV export (bank / PayPal / Wise mass-payment files)
// ============================================================================

import type { PayoutBatch, PayoutMethodType } from '../affiliate/types';

const METHOD_LABEL: Record<PayoutMethodType, string> = {
  bank_transfer: 'Bank Transfer',
  paypal: 'PayPal',
  wise: 'Wise',
};

/** Escapes a cell and neutralises spreadsheet formula injection (=, +, -, @). */
function cell(value: string | number): string {
  let v = String(value);
  if (/^[=+\-@\t\r]/.test(v)) v = `'${v}`;
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export function buildPayoutBatchCsv(batch: PayoutBatch): string {
  const header = [
    'Batch ID',
    'Affiliate ID',
    'Affiliate Name',
    'Email',
    'Method',
    'Destination',
    'Amount',
    'Currency',
    'Commissions',
    'Payment Note',
  ];
  const lines = batch.items.map((i) =>
    [
      batch.id,
      i.affiliateId,
      i.affiliateName,
      i.affiliateEmail,
      METHOD_LABEL[i.method],
      i.destination,
      (i.amountCents / 100).toFixed(2),
      'USD',
      i.commissionIds.length,
      `Stallio affiliate payout ${batch.label}`,
    ]
      .map(cell)
      .join(','),
  );
  return [header.map(cell).join(','), ...lines].join('\r\n');
}

export function downloadPayoutBatchCsv(batch: PayoutBatch): void {
  // BOM keeps non-ASCII names intact when opened in Excel.
  const blob = new Blob(['\uFEFF', buildPayoutBatchCsv(batch)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `stallio-affiliate-payouts-${batch.id}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
