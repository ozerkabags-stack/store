"use client";

import { useEffect, useState, useRef } from "react";
import type { Product } from "../data/products";

const EMPTY_PRODUCT: Partial<Product> = {
  id: "", title: "", short: "", price: 0, oldPrice: undefined,
  image: "", material: "", dimensions: "", capacity: "",
  category: "bag", badge: undefined, inStock: true,
  tags: [], colors: [],
};

type Tab = "products" | "add" | "edit";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState("");
  const [token, setToken] = useState("");

  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"ok" | "err">("ok");

  const [editProduct, setEditProduct] = useState<Partial<Product>>(EMPTY_PRODUCT);
  const [isNew, setIsNew] = useState(false);

  function showMsg(text: string, type: "ok" | "err" = "ok") {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(""), 3500);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/products", {
      headers: { "x-admin-token": pwInput },
    });
    if (res.ok) {
      const data = await res.json();
      setToken(pwInput); setAuthed(true);
      setProducts(data.products ?? []);
    } else {
      setPwError("Невірний пароль");
    }
  }

  async function loadProducts() {
    setLoading(true);
    const res = await fetch("/api/admin/products", { headers: { "x-admin-token": token } });
    const data = await res.json();
    setProducts(data.products ?? []);
    setLoading(false);
  }

  async function handleSave() {
    if (!editProduct.id?.trim()) { showMsg("ID товару обов'язковий", "err"); return; }
    if (!editProduct.title?.trim()) { showMsg("Назва обов'язкова", "err"); return; }
    if (!editProduct.price || editProduct.price <= 0) { showMsg("Ціна обов'язкова", "err"); return; }

    const method = isNew ? "POST" : "PUT";
    const res = await fetch("/api/admin/products", {
      method, headers: { "Content-Type": "application/json", "x-admin-token": token },
      body: JSON.stringify(editProduct),
    });
    const data = await res.json();
    if (!res.ok) { showMsg(data.error ?? "Помилка", "err"); return; }
    showMsg(isNew ? "Товар додано!" : "Збережено!");
    await loadProducts();
    setTab("products");
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Видалити "${title}"?`)) return;
    const res = await fetch("/api/admin/products", {
      method: "DELETE", headers: { "Content-Type": "application/json", "x-admin-token": token },
      body: JSON.stringify({ id }),
    });
    if (res.ok) { showMsg("Видалено"); await loadProducts(); }
    else showMsg("Помилка видалення", "err");
  }

  function startEdit(p: Product) {
    setEditProduct({ ...p });
    setIsNew(false);
    setTab("edit");
  }

  function startAdd() {
    setEditProduct({ ...EMPTY_PRODUCT, id: `product-${Date.now()}` });
    setIsNew(true);
    setTab("edit");
  }

  function toggleTag(tag: string) {
    const tags = editProduct.tags ?? [];
    setEditProduct({ ...editProduct, tags: tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag] });
  }

  const inp: React.CSSProperties = {
    padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border-strong)",
    background: "var(--card)", color: "inherit", fontSize: 14, outline: "none",
    width: "100%", boxSizing: "border-box",
  };
  const label: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4, display: "block" };
  const row: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 4 };

  if (!authed) {
    return (
      <main className="container" style={{ paddingTop: 60, paddingBottom: 60 }}>
        <div style={{ maxWidth: 360, margin: "0 auto" }}>
          <h1 style={{ marginBottom: 4 }}>Адмін-панель</h1>
          <p style={{ color: "var(--muted)", marginBottom: 24, fontSize: 14 }}>Тільки для власника магазину</p>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={row}>
              <label style={label}>Пароль</label>
              <input style={inp} type="password" value={pwInput}
                onChange={(e) => { setPwInput(e.target.value); setPwError(""); }}
                placeholder="Введіть пароль адміна" required autoFocus />
              {pwError && <div style={{ fontSize: 12, color: "#ff4d4f" }}>{pwError}</div>}
            </div>
            <button type="submit" className="btn btnAccent btnFull">Увійти</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ paddingTop: 28, paddingBottom: 60 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>Адмін-панель</h1>
          <p style={{ margin: 0, fontSize: 13, color: "var(--muted)", marginTop: 2 }}>Управління товарами Ozerra Bags</p>
        </div>
        <button type="button" className="btn btnAccent" onClick={startAdd}>
          + Додати товар
        </button>
      </div>

      {msg && (
        <div style={{
          padding: "12px 16px", borderRadius: 10, marginBottom: 16, fontSize: 14, fontWeight: 600,
          background: msgType === "ok" ? "rgba(62,207,90,0.1)" : "rgba(255,77,79,0.1)",
          border: `1px solid ${msgType === "ok" ? "rgba(62,207,90,0.3)" : "rgba(255,77,79,0.3)"}`,
          color: msgType === "ok" ? "var(--accent)" : "#ff4d4f",
        }}>
          {msgType === "ok" ? "✓ " : "✕ "}{msg}
        </div>
      )}

      {/* === Product list === */}
      {tab === "products" && (
        <div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
            Всього товарів: <strong>{products.length}</strong>
          </div>
          {loading ? <p style={{ color: "var(--muted)" }}>Завантаження…</p> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {products.map((p) => (
                <div key={p.id} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                  border: "1px solid var(--border-strong)", borderRadius: 12, background: "var(--card)",
                  flexWrap: "wrap",
                }}>
                  {p.image && (
                    <img src={p.image} alt={p.title} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>ID: {p.id} · {p.category ?? "—"}</div>
                    {p.tags && p.tags.length > 0 && (
                      <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                        {p.tags.map((t) => (
                          <span key={t} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "var(--card-hover)", border: "1px solid var(--border)" }}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 17, color: "var(--accent)" }}>{p.price.toLocaleString("uk-UA")} ₴</div>
                    {p.oldPrice && <div style={{ fontSize: 12, color: "var(--muted)", textDecoration: "line-through" }}>{p.oldPrice.toLocaleString("uk-UA")} ₴</div>}
                    <div style={{ fontSize: 12, marginTop: 2, color: p.inStock !== false ? "var(--accent)" : "#ff4d4f" }}>
                      {p.inStock !== false ? "● В наявності" : "● Немає"}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button type="button" className="btn" style={{ fontSize: 13, padding: "7px 14px" }} onClick={() => startEdit(p)}>
                      Редагувати
                    </button>
                    <button type="button" onClick={() => handleDelete(p.id, p.title)}
                      style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid rgba(255,77,79,0.4)", background: "rgba(255,77,79,0.08)", color: "#ff4d4f", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                      Видалити
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* === Add / Edit form === */}
      {tab === "edit" && (
        <div style={{ maxWidth: 640 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <button type="button" className="btn" style={{ fontSize: 13 }} onClick={() => setTab("products")}>
              ← Назад
            </button>
            <h2 style={{ margin: 0, fontSize: 20 }}>{isNew ? "Новий товар" : `Редагування: ${editProduct.title}`}</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ ...row, gridColumn: "1 / -1" }}>
              <label style={label}>Назва товару *</label>
              <input style={inp} value={editProduct.title ?? ""} onChange={(e) => setEditProduct({ ...editProduct, title: e.target.value })} placeholder="Шкіряна сумка-шопер" />
            </div>

            <div style={row}>
              <label style={label}>ID товару *</label>
              <input style={{ ...inp, opacity: isNew ? 1 : 0.6 }} value={editProduct.id ?? ""} readOnly={!isNew}
                onChange={(e) => setEditProduct({ ...editProduct, id: e.target.value.toLowerCase().replace(/\s/g, "-") })}
                placeholder="shopka-classic" />
              {isNew && <span style={{ fontSize: 11, color: "var(--muted)" }}>Латиниця, без пробілів</span>}
            </div>

            <div style={row}>
              <label style={label}>Категорія</label>
              <select style={inp} value={editProduct.category ?? "bag"}
                onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}>
                <option value="bag">Сумки</option>
                <option value="backpack">Рюкзаки</option>
                <option value="clutch">Клатчі</option>
                <option value="wallet">Гаманці</option>
                <option value="belt">Пояси</option>
              </select>
            </div>

            <div style={row}>
              <label style={label}>Ціна (₴) *</label>
              <input style={inp} type="number" min="0" value={editProduct.price ?? ""}
                onChange={(e) => setEditProduct({ ...editProduct, price: Number(e.target.value) })} placeholder="1500" />
            </div>

            <div style={row}>
              <label style={label}>Стара ціна (₴)</label>
              <input style={inp} type="number" min="0" value={editProduct.oldPrice ?? ""}
                onChange={(e) => setEditProduct({ ...editProduct, oldPrice: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="2000 (для показу знижки)" />
            </div>

            <div style={{ ...row, gridColumn: "1 / -1" }}>
              <label style={label}>Короткий опис</label>
              <input style={inp} value={editProduct.short ?? ""} onChange={(e) => setEditProduct({ ...editProduct, short: e.target.value })} placeholder="Місткий шопер з натуральної шкіри" />
            </div>

            <div style={{ ...row, gridColumn: "1 / -1" }}>
              <label style={label}>URL головного фото</label>
              <input style={inp} value={editProduct.image ?? ""} onChange={(e) => setEditProduct({ ...editProduct, image: e.target.value })} placeholder="https://..." />
              {editProduct.image && (
                <img src={editProduct.image} alt="preview" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, marginTop: 6, border: "1px solid var(--border)" }} />
              )}
            </div>

            <div style={row}>
              <label style={label}>Матеріал</label>
              <input style={inp} value={editProduct.material ?? ""} onChange={(e) => setEditProduct({ ...editProduct, material: e.target.value })} placeholder="Натуральна шкіра" />
            </div>

            <div style={row}>
              <label style={label}>Розміри (Ш×В×Г)</label>
              <input style={inp} value={editProduct.dimensions ?? ""} onChange={(e) => setEditProduct({ ...editProduct, dimensions: e.target.value })} placeholder="35×28×12 см" />
            </div>

            <div style={row}>
              <label style={label}>Вмісткість</label>
              <input style={inp} value={editProduct.capacity ?? ""} onChange={(e) => setEditProduct({ ...editProduct, capacity: e.target.value })} placeholder="Ноутбук 15&quot;" />
            </div>

            <div style={row}>
              <label style={label}>Бейдж</label>
              <select style={inp} value={editProduct.badge ?? ""}
                onChange={(e) => setEditProduct({ ...editProduct, badge: (e.target.value as "hit" | "new") || undefined })}>
                <option value="">— без бейджа —</option>
                <option value="hit">🔥 ХІТ</option>
                <option value="new">✨ НОВИНКА</option>
              </select>
            </div>

            <div style={{ ...row, gridColumn: "1 / -1" }}>
              <label style={label}>Теги</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["хіт", "новинка", "розпродаж", "популярне", "ексклюзив"].map((tag) => (
                  <button key={tag} type="button" onClick={() => toggleTag(tag)}
                    style={{
                      padding: "6px 14px", borderRadius: 8, border: "1px solid var(--border-strong)",
                      cursor: "pointer", fontSize: 13, fontWeight: 600,
                      background: (editProduct.tags ?? []).includes(tag) ? "var(--accent)" : "var(--card)",
                      color: (editProduct.tags ?? []).includes(tag) ? "var(--accent-fg)" : "inherit",
                    }}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ ...row, gridColumn: "1 / -1" }}>
              <label style={{ ...label, marginBottom: 8 }}>Наявність</label>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input type="checkbox" checked={editProduct.inStock !== false}
                  onChange={(e) => setEditProduct({ ...editProduct, inStock: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: "var(--accent)", cursor: "pointer" }} />
                <span style={{ fontSize: 14 }}>Товар в наявності</span>
              </label>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <button type="button" className="btn btnAccent" style={{ flex: 1, padding: "13px" }} onClick={handleSave}>
              {isNew ? "Додати товар" : "Зберегти зміни"}
            </button>
            <button type="button" className="btn" style={{ padding: "13px 20px" }} onClick={() => setTab("products")}>
              Скасувати
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
