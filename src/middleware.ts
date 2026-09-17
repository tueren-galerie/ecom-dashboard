import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Rafraîchit la session (IMPORTANT : ne pas supprimer)
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Routes publiques autorisées sans auth
  const publicRoutes = ['/login', '/auth/callback']
  const isPublic = publicRoutes.some(r => pathname.startsWith(r))

  // Pas connecté → login
  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Connecté et va sur /login → /select
  if (user && pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/select'
    return NextResponse.redirect(url)
  }

  // Connecté mais pas encore choisi de boutique → /select
  // (sauf s'il y est déjà ou sur /auth/*)
  if (user && pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/select'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
