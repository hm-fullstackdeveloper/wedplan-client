export function getInitials(name?: string | null): string {
  if (!name) {
    return "W";
  }

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "W";
}

export function formatDate(value: unknown): string {
  if (!value) {
    return "—";
  }

  const date = value instanceof Date ? value : new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: unknown): string {
  if (!value) {
    return "—";
  }

  const date = value instanceof Date ? value : new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatCurrency(amount: unknown, currency = "usd"): string {
  const numeric = typeof amount === "number" ? amount : Number(amount);

  if (!Number.isFinite(numeric)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(numeric);
}

export function formatPrice(amount: unknown): string {
  const numeric = typeof amount === "number" ? amount : Number(amount);

  if (!Number.isFinite(numeric)) {
    return "Price not set";
  }

  return `$${numeric.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })}`;
}
