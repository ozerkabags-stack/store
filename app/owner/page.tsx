export default function OwnerPage() {
  return (
    <main style={{ padding: "40px" }}>
      <h1>Інформація про власника</h1>

      <p>
        Інтернет-магазин <strong>OZERKA BAGS</strong> належить та
        обслуговується фізичною особою — підприємцем (ФОП).
      </p>

      <h3 style={{ marginTop: "24px" }}>Реквізити</h3>
      <ul>
        <li><strong>Форма власності:</strong> ФОП</li>
        <li><strong>ПІБ:</strong> Слуцьковський Данііл Андрійович</li>
        <li><strong>Адреса:</strong> Україна, м. Дніпро, вул. Старокозацька, 82</li>
      </ul>

      <h3 style={{ marginTop: "24px" }}>Контакти</h3>
      <ul>
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:ozerkabags@gmail.com">ozerkabags@gmail.com</a>
        </li>
        <li>
          <strong>Телефон:</strong>{" "}
          <a href="tel:+380987379559">+38 098 737 95 59</a>
        </li>
      </ul>

      <p style={{ marginTop: "16px" }}>
        Отримувач платежів — ФОП Слуцьковський Данііл Андрійович
        (згідно з чинним законодавством України).
      </p>
    </main>
  );
}
