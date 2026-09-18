// Client Shopify Admin REST API 2024-01

export interface ShopifyOrder {
  id: number
  name: string
  created_at: string
  total_price: string
  currency: string
  financial_status: string
  fulfillment_status: string | null
  shipping_address?: { country_code: string }
  line_items: Array<{
    sku: string | null
    quantity: number
    price: string
    title: string
  }>
  refunds: Array<{
    transactions: Array<{
      amount: string
      kind: string
      status: string
    }>
  }>
}

export interface ShopifyPayout {
  id: number
  date: string
  amount: string
  currency: string
  status: string
}

const API_VERSION = '2024-01'

async function shopifyFetch(domain: string, token: string, path: string) {
  const url = `https://${domain}/admin/api/${API_VERSION}/${path}`
  return fetch(url, {
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json',
    },
    next: { revalidate: 0 },
  })
}

export async function validateShopifyToken(domain: string, token: string): Promise<boolean> {
  try {
    const res = await shopifyFetch(domain, token, 'shop.json')
    return res.ok
  } catch {
    return false
  }
}

export async function fetchShopifyOrders(
  domain: string,
  token: string,
  since?: string
): Promise<ShopifyOrder[]> {
  const allOrders: ShopifyOrder[] = []
  const params = new URLSearchParams({
    status: 'any',
    limit: '250',
    fields: [
      'id', 'name', 'created_at', 'total_price', 'currency',
      'financial_status', 'fulfillment_status', 'shipping_address',
      'line_items', 'refunds',
    ].join(','),
  })
  if (since) params.set('created_at_min', since)

  let url = `orders.json?${params}`

  for (let page = 0; page < 20 && url; page++) {
    const res = await shopifyFetch(domain, token, url)
    if (!res.ok) throw new Error(`Shopify orders error: ${res.status}`)

    const data = await res.json() as { orders: ShopifyOrder[] }
    allOrders.push(...(data.orders || []))

    // Pagination via Link header (cursor-based)
    const link = res.headers.get('Link') ?? ''
    const nextMatch = link.match(/<[^>]+?page_info=([^>&"]+)[^>]*>;\s*rel="next"/)
    url = nextMatch ? `orders.json?limit=250&page_info=${nextMatch[1]}` : ''
  }

  return allOrders
}

export async function fetchShopifyPayouts(
  domain: string,
  token: string
): Promise<ShopifyPayout[]> {
  try {
    const res = await shopifyFetch(domain, token, 'shopify_payments/payouts.json?limit=250')
    if (!res.ok) return []
    const data = await res.json() as { payouts: ShopifyPayout[] }
    return data.payouts || []
  } catch {
    return []
  }
}

export function mapOrderToRow(order: ShopifyOrder, shopId: string) {
  const revenue = parseFloat(order.total_price) || 0
  const refunded = order.refunds.reduce((sum, r) =>
    sum + r.transactions
      .filter(t => t.kind === 'refund' && t.status === 'success')
      .reduce((s, t) => s + parseFloat(t.amount), 0), 0)

  const units = order.line_items.reduce((s, li) => s + li.quantity, 0)
  const items: Record<string, number> = {}
  order.line_items.forEach(li => {
    const key = li.sku || li.title || 'unknown'
    items[key] = (items[key] || 0) + li.quantity
  })

  return {
    shop_id: shopId,
    external_id: String(order.id),
    order_date: order.created_at.split('T')[0],
    country: order.shipping_address?.country_code || 'FR',
    revenue,
    refunded,
    units,
    items,
    currency: order.currency,
    is_estimated: true,
  }
}
