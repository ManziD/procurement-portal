# procurement-portal — Build Status

## ✅ Complete and committed in this scaffold

- .env.example
- .gitignore
- supabase-schema.sql
- package.json (with all deps this codebase actually imports)
- next.config.js
- tsconfig.json
- postcss.config.js
- tailwind.config.ts
- app/globals.css
- app/layout.tsx
- app/page.tsx
- app/(auth)/login/page.tsx
- app/(auth)/register/page.tsx
- app/auth/callback/route.ts
- middleware.ts (session refresh only — see warning below)
- lib/supabase/client.ts
- lib/supabase/server.ts
- lib/constants.ts
- lib/utils.ts
- components/Navbar.tsx
- components/HeroBanner.tsx
- components/CategoryCard.tsx
- components/ServiceCard.tsx
- components/Footer.tsx
- components/LocationDropdown.tsx
- components/ThemeProvider.tsx
- components/ui/button.tsx
- components/ui/card.tsx
- components/ui/input.tsx
- components/ui/textarea.tsx
- components/ui/select.tsx
- components/ui/badge.tsx
- components/ui/avatar.tsx

## ⚠️ Known issue already in this scaffold

`middleware.ts` only refreshes the Supabase session. It does **not**
block a CLIENT from visiting `/admin/dashboard` or a PROVIDER from
visiting `/client/*`. That protection has to live in each dashboard
layout (see missing files below) with a server-side check like:

```ts
const profile = await getCurrentProfile()
if (profile?.role !== 'ADMIN') redirect('/login')
```

Don't treat auth as "done" until those layouts exist and enforce this.

## ❌ Still missing — not yet provided by your AI source, not fabricated here

- app/(auth)/layout.tsx
- app/(dashboard)/layout.tsx
- app/(dashboard)/client/layout.tsx (needs role check — see warning above)
- app/(dashboard)/client/dashboard/page.tsx
- app/(dashboard)/client/post-rfs/page.tsx
- app/(dashboard)/client/my-rfs/page.tsx
- app/(dashboard)/provider/layout.tsx (needs role check)
- app/(dashboard)/provider/dashboard/page.tsx
- app/(dashboard)/provider/profile/page.tsx
- app/(dashboard)/provider/proposals/page.tsx
- app/(dashboard)/admin/layout.tsx (needs role check)
- app/(dashboard)/admin/dashboard/page.tsx
- app/(dashboard)/admin/verify-providers/page.tsx
- app/api/rfs/route.ts
- app/api/rfs/[id]/route.ts
- app/api/proposals/route.ts
- app/api/proposals/[id]/route.ts (flagged missing in earlier review)
- app/api/messages/route.ts
- app/browse/page.tsx
- app/rfs/[id]/page.tsx
- types/index.ts

## Decisions still pending from your engineer (flagged earlier, unresolved)

1. Provider verification: direct Supabase write from client + RLS, or a
   dedicated API route?
2. Server Actions vs. Route Handlers for mutations going forward?
3. Messaging structure: flat route or per-conversation
   (`api/messages/[conversationId]/route.ts`)?

## Note on removed NextAuth references

Your original folder tree included `app/api/auth/[...nextauth]/route.ts`
and NextAuth env vars. Every actual code file uses Supabase Auth directly
instead. This scaffold does NOT include the NextAuth route or its env
vars — only add them back if your engineer explicitly says you're
running both auth systems side by side (unusual, and worth double-checking).
