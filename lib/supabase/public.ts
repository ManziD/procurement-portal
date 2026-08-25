import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// For fully public, read-only data (categories, questions) that never depends
// on a logged-in user or request cookies. Safe to call from generateStaticParams,
// which runs at build time before any request context exists.
export const createPublicClient = () =>
  createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
