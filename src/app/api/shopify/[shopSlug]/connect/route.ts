import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { validateShopifyToken } from '@/lib/shopify'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ shopSlug: string }> }
) {
  const { shopSlug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { domain, token } = await request.json() as { domain: string; token: string }
  if (!domain || !token) {
    return NextResponse.json({ error: 'domain et token requis' }, { status: 400 })
  }

  // Normaliser le domaine
  const cleanDomain = domain
    .replace(/https?:\/\//, '')
    .replace(/\/.*$/, '')
    .trim()
    .toLowerCase()

  // Valider le token Shopify
  const valid = await validateShopifyToken(cleanDomain, token)
  if (!valid) {
    return NextResponse.json({ error: 'Token Shopify invalide — vérifie le domaine et le token' }, { status: 400 })
  }

  const { data: shop } = await supabase
    .from('shops')
    .select('id')
    .eq('slug', shopSlug)
    .single()
  if (!shop) return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 })

  const admin = await createAdminClient()

  // Stocker le connecteur (base64 simple — pas de données ultra-sensibles)
  const creds = Buffer.from(JSON.stringify({ domain: cleanDomain, token })).toString('base64')
  const { error: connErr } = await admin.from('connectors').upsert({
    shop_id: shop.id,
    platform: 'shopify',
    creds,
    status: 'active',
    error_msg: null,
  }, { onConflict: 'shop_id,platform' })

  if (connErr) return NextResponse.json({ error: connErr.message }, { status: 500 })

  // Mettre à jour le domaine Shopify de la boutique
  await admin.from('shops').update({ shopify_domain: cleanDomain }).eq('id', shop.id)

  return NextResponse.json({ success: true })
}
