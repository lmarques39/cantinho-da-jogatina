import { formatPrice } from '@/lib/utils';

interface OrderConfirmationParams {
  to: string;
  customerName: string;
  orderNumber: string;
  items: Array<{ title: string; quantity: number; price: number }>;
  subtotal: number;
  shippingCost: number;
  total: number;
}

export async function sendOrderConfirmation(params: OrderConfirmationParams) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY não configurada — email de confirmação ignorado.');
    return;
  }

  const itemsHtml = params.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #1e373a;color:#d5e2e3;font-size:14px;">${item.title}</td>
        <td style="padding:10px 0;border-bottom:1px solid #1e373a;color:#d5e2e3;font-size:14px;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #1e373a;color:#d5e2e3;font-size:14px;text-align:right;">${formatPrice(item.price * item.quantity)}</td>
      </tr>`
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a1d1f;font-family:'Inter',ui-sans-serif,system-ui;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1d1f;padding:32px 16px;">
    <tr><td>
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#0f282b;border-radius:6px;border:1px solid #163a3a;overflow:hidden;">

        <!-- Cabeçalho -->
        <tr>
          <td style="background:#0a1d1f;padding:24px 32px;border-bottom:1px solid #163a3a;">
            <p style="margin:0;font-size:20px;font-weight:700;color:#c88a19;letter-spacing:-0.5px;">
              Cantinho da Jogatina
            </p>
          </td>
        </tr>

        <!-- Corpo -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#eef3f3;">
              Encomenda confirmada!
            </p>
            <p style="margin:0 0 24px;font-size:14px;color:#80a4a7;">
              Olá ${params.customerName}, a tua encomenda <strong style="color:#c88a19;">${params.orderNumber}</strong> foi recebida com sucesso.
            </p>

            <!-- Tabela de itens -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <thead>
                <tr>
                  <th style="padding:0 0 8px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#4f7b7f;">Produto</th>
                  <th style="padding:0 0 8px;text-align:center;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#4f7b7f;">Qtd</th>
                  <th style="padding:0 0 8px;text-align:right;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#4f7b7f;">Total</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>

            <!-- Resumo de valores -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0;font-size:13px;color:#80a4a7;">Subtotal</td>
                <td style="padding:6px 0;font-size:13px;color:#80a4a7;text-align:right;">${formatPrice(params.subtotal)}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;font-size:13px;color:#80a4a7;">Portes</td>
                <td style="padding:6px 0;font-size:13px;color:#80a4a7;text-align:right;">${params.shippingCost === 0 ? 'Grátis' : formatPrice(params.shippingCost)}</td>
              </tr>
              <tr>
                <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:#eef3f3;border-top:1px solid #163a3a;">Total</td>
                <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:#c88a19;text-align:right;border-top:1px solid #163a3a;">${formatPrice(params.total)}</td>
              </tr>
            </table>

            <p style="margin:28px 0 0;font-size:13px;color:#80a4a7;line-height:1.6;">
              Entraremos em contacto assim que a encomenda for expedida. Se tiveres alguma questão responde a este email.
            </p>
          </td>
        </tr>

        <!-- Rodapé -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #163a3a;background:#0a1d1f;">
            <p style="margin:0;font-size:12px;color:#2e5a5e;">© Cantinho da Jogatina</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Cantinho da Jogatina <encomendas@cantinhodajogatina.shop>',
      to: [params.to],
      subject: `Encomenda ${params.orderNumber} confirmada — Cantinho da Jogatina`,
      html,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`[email] Erro ao enviar confirmação (${response.status}): ${text}`);
  }
}
