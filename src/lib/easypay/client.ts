/**
 * Integração com a API da EasyPay (gateway de pagamentos português).
 * Documentação: https://docs.easypay.pt
 *
 * Usa o fluxo "Checkout": criamos uma sessão no servidor (este ficheiro),
 * devolvemos o "manifesto" ao browser, e o SDK de checkout da EasyPay
 * trata da UI de pagamento (cartão, Multibanco, MB WAY).
 *
 * Variáveis de ambiente necessárias (ver .env.example):
 *   EASYPAY_ACCOUNT_ID, EASYPAY_API_KEY, EASYPAY_ENV ('test' | 'prod')
 */

const EASYPAY_BASE_URL =
  process.env.EASYPAY_ENV === 'prod'
    ? 'https://api.prod.easypay.pt/2.0'
    : 'https://api.test.easypay.pt/2.0';

function getHeaders() {
  const accountId = process.env.EASYPAY_ACCOUNT_ID;
  const apiKey = process.env.EASYPAY_API_KEY;

  if (!accountId || !apiKey) {
    throw new Error(
      'EASYPAY_ACCOUNT_ID e EASYPAY_API_KEY têm de estar definidos em .env.local. ' +
        'Consulta o teu painel EasyPay ou contacta correio@easypay.pt para obter credenciais.'
    );
  }

  return {
    AccountId: accountId,
    ApiKey: apiKey,
    'Content-Type': 'application/json',
  };
}

export interface EasyPayOrderItem {
  description: string;
  quantity: number;
  key: string;
  value: number; // preço unitário em euros
}

export interface CreateCheckoutParams {
  orderKey: string; // referência interna da encomenda (ex: order_number)
  totalValue: number;
  items: EasyPayOrderItem[];
  customerEmail?: string;
  customerName?: string;
  descriptive?: string; // texto que aparece no extrato bancário do cliente
}

export interface EasyPayCheckoutManifest {
  id: string;
  session: string;
  config: unknown;
}

/**
 * Cria uma sessão de checkout na EasyPay. O resultado ("manifesto") deve
 * ser devolvido ao browser para o SDK de checkout (easypayCheckout.startCheckout)
 * o usar e mostrar a UI de pagamento.
 */
export async function createEasyPayCheckout(
  params: CreateCheckoutParams
): Promise<EasyPayCheckoutManifest> {
  const response = await fetch(`${EASYPAY_BASE_URL}/checkout`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      type: ['single'],
      payment: {
        methods: ['cc', 'mb', 'mbw'], // Cartão, Multibanco, MB WAY
        type: 'sale',
        currency: 'EUR',
        capture: {
          descriptive: params.descriptive ?? 'Cantinho da Jogatina',
        },
      },
      order: {
        key: params.orderKey,
        value: params.totalValue,
        items: params.items,
      },
      customer:
        params.customerEmail || params.customerName
          ? {
              email: params.customerEmail,
              name: params.customerName,
            }
          : undefined,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erro ao criar checkout EasyPay (${response.status}): ${text}`);
  }

  return response.json();
}

/**
 * Consulta o estado atual de uma sessão de checkout. Útil para confirmar
 * o pagamento no servidor depois do redirecionamento/callback, em vez de
 * confiar apenas no evento onSuccess do lado do cliente.
 */
export async function getEasyPayCheckoutStatus(checkoutId: string) {
  const response = await fetch(`${EASYPAY_BASE_URL}/checkout/${checkoutId}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erro ao consultar checkout EasyPay (${response.status}): ${text}`);
  }

  return response.json();
}
