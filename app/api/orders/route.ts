import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // минимальная проверка
    if (!body?.items?.length) {
      return NextResponse.json({ error: "Кошик порожній" }, { status: 400 });
    }
    if (!body?.customer?.fio || !body?.customer?.phone) {
      return NextResponse.json({ error: "Нве заповнені контакти" }, { status: 400 });
    }
    if (!body?.delivery?.cityRef || !body?.delivery?.pointRef) {
      return NextResponse.json({ error: "Нве обрана доставка" }, { status: 400 });
    }

    // тестовый orderId
    const orderId = `ORD-${Date.now()}`;

    return NextResponse.json({ orderId }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Server error in /api/orders" }, { status: 500 });
  }
}
