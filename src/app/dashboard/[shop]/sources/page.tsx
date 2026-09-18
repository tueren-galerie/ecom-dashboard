import { createClient } from '@/lib/supabase/server'
import ShopifyConnect from './ShopifyConnect'

interface Props {
  params: Promise<{ shop: string }>
}

export default async function SourcesPage({ params }: Props) {
  const { shop: shopSlug } = await params
  const supabase = await createClient()

  const { data: shop } = await supabase
    .from('shops')
    .select('id, name, shopify_domain')
    .eq('slug', shopSlug)
    .single()

  const { data: connector } = shop
    ? await supabase
        .from('connectors')
        .select('status, last_sync, error_msg')
        .eq('shop_id', shop.id)
        .eq('platform', 'shopify')
        .single()
    : { data: null }

  const connectorWithDomain = connector
    ? { ...connector, shopify_domain: shop?.shopify_domain ?? null }
    : null

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Sources de données</h1>
        <p className="text-gray-400 text-sm mt-1">Connecte tes plateformes pour alimenter le P&amp;L</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
        {/* Shopify */}
        <ShopifyConnect
          shopSlug={shopSlug}
          connector={connectorWithDomain}
        />

        {/* Triple Whale — Task 8 */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 opacity-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Triple Whale</h3>
              <p className="text-gray-500 text-xs">Attribution · ROAS réel</p>
            </div>
            <span className="ml-auto text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded">Bientôt</span>
          </div>
          <p className="text-gray-600 text-sm">Connexion Triple Whale disponible dans la prochaine mise à jour.</p>
        </div>

        {/* Meta Ads — Task 8 */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 opacity-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Meta Ads</h3>
              <p className="text-gray-500 text-xs">Dépenses pub · Insights</p>
            </div>
            <span className="ml-auto text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded">Bientôt</span>
          </div>
          <p className="text-gray-600 text-sm">Connexion Meta Ads disponible dans la prochaine mise à jour.</p>
        </div>

        {/* Google Ads — Task 8 */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 opacity-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Google Ads</h3>
              <p className="text-gray-500 text-xs">Dépenses pub · Search</p>
            </div>
            <span className="ml-auto text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded">Bientôt</span>
          </div>
          <p className="text-gray-600 text-sm">Connexion Google Ads disponible dans la prochaine mise à jour.</p>
        </div>
      </div>
    </div>
  )
}
