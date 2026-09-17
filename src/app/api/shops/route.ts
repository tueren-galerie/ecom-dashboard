import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { name, slug } = await req.json()

  if (!name || !slug) {
    return NextResponse.json({ error: 'name et slug requis' }, { status: 400 })
  }

  const { data: shop, error } = await supabase
    .from('shops')
    .insert({ name, slug, currency: 'EUR', timezone: 'Europe/Paris' })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(shop)
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { data: shops, error } = await supabase
    .from('shops')
    .select('id, slug, name, shopify_domain')
    .order('name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(shops)
}
