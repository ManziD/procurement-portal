import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type Role = 'CLIENT' | 'SERVICE_PROVIDER' | 'ADMIN'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  // 🔍 DIAGNOSTIC: Log all cookies
  console.log('=== MIDDLEWARE COOKIES ===')
  const allCookies = request.cookies.getAll()
  console.log('Cookies found:', allCookies.map(c => c.name))
  console.log('Full cookie list:', allCookies)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          console.log('🔍 Setting cookies in middleware:', cookiesToSet.map(c => c.name))
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

  // 🔍 DIAGNOSTIC: Check if we can get the user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  
  console.log('🔍 getUser result:', user?.email || 'No user', 'Error:', userError?.message || 'None')

  const path = request.nextUrl.pathname
  const protectedPrefixes: { prefix: string; role: Role | 'any' }[] = [
    { prefix: '/admin', role: 'ADMIN' },
    { prefix: '/provider', role: 'SERVICE_PROVIDER' },
    { prefix: '/client', role: 'CLIENT' },
    { prefix: '/dashboard', role: 'any' },
  ]

  const matchedRoute = protectedPrefixes.find((r) => path.startsWith(r.prefix))

  if (matchedRoute) {
    if (!user) {
      console.log('🔍 No user found, redirecting to login')
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirectedFrom', path)
      return NextResponse.redirect(redirectUrl)
    }

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
