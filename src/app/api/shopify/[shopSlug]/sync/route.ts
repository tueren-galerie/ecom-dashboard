import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { fetchShopifyOrders, fetchShopifyPayouts, mapOrderToRow } from '@/lib/shopify'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ shopSlug: string }> }
) {
  const { shopSlug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data: shop } = await supabase
    .from('shops')
    .select('id')
    .eq('slug', shopSlug)
    .single()
  if (!shop) return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })

  const admin = await createAdminClient()

  const { data: connector } = await admin
    .from('connectors')
    .select('creds, sync_cursor')
    .eq('shop_id', shop.id)
    .eq('platform', 'shopify')
    .single()

  if (!connector?.creds) {
    return NextResponse.json({ error: 'Shopify non connecté' }, { status: 404 })
  }

  const { domain, token } = JSON.parse(Buffer.from(connector.creds, 'base64').toString()) as { domain: string; token: string }

  // Depuis 90 jours si pas de cursor
  const since = connector.sync_cursor
    ?? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

  try {
    // ── Commandes ──────────────────────────────────────────────
    const orders = await fetchShopifyOrders(domain, token, since)
    let ordersUpserted = 0

    if (orders.length > 0) {
      const rows = orders.map(o => mapOrderToRow(o, shop.id))
      const { error } = await admin
        .from('orders')
        .upsert(rows, { onConflict: 'shop_id,external_id' })
      if (error) throw new Error(`orders upsert: ${error.message}`)
      ordersUpserted = rows.length
    }

    // ── Payouts ────────────────────────────────────────────────
    const payouts = await fetchShopifyPayouts(domain, token)
    let payoutsUpserted = 0

    if (payouts.length > 0) {
      const rows = payouts.map(p => ({
        shop_id: shop.id,
        payout_id: String(p.id),
        payout_date: p.date,
        amount: parseFloat(p.amount),
        currency: p.currency,
        status: p.status,
      }))
      const { error } = await admin
        .from('shop_payouts')
        .upsert(rows, { onConflict: 'shop_id,payout_id' })
      if (error) throw new Error(`payouts upsert: ${error.message}`)
      payoutsUpserted = rows.length
    }

    // ── Refresh daily_facts ────────────────────────────────────
    const fromDate = since.split('T')[0]
    const toDate = new Date().toISOString().split('T')[0]
    await admin.rpc('refresh_daily_facts', {
      p_shop_id: shop.id,
      p_from: fromDate,
      p_to: toDate,
    })

    // ── Mise à jour cursor ─────────────────────────────────────
    await admin.from('connectors').update({
      sync_cursor: new Date().toISOString(),
      last_sync: new Date().toISOString(),
      status: 'active',
      error_msg: null,
    }).eq('shop_id', shop.id).eq('platform', 'shopify')

    return NextResponse.json({
      success: true,
      orders: ordersUpserted,
      payouts: payoutsUpserted,
      period: `${fromDate} → ${toDate}`,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue'
    await admin.from('connectors').update({
      status: 'error',
      error_msg: msg,
    }).eq('shop_id', shop.id).eq('platform', 'shopify')
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
