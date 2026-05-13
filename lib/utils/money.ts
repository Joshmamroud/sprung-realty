const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const num = new Intl.NumberFormat("en-US");

export function formatPrice(value: number | null | undefined, suffix?: string): string {
  if (value == null) return "Inquire";
  return suffix ? `${usd.format(value)} ${suffix}` : usd.format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null) return "—";
  return num.format(value);
}

export function formatLotSize(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${num.format(value)} sq ft`;
}
