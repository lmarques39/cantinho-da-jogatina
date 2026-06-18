import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { getEasyPayCheckoutStatus } from '@/lib/easypay/client';
import { sendOrderConfirmation } from '@/lib/email';

/**
 * POST /api/webhooks/easypay
 *
 * Endpoint chamado pela EasyPay quando o estado de um pagamento muda.
 * Configura este URL no painel da EasyPay (Webhooks):
 *   https://o-teu-dominio.pt/api/webhooks/easypay
 *
 * Verificamos o estado diretamente na API da EasyPay em vez de confiar
 * apenas no payload do webhook — protege contra payloads falsificados.
 */
export async function POST(request: NextRequest) {
  let payload: { id?: string; checkout_id?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }

  const checkoutId = payload.checkout_id ?? payload.id;
  if (!checkoutId) {
    return NextResponse.json({ error: 'checkout_id em falta' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  try {
    const status = await getEasyPayCheckoutStatus(checkoutId);

    const paymentStatus = status?.payment?.status ?? status?.status;
    const isPaid = paymentStatus === 'success' || paymentStatus === 'paid';

    const { data: order } = await supabase
      .from('orders')
      .select('id, status, order_number, guest_email, guest_name, subtotal, shipping_cost, total')
      .eq('easypay_checkout_id', checkoutId)
      .single();

    if (!order) {
      console.warn(`Webhook EasyPay: encomenda não encontrada para checkout ${checkoutId}`);
      return NextResponse.json({ received: true });
    }

    if (isPaid && order.status === 'pending') {
      await supabase
        .from('orders')
        .update({
          status: 'paid',
          payment_status: 'paid',
          easypay_payment_method: status?.payment?.method,
        })
        .eq('id', order.id);

      // Reduz stock dos itens comprados
      await reduceStock(supabase, order.id);

      // Envia email de confirmação ao cliente
      const { data: items } = await supabase
        .from('order_items')
        .select('title_snapshot, quantity, price_snapshot')
        .eq('order_id', order.id);

      if (order.guest_email && items) {
        await sendOrderConfirmation({
          to: order.guest_email,
          customerName: order.guest_name ?? 'Cliente',
          orderNumber: order.order_number,
          items: items.map((i) => ({
            title: i.title_snapshot,
            quantity: i.quantity,
            price: Number(i.price_snapshot),
          })),
          subtotal: Number(order.subtotal),
          shippingCost: Number(order.shipping_cost),
          total: Number(order.total),
        });
      }
    } else if (!isPaid && paymentStatus === 'failed') {
      await supabase
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('id', order.id);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Erro ao processar webhook EasyPay:', err);
    return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 });
  }
}

async function reduceStock(
  supabase: ReturnType<typeof createServiceRoleClient>,
  orderId: string
) {
  const { data: items, error } = await supabase
    .from('order_items')
    .select('product_id, variation_id, quantity')
    .eq('order_id', orderId);

  if (error || !items) return;

  for (const item of items) {
    if (item.variation_id) {
      const { data: variation } = await supabase
        .from('product_variations')
        .select('stock_quantity')
        .eq('id', item.variation_id)
        .single();

      if (variation) {
        const newQty = Math.max(0, (variation.stock_quantity ?? 0) - item.quantity);
        await supabase
          .from('product_variations')
          .update({
            stock_quantity: newQty,
            stock_status: newQty <= 0 ? 'outofstock' : 'instock',
          })
          .eq('id', item.variation_id);
      }
    } else if (item.product_id) {
      const { data: product } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.product_id)
        .single();

      if (product) {
        const newQty = Math.max(0, (product.stock_quantity ?? 0) - item.quantity);
        await supabase
          .from('products')
          .update({
            stock_quantity: newQty,
            stock_status: newQty <= 0 ? 'outofstock' : 'instock',
          })
          .eq('id', item.product_id);
      }
    }
  }
}
