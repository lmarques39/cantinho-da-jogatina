import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { createEasyPayCheckout } from '@/lib/easypay/client';
import { generateOrderNumber } from '@/lib/utils';

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      variationId: z.string().nullable(),
      title: z.string(),
      price: z.number().positive(),
      quantity: z.number().int().positive(),
    })
  ).min(1),
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  shippingAddress: z.object({
    street: z.string().min(1),
    postalCode: z.string().min(1),
    city: z.string().min(1),
    country: z.string().default('Portugal'),
  }),
});

/**
 * POST /api/checkout
 *
 * 1. Valida o corpo do pedido
 * 2. Cria a encomenda na base de dados (status 'pending')
 * 3. Cria a sessão de checkout na EasyPay
 * 4. Devolve o manifesto da EasyPay ao browser, que o usa para mostrar a UI
 *    de pagamento via easypayCheckout.startCheckout(manifest, ...)
 *
 * O estado da encomenda só passa a 'paid' quando o webhook /api/webhooks/easypay
 * confirmar o pagamento no servidor — nunca confiar apenas no callback do
 * lado do cliente para lógica crítica (ex: reduzir stock, enviar confirmação).
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corpo do pedido inválido (JSON malformado).' }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos.', details: parsed.error.flatten() }, { status: 400 });
  }

  const { items, customer, shippingAddress } = parsed.data;
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingCost = subtotal >= 50 ? 0 : 4.99; // exemplo de regra de portes — ajustar como necessário
  const total = subtotal + shippingCost;
  const orderNumber = generateOrderNumber();

  const supabase = createServiceRoleClient();

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      guest_email: customer.email,
      guest_name: customer.name,
      status: 'pending',
      subtotal,
      shipping_cost: shippingCost,
      total,
      shipping_address: shippingAddress,
      billing_address: shippingAddress,
      payment_status: 'unpaid',
    })
    .select('id')
    .single();

  if (orderError || !order) {
    console.error('Erro ao criar encomenda:', orderError?.message);
    return NextResponse.json({ error: 'Não foi possível criar a encomenda.' }, { status: 500 });
  }

  const orderItemRows = items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    variation_id: item.variationId,
    title_snapshot: item.title,
    price_snapshot: item.price,
    quantity: item.quantity,
    line_total: item.price * item.quantity,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItemRows);
  if (itemsError) {
    console.error('Erro ao guardar itens da encomenda:', itemsError.message);
    return NextResponse.json({ error: 'Não foi possível guardar os itens da encomenda.' }, { status: 500 });
  }

  try {
    const manifest = await createEasyPayCheckout({
      orderKey: orderNumber,
      totalValue: total,
      items: items.map((item) => ({
        description: item.title,
        quantity: item.quantity,
        key: item.productId,
        value: item.price,
      })),
      customerEmail: customer.email,
      customerName: customer.name,
      descriptive: `Cantinho da Jogatina - ${orderNumber}`,
    });

    await supabase
      .from('orders')
      .update({ easypay_checkout_id: manifest.id })
      .eq('id', order.id);

    return NextResponse.json({ orderId: order.id, orderNumber, manifest });
  } catch (err) {
    console.error('Erro ao criar checkout EasyPay:', err);
    await supabase.from('orders').delete().eq('id', order.id);
    return NextResponse.json(
      { error: 'Não foi possível iniciar o pagamento. Tenta novamente em breve.' },
      { status: 502 }
    );
  }
}
