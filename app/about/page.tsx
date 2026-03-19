import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Про нас — OZERRA BAGS",
};

export default function AboutPage() {
  return (
    <main className="container">
      <h1 style={{ margin: 0 }}>Про нас</h1>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="cardText">
          <strong>OZERRA BAGS</strong> — інтернет-магазин сумок та аксесуарів,
          натхненний атмосферою легендарного ринку Озерка у Дніпрі.
        </div>
        <div className="cardText" style={{ marginTop: 10 }}>
          Ми підбираємо актуальні моделі для щоденного використання, роботи та подорожей.
          Наша мета — зробити покупку простою та прозорою: чесні ціни, зрозумілі умови
          доставки й оплати, швидка підтримка.
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Чому обирають нас</div>
        <ul style={{ paddingLeft: 18 }}>
          <li className="cardText">Фіксована ціна — без прихованих доплат</li>
          <li className="cardText" style={{ marginTop: 6 }}>
            Детальний опис кожного товару
          </li>
          <li className="cardText" style={{ marginTop: 6 }}>
            Оплата онлайн через LiqPay — безпечно та зручно
          </li>
          <li className="cardText" style={{ marginTop: 6 }}>
            Доставка Новою Поштою по всій Україні
          </li>
          <li className="cardText" style={{ marginTop: 6 }}>
            Повернення товару протягом 14 днів
          </li>
        </ul>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Реквізити</div>
        <div className="cardText">
          <strong>ФОП</strong> Слуцьковський Данііл Андрійович
        </div>
        <div className="cardText" style={{ marginTop: 8 }}>
          м. Дніпро, вул. Старокозацька, 82
        </div>
        <div className="cardText" style={{ marginTop: 8 }}>
          Email: <a href="mailto:ozerkabags@gmail.com">ozerkabags@gmail.com</a>
        </div>
        <div className="cardText" style={{ marginTop: 8 }}>
          Телефон: <a href="tel:+380987379559">+38 (098) 737-95-59</a>
        </div>
      </div>
    </main>
  );
}

