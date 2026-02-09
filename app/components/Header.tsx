"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function Header() {
  const { items } = useCart();

  return (
    <header
      style={{
        padding: "20px 40px",
        borderBottom: "1px solid #333",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <strong>OZERKA BAGS</strong>

      <nav style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <Link href="/">Головна</Link>
        <Link href="/catalog">Каталог</Link>
        <Link href="/cart">Кошик ({items.length})</Link>
        <Link href="/contacts">Контакти</Link>
      </nav>
    </header>
  );
}
