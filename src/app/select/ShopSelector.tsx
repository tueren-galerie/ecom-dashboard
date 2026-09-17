'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Shop {
  id: string
  slug: string
  name: string | null
  shopify_domain: string | null
}

export default function ShopSelector({ shops }: { shops: Shop[] }) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(false)

  async function createShop() {
    if (!newName.trim()) return
    setLoading(true)
    const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const res = await fetch('/api/shops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, slug }),
    })
    if (res.ok) {
      const shop = await res.json()
      router.push(`/dashboard/${shop.slug}`)
    } else {
      setLoading(false)
      alert('Erreur lors de la création')
    }
  }

  if (shops.length === 0 && !creating) {
    return (
      <div className="text-center">
        <p className="text-gray-400 mb-6">Aucune boutique configurée.</p>
        <button
          onClick={() => setCreating(true)}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition"
        >
          + Créer ma première boutique
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {shops.map(shop => (
        <button
          key={shop.id}
          onClick={() => router.push(`/dashboard/${shop.slug}`)}
          className="w-full flex items-center gap-4 p-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 rounded-xl transition text-left group"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-900 flex items-center justify-center">
            <span className="text-indigo-300 font-bold text-lg">
              {(shop.name ?? shop.slug)[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium">{shop.name ?? shop.slug}</p>
            {shop.shopify_domain && (
              <p className="text-gray-500 text-sm truncate">{shop.shopify_domain}</p>
            )}
          </div>
          <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ))}

      {/* Ajouter une boutique */}
      {creating ? (
        <div className="p-4 bg-gray-900 border border-indigo-800 rounded-xl space-y-3">
          <p className="text-white font-medium">Nouvelle boutique</p>
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createShop()}
            placeholder="Ex : Noriane, Ma Suspension…"
            className="w-full px-3.5 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <div className="flex gap-2">
            <button
              onClick={createShop}
              disabled={loading || !newName.trim()}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg transition text-sm"
            >
              {loading ? 'Création…' : 'Créer'}
            </button>
            <button
              onClick={() => { setCreating(false); setNewName('') }}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg transition text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="w-full py-3 px-4 border border-dashed border-gray-700 hover:border-gray-500 text-gray-500 hover:text-gray-300 rounded-xl transition text-sm font-medium"
        >
          + Ajouter une boutique
        </button>
      )}
    </div>
  )
}
