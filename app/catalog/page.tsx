"use client";

import { useCart } from "../context/CartContext";

export default function CatalogPage() {
  const { addToCart } = useCart();

  return (
    <main style={{ padding: "40px" }}>
      <h1>Каталог</h1>

      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ border: "1px solid #444", padding: "20px", width: "200px" }}>
          <h3>Сумка шопер</h3>
          <p>Ціна: 899 грн</p>
          <button
            type="button"
            style={{ cursor: "pointer" }}
            onClick={() => addToCart({ id: "bag1", title: "Сумка шопер", price: 899 })}
          >
            Додати в кошик
          </button>
        </div>

        <div style={{ border: "1px solid #444", padding: "20px", width: "200px" }}>
          <h3>Рюкзак міський</h3>
          <p>Ціна: 1299 грн</p>
          <button
            type="button"
            style={{ cursor: "pointer" }}
            onClick={() => addToCart({ id: "bag2", title: "Рюкзак міський", price: 1299 })}
          >
            Додати в кошик
          </button>
        </div>
      </div>
    </main>
  );
}
