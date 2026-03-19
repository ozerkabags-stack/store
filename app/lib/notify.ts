import nodemailer from "nodemailer";

type OrderData = {
  orderId: string;
  createdAt: string;
  customer: {
    fio: string;
    phone: string;
    email?: string;
    contactInMessengers?: boolean;
    tgUsername?: string;
    otherReceiver?: boolean;
    receiver?: { fio: string; phone: string } | null;
  };
  delivery: {
    cityLabel: string;
    pointLabel: string;
  };
  items: Array<{ title: string; qty: number; price: number }>;
  total: number;
};

function buildOrderHtml(order: OrderData): string {
  const itemsHtml = order.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:6px 12px;border-bottom:1px solid #eee">${i.title}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center">${i.qty}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right">${(i.price * i.qty).toLocaleString("uk-UA")} грн</td>
        </tr>`
    )
    .join("");

  const receiver = order.customer.otherReceiver && order.customer.receiver
    ? `<b>Отримувач:</b> ${order.customer.receiver.fio}, ${order.customer.receiver.phone}<br>`
    : "";

  const tg = order.customer.contactInMessengers && order.customer.tgUsername
    ? `<b>Telegram:</b> @${order.customer.tgUsername.replace(/^@/, "")}<br>`
    : "";

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#1a1a1a;border-bottom:3px solid #3ecf5a;padding-bottom:8px">
        Нове замовлення ${order.orderId}
      </h2>
      <p style="color:#666;font-size:13px">${new Date(order.createdAt).toLocaleString("uk-UA")}</p>

      <h3 style="color:#1a1a1a">Покупець</h3>
      <p style="line-height:1.8">
        <b>ПІБ:</b> ${order.customer.fio}<br>
        <b>Телефон:</b> ${order.customer.phone}<br>
        ${order.customer.email ? `<b>Email:</b> ${order.customer.email}<br>` : ""}
        ${tg}
        ${receiver}
      </p>

      <h3 style="color:#1a1a1a">Доставка (Нова Пошта)</h3>
      <p style="line-height:1.8">
        <b>Місто:</b> ${order.delivery.cityLabel}<br>
        <b>Відділення:</b> ${order.delivery.pointLabel}
      </p>

      <h3 style="color:#1a1a1a">Товари</h3>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#f5f5f5">
            <th style="padding:8px 12px;text-align:left">Товар</th>
            <th style="padding:8px 12px;text-align:center">Кількість</th>
            <th style="padding:8px 12px;text-align:right">Сума</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:10px 12px;font-weight:bold">Разом</td>
            <td style="padding:10px 12px;font-weight:bold;text-align:right;color:#3ecf5a">
              ${order.total.toLocaleString("uk-UA")} грн
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
}

function buildOrderText(order: OrderData): string {
  const items = order.items
    .map((i) => `• ${i.title} ×${i.qty} = ${i.price * i.qty} грн`)
    .join("\n");

  const receiver = order.customer.otherReceiver && order.customer.receiver
    ? `\nОтримувач: ${order.customer.receiver.fio}, ${order.customer.receiver.phone}`
    : "";

  const tg = order.customer.contactInMessengers && order.customer.tgUsername
    ? `\nTelegram: @${order.customer.tgUsername.replace(/^@/, "")}`
    : "";

  return `
🛍 НОВЕ ЗАМОВЛЕННЯ ${order.orderId}
📅 ${new Date(order.createdAt).toLocaleString("uk-UA")}

👤 ПОКУПЕЦЬ
ПІБ: ${order.customer.fio}
Телефон: ${order.customer.phone}${order.customer.email ? `\nEmail: ${order.customer.email}` : ""}${tg}${receiver}

🚚 ДОСТАВКА (Нова Пошта)
Місто: ${order.delivery.cityLabel}
Відділення: ${order.delivery.pointLabel}

📦 ТОВАРИ
${items}

💰 РАЗОМ: ${order.total} грн
`.trim();
}

export async function sendEmailToOwner(order: OrderData): Promise<void> {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const to = process.env.EMAIL_OWNER ?? user;

  if (!user || !pass || !to) {
    console.warn("[notify] EMAIL_USER / EMAIL_PASS / EMAIL_OWNER not set — skipping email");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"OZERRA BAGS" <${user}>`,
    to,
    subject: `Нове замовлення ${order.orderId} — ${order.total} грн`,
    html: buildOrderHtml(order),
    text: buildOrderText(order),
  });
}

