export function parseNumberInput(value: string): number {
  if (!value) return 0
  // Remove any character that is not a digit
  const stripped = value.replace(/\D/g, "")
  return parseInt(stripped, 10) || 0
}

export function formatNumberInput(num: number): string {
  if (!num) return ""
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(num)
}

export function formatIDR(num: number): string {
  // We use standard ID formatting, but manually add "Rp " to ensure consistent spacing
  // instead of relying on browser implementation of currency style which might lack spaces.
  const formatted = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(num)
  return `Rp ${formatted}`
}
