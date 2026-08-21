import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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

  // Refresh the session (keeps the cookie alive)
  await supabase.auth.getUser()

  // No protected routes – all auth is handled client-side (temporary workaround)
  // const protectedPrefixes: { prefix: string; role: Role | 'any' }[] = []

  return response
}

export const config = {
  matcher: [
  '/((?!_next/static|_next/image|favicon.ico|public|dashboard|dashboard-new).*)',
],
}
