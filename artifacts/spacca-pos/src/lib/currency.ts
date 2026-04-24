export const CURRENCY = "EGP ";

export function fmt(amount: number, decimals = 2): string {
  return `${CURRENCY}${amount.toFixed(decimals)}`;
}
export function pure(amount: number, decimals = 2): string {
  return amount.toFixed(decimals);
}
