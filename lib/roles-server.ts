// Server-only — uses next/headers via supabase server client
import { unstable_noStore as noStore } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/roles'

export async function getUserRole(): Promise<UserRole> {
  noStore()
  // Use regular client to get authenticated user
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'client'

  // Use admin client to bypass RLS when reading user's own role
  const admin = createAdminClient()
  const { data } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  return (data?.role as UserRole) ?? 'client'
}
