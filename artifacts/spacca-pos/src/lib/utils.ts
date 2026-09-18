import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPaymentMethod(method?: string | null): string {
  if (!method) return "-";
  const m = method.toLowerCase();
  if (m === "partner_card") return "Partner Card";
  if (m === "cash") return "Cash";
  if (m === "card") return "Card";
  if (m === "wallet") return "Wallet";
  if (m === "hospitality") return "Hospitality";
  if (m === "split") return "Split";
  if (m === "refund") return "Refund";
  if (m === "points") return "Points";
  return method.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
