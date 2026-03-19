import { NextResponse } from "next/server";
import { kvGet, kvSet } from "../../../lib/kv";
import { PRODUCTS } from "../../../data/products";
import type { Product } from "../../../data/products";

const PRODUCTS_KEY = "products:all";

export async function getProducts(): Promise<Product[]> {
  const res = await kvGet<Product[]>(PRODUCTS_KEY);
  if (res.ok && res.value && res.value.length > 0) return res.value;
  return PRODUCTS;
}

function checkAuth(req: Request): boolean {
  const token = req.headers.get("x-admin-token");
  return token === process.env.ADMIN_PASSWORD;
}

export async function GET(req: Request) {
  const token = req.headers.get("x-admin-token");
  const isAdmin = token === process.env.ADMIN_PASSWORD;
  const products = await getProducts();
  if (isAdmin) return NextResponse.json({ products });
  const safeProducts = products.map(({ ...p }) => p);
  return NextResponse.json({ products: safeProducts });
}

export async function POST(req: Request) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body?.id || !body?.title || !body?.price) {
    return NextResponse.json({ error: "id, title, price — обов'язкові поля" }, { status: 400 });
  }
  const products = await getProducts();
  if (products.find((p) => p.id === body.id)) {
    return NextResponse.json({ error: "Товар з таким id вже існує" }, { status: 409 });
  }
  const updated = [...products, body as Product];
  await kvSet(PRODUCTS_KEY, updated);
  return NextResponse.json({ ok: true, product: body });
}

export async function PUT(req: Request) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: "id обов'язковий" }, { status: 400 });
  const products = await getProducts();
  const idx = products.findIndex((p) => p.id === body.id);
  if (idx === -1) return NextResponse.json({ error: "Товар не знайдено" }, { status: 404 });
  const updated = [...products];
  updated[idx] = { ...products[idx], ...body };
  await kvSet(PRODUCTS_KEY, updated);
  return NextResponse.json({ ok: true, product: updated[idx] });
}

export async function DELETE(req: Request) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "id обов'язковий" }, { status: 400 });
  const products = await getProducts();
  const updated = products.filter((p) => p.id !== id);
  if (updated.length === products.length) return NextResponse.json({ error: "Товар не знайдено" }, { status: 404 });
  await kvSet(PRODUCTS_KEY, updated);
  return NextResponse.json({ ok: true });
}