export async function sendEmailToCustomer(order: OrderData): Promise<void> {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const customerEmail = order.customer.email?.trim();

  if (!user || !pass || !customerEmail) return;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const itemsHtml = order.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:6px 12px;border-bottom:1px solid #eee">${i.title}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center">${i.qty}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right">${(i.price * i.qty).toLocaleString("uk-UA")} грн</td>
        </tr>`
    )
    .join("");

  await transporter.sendMail({
    from: `"OZERRA BAGS" <${user}>`,
    to: customerEmail,
    subject: `Ваше замовлення ${order.orderId} прийнято — OZERRA BAGS`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#1a1a1a;border-bottom:3px solid #3ecf5a;padding-bottom:8px">
          Дякуємо за замовлення, ${order.customer.fio}!
        </h2>
        <p>Ваше замовлення <b>${order.orderId}</b> успішно прийнято.</p>
        <p>Ми зв'яжемося з вами найближчим часом для підтвердження.</p>

        <h3>Ваше замовлення</h3>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="background:#f5f5f5">
              <th style="padding:8px 12px;text-align:left">Товар</th>
              <th style="padding:8px 12px;text-align:center">Кількість</th>
              <th style="padding:8px 12px;text-align:right">Сума</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:10px 12px;font-weight:bold">Разом</td>
              <td style="padding:10px 12px;font-weight:bold;text-align:right;color:#3ecf5a">
                ${order.total.toLocaleString("uk-UA")} грн
              </td>
            </tr>
          </tfoot>
        </table>

        <h3>Доставка</h3>
        <p>${order.delivery.cityLabel}, ${order.delivery.pointLabel}</p>

        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="color:#666;font-size:12px">
          OZERRA BAGS | ozerkabags@gmail.com | +380 XX XXX XX XX
        </p>
      </div>
    `,
  });
}

export async function sendTelegramNotification(order: OrderData): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("[notify] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set — skipping Telegram");
    return;
  }

  const tg = order.customer.contactInMessengers && order.customer.tgUsername
    ? `\n📱 Telegram клієнта: @${order.customer.tgUsername.replace(/^@/, "")}`
    : "";

  const receiver = order.customer.otherReceiver && order.customer.receiver
    ? `\n👥 Отримувач: ${order.customer.receiver.fio}, ${order.customer.receiver.phone}`
    : "";

  const items = order.items
    .map((i) => `  • ${i.title} ×${i.qty} = ${i.price * i.qty} грн`)
    .join("\n");

  const text = `
🛍 <b>НОВЕ ЗАМОВЛЕННЯ</b> <code>${order.orderId}</code>
📅 ${new Date(order.createdAt).toLocaleString("uk-UA")}

👤 <b>Покупець</b>
ПІБ: ${order.customer.fio}
📞 ${order.customer.phone}${order.customer.email ? `\n✉️ ${order.customer.email}` : ""}${tg}${receiver}

🚚 <b>Доставка (Нова Пошта)</b>
${order.delivery.cityLabel}, ${order.delivery.pointLabel}

📦 <b>Товари</b>
${items}

💰 <b>Разом: ${order.total} грн</b>
  `.trim();

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[notify] Telegram error:", err);
  }
}

export async function sendCustomerTelegramLink(order: OrderData): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return;
  if (!order.customer.contactInMessengers || !order.customer.tgUsername) return;

  const username = order.customer.tgUsername.replace(/^@/, "");

  const text = `
💬 Клієнт <b>${order.customer.fio}</b> просить зв'язатися через Telegram
Замовлення: <code>${order.orderId}</code>
Telegram: <a href="https://t.me/${username}">@${username}</a>
  `.trim();

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  });
}

export async function notifyNewOrder(order: OrderData): Promise<void> {
  await Promise.allSettled([
    sendEmailToOwner(order),
    sendEmailToCustomer(order),
    sendTelegramNotification(order),
    sendCustomerTelegramLink(order),
  ]);
}

