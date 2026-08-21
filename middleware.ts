import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Matches the CHECK constraint in supabase-schema.sql:
// role TEXT NOT NULL CHECK (role IN ('CLIENT', 'SERVICE_PROVIDER', 'ADMIN'))
type Role = 'CLIENT' | 'SERVICE_PROVIDER' | 'ADMIN'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

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
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refreshes the session (required on every request, since Vercel's
  // serverless functions don't share memory between invocations).
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // --- Which paths need which role? ---
  // TODO: confirm these prefixes match your real app/ route folder names
  // (I couldn't list the app/ directory via GitHub's API - robots.txt blocks it).
  const protectedPrefixes: { prefix: string; role: Role | 'any' }[] = [
    { prefix: '/admin', role: 'ADMIN' },
    { prefix: '/provider', role: 'SERVICE_PROVIDER' },
    { prefix: '/client', role: 'CLIENT' },
    { prefix: '/dashboard', role: 'any' },
  ]

  const matchedRoute = protectedPrefixes.find((r) => path.startsWith(r.prefix))

  if (matchedRoute) {
    // Not signed in at all -> bounce to login
    if (!user) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirectedFrom', path)
      return NextResponse.redirect(redirectUrl)
    }

    // Signed in but needs a specific role -> check profiles.role
    if (matchedRoute.role !== 'any') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== matchedRoute.role) {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
