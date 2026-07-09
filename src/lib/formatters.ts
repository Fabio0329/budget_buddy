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

export function monthLabelFromKey(month: string) {
  const [year, monthNumber] = month.split("-");
  const date = new Date(Number(year), Number(monthNumber) - 1, 1);

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function monthStartAndEnd(month: string) {
  const [year, monthNumber] = month.split("-");
  const startDate = new Date(Number(year), Number(monthNumber) - 1, 1);
  const endDate = new Date(Number(year), Number(monthNumber), 0);

  const start = startDate.toISOString().slice(0, 10);
  const end = endDate.toISOString().slice(0, 10);

  return {
    start,
    end,
  };
}
