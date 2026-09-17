import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ shop: string }>
}

export default async function OverviewPage({ params }: Props) {
  const { shop: shopSlug } = await params
  const supabase = await createClient()

  const { data: shop } = await supabase
    .from('shops')
    .select('id, name')
    .eq('slug', shopSlug)
    .single()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{shop?.name ?? shopSlug}</h1>
        <p className="text-gray-400 text-sm mt-1">Vue d&apos;ensemble — P&L</p>
      </div>

      {/* Placeholder — sera rempli à Task 9 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {['Chiffre d\'affaires', 'Marge brute', 'Contribution', 'EBITDA'].map(label => (
          <div key={label} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <p className="text-gray-400 text-sm">{label}</p>
            <p className="text-2xl font-bold text-white mt-2">—</p>
            <p className="text-gray-600 text-xs mt-1">En attente de données</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-indigo-950 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <h3 className="text-white font-semibold mb-2">Connecte ta boutique Shopify</h3>
        <p className="text-gray-400 text-sm mb-4">
          Va dans Sources pour connecter Shopify et commencer à voir tes données.
        </p>
        <a
          href={`/dashboard/${shopSlug}/sources`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition"
        >
          Configurer les sources
        </a>
      </div>
    </div>
  )
}
