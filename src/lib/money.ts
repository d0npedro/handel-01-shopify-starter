import type { Money } from "@/lib/types";

export function formatMoney(money: Money, locale = "de-DE") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currencyCode,
  }).format(Number(money.amount));
}

export function multiplyMoney(money: Money, quantity: number): Money {
  return {
    amount: (Number(money.amount) * quantity).toFixed(2),
    currencyCode: money.currencyCode,
  };
}
