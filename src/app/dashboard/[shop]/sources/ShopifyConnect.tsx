'use client'

import { useState } from 'react'

interface Connector {
  status: string
  last_sync: string | null
  error_msg: string | null
  shopify_domain: string | null
}

interface Props {
  shopSlug: string
  connector: Connector | null
}

export default function ShopifyConnect({ shopSlug, connector }: Props) {
  const [domain, setDomain] = useState(connector?.shopify_domain ?? '')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [syncResult, setSyncResult] = useState<{ orders: number; payouts: number; period: string } | null>(null)
  const [editing, setEditing] = useState(!connector)

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/shopify/${shopSlug}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, token }),
      })
      const data = await res.json() as { success?: boolean; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Erreur connexion')
      setMessage({ type: 'success', text: 'Shopify connecté ! Lance une synchronisation.' })
      setEditing(false)
      setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Erreur' })
    } finally {
      setLoading(false)
    }
  }

  async function handleSync() {
    setSyncing(true)
    setMessage(null)
    setSyncResult(null)
    try {
      const res = await fetch(`/api/shopify/${shopSlug}/sync`, { method: 'POST' })
      const data = await res.json() as { success?: boolean; error?: string; orders?: number; payouts?: number; period?: string }
      if (!res.ok) throw new Error(data.error ?? 'Erreur sync')
      setSyncResult({ orders: data.orders ?? 0, payouts: data.payouts ?? 0, period: data.period ?? '' })
      setMessage({ type: 'success', text: `Synchronisation terminée.` })
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Erreur' })
    } finally {
      setSyncing(false)
    }
  }

  const isConnected = connector?.status === 'active' && !editing

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#96BF48]/10 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-[#96BF48]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.337 23.979l7.453-1.858S19.494 6.99 19.475 6.87a.338.338 0 00-.334-.295c-.013 0-1.48-.028-1.48-.028s-.985-.96-1.374-1.34V23.98zM14.21 7.2s-.647-.196-1.43-.196c-1.18 0-1.237.74-1.237.926 0 1.016 2.65 1.406 2.65 3.784 0 1.873-1.187 3.076-2.788 3.076-1.92 0-2.9-1.196-2.9-1.196l.512-1.693s1.01.867 1.862.867c.557 0 .782-.438.782-.756 0-1.327-2.172-1.386-2.172-3.564 0-1.833 1.317-3.61 3.974-3.61 1.026 0 1.532.294 1.532.294L14.21 7.2zm-2.764-4.6c0-.045.004-.088.004-.133C11.45.943 10.017 0 8.267 0 5.73 0 4.5 1.904 4.5 3.775c0 .055.003.11.003.163H2.16L0 23.979l16.52 2.977V6.597L14.21 7.2l-2.763-4.6z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold">Shopify</h3>
            <p className="text-gray-500 text-xs">Commandes · Payouts · Sessions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <span className="flex items-center gap-1.5 text-xs text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              Connecté
            </span>
          ) : connector?.status === 'error' ? (
            <span className="flex items-center gap-1.5 text-xs text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
              Erreur
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-500 inline-block" />
              Non connecté
            </span>
          )}
        </div>
      </div>

      {/* Connected state */}
      {isConnected && (
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Boutique</span>
              <span className="text-white font-mono">{connector?.shopify_domain}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Dernière sync</span>
              <span className="text-white">
                {connector?.last_sync
                  ? new Date(connector.last_sync).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })
                  : 'Jamais'}
              </span>
            </div>
          </div>

          {syncResult && (
            <div className="bg-indigo-950 border border-indigo-900 rounded-lg p-3 text-sm text-indigo-300">
              ✓ {syncResult.orders} commandes · {syncResult.payouts} payouts · {syncResult.period}
            </div>
          )}

          {message && (
            <p className={`text-sm ${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
              {message.text}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
            >
              {syncing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Synchronisation…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Synchroniser maintenant
                </>
              )}
            </button>
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2.5 text-gray-400 hover:text-white text-sm border border-gray-700 hover:border-gray-600 rounded-lg transition"
            >
              Modifier
            </button>
          </div>
        </div>
      )}

      {/* Form state */}
      {!isConnected && (
        <form onSubmit={handleConnect} className="space-y-4">
          <p className="text-gray-400 text-sm mb-4">
            Crée une <strong className="text-gray-300">app personnalisée</strong> dans ton Admin Shopify → Apps → Développer des apps, puis copie le token d&apos;accès.
          </p>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Domaine Shopify</label>
            <input
              type="text"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              placeholder="ma-boutique.myshopify.com"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Token d&apos;accès admin</label>
            <input
              type="password"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="shpat_xxxxxxxxxxxxxxxxxxxx"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <p className="text-gray-600 text-xs mt-1">Scopes requis : read_orders, read_shopify_payments, read_analytics</p>
          </div>

          {message && (
            <p className={`text-sm ${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
              {message.text}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
            >
              {loading ? 'Validation…' : 'Connecter Shopify'}
            </button>
            {editing && connector && (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2.5 text-gray-400 hover:text-white text-sm border border-gray-700 hover:border-gray-600 rounded-lg transition"
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
