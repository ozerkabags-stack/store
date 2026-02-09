export default function ContactsPage() {
  return (
    <main style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      <h1>Контакти</h1>

      <p>Інтернет-магазин <strong>OZERKA BAGS</strong></p>

      <ul>
        <li><strong>Місто:</strong> Дніпро</li>
        <li><strong>Адреса:</strong> вул. Старокозацька, 82</li>
        <li><strong>Доставка:</strong> Нова Пошта</li>
        <li><strong>Оплата:</strong> LiqPay (картка / Apple Pay)</li>
      </ul>

      <h3 style={{ marginTop: "30px" }}>Звʼязок з нами</h3>

      <p>Email: <a href="mailto:ozerkabags@gmail.com">ozerkabags@gmail.com</a></p>
      <p>Телефон: <a href="tel:+380987379559">+38 (098) 737 95 59</a></p>

      <h3 style={{ marginTop: "30px" }}>Інформація про власника</h3>

      <p>
        Фізична особа — підприємець (ФОП)<br />
        Україна, м. Дніпро
      </p>
    </main>
  );
}
