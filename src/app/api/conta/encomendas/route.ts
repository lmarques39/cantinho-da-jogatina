import { NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const service = createServiceRoleClient();
  const { data: orders, error } = await service
    .from('orders')
    .select(`
      id,
      order_number,
      status,
      payment_status,
      subtotal,
      shipping_cost,
      total,
      created_at,
      order_items ( title_snapshot, quantity, price_snapshot, line_total )
    `)
    .eq('guest_email', user.email)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao obter encomendas:', error.message);
    return NextResponse.json({ error: 'Não foi possível obter as encomendas.' }, { status: 500 });
  }

  return NextResponse.json({ orders: orders ?? [] });
}
