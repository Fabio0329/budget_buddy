const currencyFormatter = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
});

export function formatCurrencyFromCents(cents: number) {
  return currencyFormatter.format(cents / 100);
}

export function formatDateForInput(value: string) {
  return value.slice(0, 10);
}
