import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/Sidebar'

interface Props {
  children: React.ReactNode
  params: Promise<{ shop: string }>
}

export default async function DashboardLayout({ children, params }: Props) {
  const { shop: shopSlug } = await params
  const supabase = await createClient()

  // Vérification auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Vérification boutique
  const { data: shop } = await supabase
    .from('shops')
    .select('id, slug, name, shopify_domain')
    .eq('slug', shopSlug)
    .single()

  if (!shop) redirect('/select')

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <Sidebar shop={shop} userEmail={user.email ?? ''} />
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}
