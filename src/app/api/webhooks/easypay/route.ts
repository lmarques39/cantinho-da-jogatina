import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { getEasyPayCheckoutStatus } from '@/lib/easypay/client';

/**
 * POST /api/webhooks/easypay
 *
 * Endpoint chamado pela EasyPay quando o estado de um pagamento muda.
 * Configura este URL no painel da EasyPay (Webhooks) depois de teres conta:
 *   https://o-teu-dominio.pt/api/webhooks/easypay
 *
 * Por segurança, voltamos a consultar a API da EasyPay para confirmar o
 * estado em vez de confiar apenas no conteúdo do webhook recebido —
 * assim evitamos marcar uma encomenda como paga com um payload falsificado.
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

    // A estrutura exata do payload de status depende da versão da API EasyPay —
    // confirma os nomes de campo na documentação (docs.easypay.pt) e ajusta aqui.
    const paymentStatus = status?.payment?.status ?? status?.status;
    const isPaid = paymentStatus === 'success' || paymentStatus === 'paid';

    const { data: order } = await supabase
      .from('orders')
      .select('id, status')
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

      // Aqui é o sítio certo para: reduzir stock dos produtos comprados,
      // enviar email de confirmação ao cliente, etc.
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
