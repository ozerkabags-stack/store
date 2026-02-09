export default function DeliveryPage() {
  return (
    <main style={{ padding: "40px" }}>
      <h1>Доставка та оплата</h1>

      <h3 style={{ marginTop: "24px" }}>Доставка</h3>
      <p>
        Доставка замовлень здійснюється по всій території України службою{" "}
        <strong>Нова Пошта</strong>.
      </p>
      <ul>
        <li>Відправлення: протягом 1–3 робочих днів після підтвердження замовлення</li>
        <li>Вартість доставки: згідно з тарифами Нової Пошти</li>
        <li>Отримання: у відділенні або поштоматі Нової Пошти</li>
      </ul>

      <h3 style={{ marginTop: "24px" }}>Оплата</h3>
      <p>
        Оплата здійснюється онлайн через <strong>LiqPay</strong>:
      </p>
      <ul>
        <li>банківська картка</li>
        <li>Apple Pay</li>
      </ul>

      <p style={{ marginTop: "16px" }}>
        Усі ціни на сайті вказані в <strong>гривнях (UAH)</strong>.
      </p>
    </main>
  );
}
