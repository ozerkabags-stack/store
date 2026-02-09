"use client";

import { useCart } from "../context/CartContext";
import React, { useEffect, useMemo, useRef, useState } from "react";

function useDebounced<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

function isValidFio(s: string) {
  const v = s.trim();
  // ФИО обычно 2-3 слова, но сделаем мягко: 2..60 символов
  return v.length >= 2 && v.length <= 60;
}

// UA mobile: +380XXXXXXXXX (9 цифр после +380)
function isValidPhone(s: string) {
  const v = s.replace(/\s/g, "");
  return /^\+380\d{9}$/.test(v);
}

function isValidEmail(s: string) {
  const v = s.trim();
  if (!v) return true; // email необязательный
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

type CityOption = { label: string; cityRef: string };
type WhOption = { ref: string; label: string };

type ModalProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};
function Modal({ open, title, children, onClose }: ModalProps) {
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (boxRef.current && !boxRef.current.contains(t)) onClose();
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
      }}
    >
      <div
        ref={boxRef}
        style={{
          width: "min(520px, 100%)",
          border: "1px solid #444",
          borderRadius: 14,
          background: "#0f0f0f",
          padding: 16,
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <div style={{ fontWeight: 700 }}>{title}</div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "1px solid #444",
              background: "transparent",
              color: "inherit",
              borderRadius: 10,
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            Закрити
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { items, total } = useCart();

  // ===== Контактные данные
  const [fio, setFio] = useState("");
  const [phone, setPhone] = useState("+380");
  const [email, setEmail] = useState("");

  // ===== Telegram/Viber
  const [contactInMessengers, setContactInMessengers] = useState(false);
  const [tgUsername, setTgUsername] = useState(""); // например @username или просто username
  const [tgModalOpen, setTgModalOpen] = useState(false);

  // ===== Другой получатель
  const [otherReceiver, setOtherReceiver] = useState(false);
  const [receiverFio, setReceiverFio] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("+380");
  const [receiverModalOpen, setReceiverModalOpen] = useState(false);

  // ===== Доставка НП
  const [city, setCity] = useState("");
  const [cityRef, setCityRef] = useState("");
  const [npPoint, setNpPoint] = useState(""); // выбранное отделение/поштомат (label)
  const [npPointRef, setNpPointRef] = useState(""); // ref отделения/поштомата (лучше сохранять)

  // dropdown data
  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
  const [cityLoading, setCityLoading] = useState(false);

  const [whOptions, setWhOptions] = useState<WhOption[]>([]);
  const [whLoading, setWhLoading] = useState(false);

  // dropdown open/close + refs
  const cityBoxRef = useRef<HTMLDivElement | null>(null);
  const npBoxRef = useRef<HTMLDivElement | null>(null);
  const [cityOpen, setCityOpen] = useState(false);
  const [npOpen, setNpOpen] = useState(false);

  // touched — ошибки только после взаимодействия
  const [touched, setTouched] = useState({
    fio: false,
    phone: false,
    email: false,
    tg: false,
    receiverFio: false,
    receiverPhone: false,
    city: false,
    np: false,
  });

  // debounced values
  const dFio = useDebounced(fio, 700);
  const dPhone = useDebounced(phone, 700);
  const dEmail = useDebounced(email, 600);

  const dCity = useDebounced(city, 500);
  const dNp = useDebounced(npPoint, 500);

  // ====== закрытие dropdown по клику вне + ESC
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      const t = e.target as Node;
      if (cityBoxRef.current && !cityBoxRef.current.contains(t)) setCityOpen(false);
      if (npBoxRef.current && !npBoxRef.current.contains(t)) setNpOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setCityOpen(false);
        setNpOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  // ====== NP: поиск городов
  useEffect(() => {
    const q = dCity.trim();
    if (q.length < 2) {
      setCityOptions([]);
      return;
    }

    setCityLoading(true);
    fetch(`/api/np/cities?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((json) => setCityOptions(json?.data ?? []))
      .catch(() => setCityOptions([]))
      .finally(() => setCityLoading(false));
  }, [dCity]);

  // ====== NP: поиск отделений/поштоматов (зависит от cityRef)
  useEffect(() => {
    if (!cityRef) {
      setWhOptions([]);
      return;
    }

    const q = dNp.trim();
    if (q.length < 1) {
      setWhOptions([]);
      return;
    }

    setWhLoading(true);
    fetch(`/api/np/warehouses?cityRef=${encodeURIComponent(cityRef)}&q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((json) => setWhOptions(json?.data ?? []))
      .catch(() => setWhOptions([]))
      .finally(() => setWhLoading(false));
  }, [cityRef, dNp]);

  // ====== открывать модалки при включении
  useEffect(() => {
    if (contactInMessengers) setTgModalOpen(true);
    else {
      setTgModalOpen(false);
      setTgUsername("");
      setTouched((t) => ({ ...t, tg: false }));
    }
  }, [contactInMessengers]);

  useEffect(() => {
    if (otherReceiver) setReceiverModalOpen(true);
    else {
      setReceiverModalOpen(false);
      setReceiverFio("");
      setReceiverPhone("+380");
      setTouched((t) => ({ ...t, receiverFio: false, receiverPhone: false }));
    }
  }, [otherReceiver]);

  // ====== validation
  const errors = useMemo(() => {
    const tgRequired = contactInMessengers;
    const recvRequired = otherReceiver;

    return {
      fio: touched.fio && !isValidFio(dFio) ? "Вкажіть ПІБ (2–60 символів)" : "",
      phone: touched.phone && !isValidPhone(dPhone) ? "Невірний телефон (+380XXXXXXXXX)" : "",
      email: touched.email && !isValidEmail(dEmail) ? "Невірний email" : "",

      tg:
        tgRequired && touched.tg && tgUsername.trim().length < 3
          ? "Вкажіть нік у Telegram (наприклад, @username)"
          : "",

      receiverFio:
        recvRequired && touched.receiverFio && !isValidFio(receiverFio)
          ? "Вкажіть ПІБ отримувача"
          : "",
      receiverPhone:
        recvRequired && touched.receiverPhone && !isValidPhone(receiverPhone)
          ? "Невірний телефон отримувача"
          : "",

      city: touched.city && dCity.trim().length < 2 ? "Вкажіть місто" : "",
      np: touched.np && dNp.trim().length < 2 ? "Вкажіть відділення / поштомат" : "",
    };
  }, [
    dFio,
    dPhone,
    dEmail,
    dCity,
    dNp,
    touched,
    contactInMessengers,
    tgUsername,
    otherReceiver,
    receiverFio,
    receiverPhone,
  ]);

  const payDisabled = useMemo(() => {
    const baseErr = Boolean(
      errors.fio ||
        errors.phone ||
        errors.email ||
        errors.city ||
        errors.np ||
        errors.tg ||
        errors.receiverFio ||
        errors.receiverPhone
    );

    const deliveryOk = Boolean(cityRef && npPointRef);
    const tgOk = !contactInMessengers || tgUsername.trim().length >= 3;
    const recvOk = !otherReceiver || (isValidFio(receiverFio) && isValidPhone(receiverPhone));

    return baseErr || !deliveryOk || !tgOk || !recvOk;
  }, [
    errors.fio,
    errors.phone,
    errors.email,
    errors.city,
    errors.np,
    errors.tg,
    errors.receiverFio,
    errors.receiverPhone,
    cityRef,
    npPointRef,
    contactInMessengers,
    tgUsername,
    otherReceiver,
    receiverFio,
    receiverPhone,
  ]);

  async function handlePay() {
    // Принудительно показываем ошибки
    setTouched({
      fio: true,
      phone: true,
      email: true,
      tg: true,
      receiverFio: true,
      receiverPhone: true,
      city: true,
      np: true,
    });

    if (payDisabled) return;

    // Тут: создаём заказ и дальше редирект на LiqPay
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: {
          fio,
          phone,
          email,
          contactInMessengers,
          tgUsername: contactInMessengers ? tgUsername.trim() : "",
          otherReceiver,
          receiver: otherReceiver
            ? { fio: receiverFio.trim(), phone: receiverPhone.replace(/\s/g, "") }
            : null,
        },
        delivery: {
          provider: "nova_poshta",
          cityLabel: city,
          cityRef,
          pointLabel: npPoint,
          pointRef: npPointRef,
        },
        items,
        total,
      }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(json?.error ?? "Помилка створення замовлення");
      return;
    }

    alert(`Замовлення створено ✅ ID: ${json.orderId}\nДалі підключимо LiqPay.`);
  }

  if (items.length === 0) {
    return (
      <main style={{ padding: 40 }}>
        <h1>Оформлення замовлення</h1>
        <p>Кошик порожній</p>
      </main>
    );
  }

  const inputBase: React.CSSProperties = {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #444",
    background: "transparent",
    color: "inherit",
    outline: "none",
  };
  const fieldWrap: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6 };
  const errorText: React.CSSProperties = { color: "#ff4d4f", fontSize: 12 };
  const getBorder = (err: string) => (err ? "1px solid #ff4d4f" : "1px solid #444");

  const toggleRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
    userSelect: "none",
  };

  return (
    <main style={{ padding: 40, maxWidth: 560 }}>
      <h1>Оформлення замовлення</h1>

      {/* ===== Контактные данные */}
      <h3 style={{ marginTop: 18 }}>Контактні дані</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
        <div style={fieldWrap}>
          <input
            style={{ ...inputBase, border: getBorder(errors.fio) }}
            placeholder="ПІБ (повністю)"
            value={fio}
            onChange={(e) => setFio(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, fio: true }))}
          />
          {errors.fio ? <div style={errorText}>{errors.fio}</div> : null}
        </div>

        <div style={fieldWrap}>
          <input
            style={{ ...inputBase, border: getBorder(errors.phone) }}
            placeholder="+380XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            inputMode="tel"
          />
          {errors.phone ? <div style={errorText}>{errors.phone}</div> : null}
        </div>

        <div style={fieldWrap}>
          <input
            style={{ ...inputBase, border: getBorder(errors.email) }}
            placeholder="Email (необов’язково)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            inputMode="email"
          />
          {errors.email ? <div style={errorText}>{errors.email}</div> : null}
        </div>

        <label style={toggleRow}>
          <input
            type="checkbox"
            checked={contactInMessengers}
            onChange={(e) => setContactInMessengers(e.target.checked)}
          />
          <span>Зв’яжіться зі мною в Telegram / Viber</span>
        </label>

        <label style={toggleRow}>
          <input
            type="checkbox"
            checked={otherReceiver}
            onChange={(e) => setOtherReceiver(e.target.checked)}
          />
          <span>Одержувач — інша людина</span>
        </label>
      </div>

      {/* ===== Доставка */}
      <h3 style={{ marginTop: 22 }}>Доставка (Нова Пошта)</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
        {/* City */}
        <div ref={cityBoxRef} style={{ ...fieldWrap, position: "relative" }}>
          <input
            style={{ ...inputBase, border: getBorder(errors.city) }}
            placeholder="Місто (почніть вводити)"
            value={city}
            onFocus={() => setCityOpen(true)}
            onChange={(e) => {
              setCity(e.target.value);
              setCityOpen(true);

              // сброс доставки при ручном изменении
              setCityRef("");
              setNpPoint("");
              setNpPointRef("");
              setWhOptions([]);
            }}
            onBlur={() => setTimeout(() => setTouched((t) => ({ ...t, city: true })), 120)}
          />

          {cityOpen && city.trim().length >= 2 && (cityLoading || cityOptions.length >= 0) && (
            <div
              style={{
                position: "absolute",
                top: 52,
                left: 0,
                right: 0,
                border: "1px solid #444",
                borderRadius: 12,
                background: "#111",
                zIndex: 50,
                maxHeight: 320,
                overflowY: "auto",
                overflowX: "hidden",
              }}
            >
              {cityLoading ? (
                <div style={{ padding: "10px 12px", opacity: 0.7 }}>Пошук…</div>
              ) : cityOptions.length > 0 ? (
                cityOptions.map((c, idx) => (
                  <button
                    key={`${c.cityRef}-${idx}`}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setCity(c.label);
                      setCityRef(c.cityRef);
                      setTouched((t) => ({ ...t, city: true }));

                      setNpPoint("");
                      setNpPointRef("");
                      setWhOptions([]);

                      setCityOpen(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 12px",
                      cursor: "pointer",
                      border: "none",
                      background: "transparent",
                      color: "inherit",
                    }}
                  >
                    {c.label}
                  </button>
                ))
              ) : (
                <div style={{ padding: "10px 12px", opacity: 0.7 }}>Нічого не знайдено</div>
              )}
            </div>
          )}

          {errors.city ? <div style={errorText}>{errors.city}</div> : null}
        </div>

        {/* NP point */}
        <div ref={npBoxRef} style={{ ...fieldWrap, position: "relative" }}>
          <input
            style={{ ...inputBase, border: getBorder(errors.np) }}
            placeholder={cityRef ? "Відділення / поштомат (почніть вводити)" : "Спочатку оберіть місто"}
            value={npPoint}
            disabled={!cityRef}
            onFocus={() => setNpOpen(true)}
            onChange={(e) => {
              setNpPoint(e.target.value);
              setNpOpen(true);
              setNpPointRef(""); // сброс выбранного ref пока печатает
            }}
            onBlur={() => setTouched((t) => ({ ...t, np: true }))}
          />

          {npOpen && cityRef && npPoint.trim().length >= 1 && (whLoading || whOptions.length >= 0) && (
            <div
              style={{
                position: "absolute",
                top: 52,
                left: 0,
                right: 0,
                border: "1px solid #444",
                borderRadius: 12,
                background: "#111",
                zIndex: 50,
                maxHeight: 320,
                overflowY: "auto",
                overflowX: "hidden",
              }}
            >
              {whLoading ? (
                <div style={{ padding: "10px 12px", opacity: 0.7 }}>Пошук…</div>
              ) : whOptions.length > 0 ? (
                whOptions.map((w, idx) => (
                  <button
                    key={`${w.ref}-${idx}`}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setNpPoint(w.label);
                      setNpPointRef(w.ref);
                      setTouched((t) => ({ ...t, np: true }));
                      setNpOpen(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 12px",
                      cursor: "pointer",
                      border: "none",
                      background: "transparent",
                      color: "inherit",
                    }}
                  >
                    {w.label}
                  </button>
                ))
              ) : (
                <div style={{ padding: "10px 12px", opacity: 0.7 }}>Нічого не знайдено</div>
              )}
            </div>
          )}

          {errors.np ? <div style={errorText}>{errors.np}</div> : null}
        </div>
      </div>

      {/* ===== Заказ */}
      <h3 style={{ marginTop: 22 }}>Ваше замовлення</h3>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.title} × {item.qty} — {item.price * item.qty} грн
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 12, fontWeight: 700 }}>Разом до сплати: {total} грн</div>

      <button
        type="button"
        disabled={payDisabled}
        style={{
          marginTop: 16,
          padding: "12px 14px",
          cursor: payDisabled ? "not-allowed" : "pointer",
          border: "1px solid #444",
          borderRadius: 10,
          background: "transparent",
          color: "inherit",
          opacity: payDisabled ? 0.5 : 1,
        }}
        onMouseDown={() => {
          // закрываем выпадайки, чтобы они не перекрывали клики
          setCityOpen(false);
          setNpOpen(false);
        }}
        onClick={handlePay}
      >
        Оплатити через LiqPay
      </button>

      {payDisabled ? (
        <p style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
          Заповніть коректно поля та оберіть доставку (місто + відділення/поштомат).
        </p>
      ) : null}

      {/* ===== Модалки */}
      <Modal
        open={tgModalOpen}
        title="Telegram / Viber"
        onClose={() => {
          // если закрыли — оставляем переключатель включенным, но требуем ник
          setTgModalOpen(false);
          setTouched((t) => ({ ...t, tg: true }));
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 13, opacity: 0.85 }}>
            Вкажіть ваш нікнейм у Telegram (або номер для Viber).
          </div>
          <input
            style={{ ...inputBase, border: getBorder(errors.tg) }}
            placeholder="@username"
            value={tgUsername}
            onChange={(e) => setTgUsername(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, tg: true }))}
          />
          {errors.tg ? <div style={errorText}>{errors.tg}</div> : null}

          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button
              type="button"
              onClick={() => {
                setTgModalOpen(false);
                setTouched((t) => ({ ...t, tg: true }));
              }}
              style={{
                border: "1px solid #444",
                background: "transparent",
                color: "inherit",
                borderRadius: 10,
                padding: "10px 12px",
                cursor: "pointer",
              }}
            >
              Зберегти
            </button>

            <button
              type="button"
              onClick={() => {
                // отмена = выключаем тумблер
                setContactInMessengers(false);
              }}
              style={{
                border: "1px solid #444",
                background: "transparent",
                color: "inherit",
                borderRadius: 10,
                padding: "10px 12px",
                cursor: "pointer",
                opacity: 0.85,
              }}
            >
              Не потрібно
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={receiverModalOpen}
        title="Отримувач — інша людина"
        onClose={() => {
          setReceiverModalOpen(false);
          setTouched((t) => ({ ...t, receiverFio: true, receiverPhone: true }));
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 13, opacity: 0.85 }}>
            Вкажіть ПІБ та телефон отримувача.
          </div>

          <div style={fieldWrap}>
            <input
              style={{ ...inputBase, border: getBorder(errors.receiverFio) }}
              placeholder="ПІБ отримувача"
              value={receiverFio}
              onChange={(e) => setReceiverFio(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, receiverFio: true }))}
            />
            {errors.receiverFio ? <div style={errorText}>{errors.receiverFio}</div> : null}
          </div>

          <div style={fieldWrap}>
            <input
              style={{ ...inputBase, border: getBorder(errors.receiverPhone) }}
              placeholder="+380XXXXXXXXX"
              value={receiverPhone}
              onChange={(e) => setReceiverPhone(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, receiverPhone: true }))}
              inputMode="tel"
            />
            {errors.receiverPhone ? <div style={errorText}>{errors.receiverPhone}</div> : null}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button
              type="button"
              onClick={() => {
                setReceiverModalOpen(false);
                setTouched((t) => ({ ...t, receiverFio: true, receiverPhone: true }));
              }}
              style={{
                border: "1px solid #444",
                background: "transparent",
                color: "inherit",
                borderRadius: 10,
                padding: "10px 12px",
                cursor: "pointer",
              }}
            >
              Зберегти
            </button>

            <button
              type="button"
              onClick={() => {
                // отмена = выключаем тумблер
                setOtherReceiver(false);
              }}
              style={{
                border: "1px solid #444",
                background: "transparent",
                color: "inherit",
                borderRadius: 10,
                padding: "10px 12px",
                cursor: "pointer",
                opacity: 0.85,
              }}
            >
              Не потрібно
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
