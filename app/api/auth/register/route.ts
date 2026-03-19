import { NextResponse } from "next/server";
import { getUserByEmail, createUser } from "../../../lib/users";

export async function POST(req: Request) {
  const { name, email, password } = await req.json().catch(() => ({}));

  if (!name?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: "Заповніть усі поля" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Пароль — мінімум 6 символів" }, { status: 400 });
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "Акаунт з таким email вже існує" }, { status: 409 });
  }

  const user = await createUser({ email, name, password });
  return NextResponse.json({ ok: true, email: user.email });
}
