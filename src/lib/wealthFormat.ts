/** Compact INR display — aligns with Claude Design mock (Cr / L). */
export function fmtCompactInr(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`
  if (abs >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`
  return n.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  })
}

export function fmtInr0(n: number): string {
  return n.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  })
}

/** Split "₹1,23,456" style amount for hero typography */
export function splitInrAmount(n: number): { symbol: string; amount: string } {
  const amount = Math.round(n).toLocaleString('en-IN')
  return { symbol: '₹', amount }
}
