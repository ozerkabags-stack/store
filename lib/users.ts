import { kvGet, kvSet } from "./kv";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export type UserRecord = {
  id: string;
  email: string;
  name: string;
  passwordHash?: string;
  phone?: string;
  savedFio?: string;
  savedCity?: string;
  savedCityRef?: string;
  savedPoint?: string;
  savedPointRef?: string;
  orderIds: string[];
  promoCode: string;
  createdAt: string;
};

function userKey(email: string) {
  return `user:${email.toLowerCase().trim()}`;
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const res = await kvGet<UserRecord>(userKey(email));
  if (!res.ok) return null;
  return res.value ?? null;
}

export async function createUser(data: {
  email: string;
  name: string;
  password?: string;
}): Promise<UserRecord> {
  const passwordHash = data.password ? await bcrypt.hash(data.password, 12) : undefined;
  const user: UserRecord = {
    id: randomUUID(),
    email: data.email.toLowerCase().trim(),
    name: data.name.trim(),
    passwordHash,
    orderIds: [],
    promoCode: `LOYAL${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    createdAt: new Date().toISOString(),
  };
  await kvSet(userKey(user.email), user);
  return user;
}

export async function verifyPassword(user: UserRecord, password: string): Promise<boolean> {
  if (!user.passwordHash) return false;
  return bcrypt.compare(password, user.passwordHash);
}

export async function updateUser(email: string, fields: Partial<UserRecord>): Promise<void> {
  const user = await getUserByEmail(email);
  if (!user) return;
  await kvSet(userKey(email), { ...user, ...fields });
}

export async function addOrderToUser(email: string, orderId: string): Promise<void> {
  const user = await getUserByEmail(email);
  if (!user) return;
  const orderIds = Array.from(new Set([...(user.orderIds ?? []), orderId]));
  await kvSet(userKey(email), { ...user, orderIds });
}
