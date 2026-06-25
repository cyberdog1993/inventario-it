// Server-only — uses next/headers via supabase server client
import { unstable_noStore as noStore } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/roles'

export async function getUserRole(): Promise<UserRole> {
  noStore()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'client'

  // Call SECURITY DEFINER function — bypasses RLS, runs as DB superuser
  const { data, error } = await supabase.rpc('get_my_role')
  if (error || !data) return 'client'

  return data as UserRole
}
