import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Singleton service role client (server-side only, bypasses RLS)
let adminClient: ReturnType<typeof createSupabaseClient> | null = null

export function createAdminClient() {
  if (!adminClient) {
    adminClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  }
  return adminClient
}
