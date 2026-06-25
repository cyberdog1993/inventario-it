// Server-only — uses next/headers via supabase server client
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/roles'

export async function getUserRole(): Promise<UserRole> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'client'

  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  return (data?.role as UserRole) ?? 'client'
}
