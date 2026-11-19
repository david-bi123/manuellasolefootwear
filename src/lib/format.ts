const currencyFormatter = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  currencyDisplay: "narrowSymbol",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat("en-GH", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatMoney(amount: number | null | undefined, currency = "GHS") {
  const value = Number(amount ?? 0);
  if (currency && currency !== "GHS") {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

export function formatCompactMoney(amount: number) {
  return `GH₵${compactFormatter.format(Number(amount ?? 0))}`;
}

export function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat("en-GH").format(Number(value ?? 0));
}

export function formatPercent(value: number | null | undefined, digits = 1) {
  const n = Number(value ?? 0);
  return `${Number.isFinite(n) ? n.toFixed(digits) : "0.0"}%`;
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function toDateInputValue(value: Date | string = new Date()) {
  const date = typeof value === "string" ? new Date(value) : value;
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}
