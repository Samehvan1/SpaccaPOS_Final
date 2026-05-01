export const CURRENCY = "EGP ";

export function fmt(amount: number | string | undefined | null, decimals = 2): string {
  const num = typeof amount === "string" ? parseFloat(amount) : (amount ?? 0);
  if (isNaN(num as number)) return `${CURRENCY}0.00`;
  return `${CURRENCY}${(num as number).toFixed(decimals)}`;
}

export function pure(amount: number | string | undefined | null, decimals = 2): string {
  const num = typeof amount === "string" ? parseFloat(amount) : (amount ?? 0);
  if (isNaN(num as number)) return "0.00";
  return (num as number).toFixed(decimals);
}
