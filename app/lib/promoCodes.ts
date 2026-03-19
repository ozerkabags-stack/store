export type PromoCode = {
  code: string;
  discount: number;
  type: "percent" | "fixed";
  description: string;
};

const PROMO_CODES: PromoCode[] = [
  { code: "OZERRA10", discount: 10, type: "percent", description: "Знижка 10%" },
  { code: "OZERRA20", discount: 20, type: "percent", description: "Знижка 20%" },
  { code: "WELCOME15", discount: 15, type: "percent", description: "Знижка 15% для нових клієнтів" },
  { code: "BAGS200", discount: 200, type: "fixed", description: "Знижка 200 ₴" },
  { code: "BAGS500", discount: 500, type: "fixed", description: "Знижка 500 ₴" },
];

export function validatePromo(code: string): PromoCode | null {
  const normalized = code.trim().toUpperCase();
  return PROMO_CODES.find((p) => p.code === normalized) ?? null;
}

export function applyPromo(total: number, promo: PromoCode): number {
  if (promo.type === "percent") {
    return Math.max(0, Math.round(total * (1 - promo.discount / 100)));
  }
  return Math.max(0, total - promo.discount);
}

