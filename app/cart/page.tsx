"use client";

import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { items, inc, dec, remove, clearCart, total } = useCart();

  return (
    <main style={{ padding: "40px" }}>
      <h1>Кошик</h1>

      {items.length === 0 ? (
        <p>Кошик порожній</p>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  border: "1px solid #444",
                  padding: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  maxWidth: "520px",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{item.title}</div>
                  <div style={{ opacity: 0.8 }}>
                    {item.price} грн × {item.qty} = {item.price * item.qty} грн
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button type="button" onClick={() => dec(item.id)} style={{ cursor: "pointer" }}>
                    –
                  </button>
                  <span>{item.qty}</span>
                  <button type="button" onClick={() => inc(item.id)} style={{ cursor: "pointer" }}>
                    +
                  </button>

                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    style={{ cursor: "pointer", marginLeft: "10px" }}
                  >
                    Видалити
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "20px", fontWeight: 700 }}>Разом: {total} грн</div>

          <div style={{ marginTop: "12px", display: "flex", gap: "12px" }}>
            <button type="button" onClick={clearCart} style={{ cursor: "pointer" }}>
              Очистити кошик
            </button>

            <a href="/checkout" style={{ padding: "6px 10px", border: "1px solid #444" }}>
              Оформити замовлення →
            </a>
          </div>
        </>
      )}
    </main>
  );
}
