import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/login/actions'
import ShopSelector from './ShopSelector'

export default async function SelectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Récupère les boutiques disponibles
  const { data: shops } = await supabase
    .from('shops')
    .select('id, slug, name, shopify_domain')
    .order('name')

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Choisir une boutique</h1>
          <p className="text-gray-400 text-sm mt-1">{user.email}</p>
        </div>

        <ShopSelector shops={shops ?? []} />

        <form action={logout} className="mt-6 text-center">
          <button type="submit" className="text-gray-500 hover:text-gray-300 text-sm transition">
            Se déconnecter
          </button>
        </form>
      </div>
    </div>
  )
}
