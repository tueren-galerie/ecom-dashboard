'use client'

import { useState } from 'react'
import { login, signup } from './actions'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)
    const action = mode === 'login' ? login : signup
    const result = await action(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo / titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Dashboard P&L</h1>
          <p className="text-gray-400 text-sm mt-1">
            {mode === 'login' ? 'Connecte-toi à ton espace' : 'Crée ton compte'}
          </p>
        </div>

        {/* Formulaire */}
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="thomas@exemple.com"
              className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Mot de passe
            </label>
            <input
              name="password"
              type="password"
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-950 border border-red-800 rounded-lg text-red-400 text-sm">
              {error === 'Invalid login credentials'
                ? 'Email ou mot de passe incorrect.'
                : error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
          >
            {loading
              ? 'Chargement…'
              : mode === 'login'
              ? 'Se connecter'
              : 'Créer le compte'}
          </button>
        </form>

        {/* Switch mode */}
        <p className="text-center text-gray-400 text-sm mt-6">
          {mode === 'login' ? (
            <>
              Pas encore de compte ?{' '}
              <button
                onClick={() => { setMode('signup'); setError(null) }}
                className="text-indigo-400 hover:text-indigo-300 font-medium"
              >
                S&apos;inscrire
              </button>
            </>
          ) : (
            <>
              Déjà un compte ?{' '}
              <button
                onClick={() => { setMode('login'); setError(null) }}
                className="text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Se connecter
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
