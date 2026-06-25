import { createClient } from '@/lib/supabase/server'

export type UserRole = 'admin' | 'operator' | 'client'

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

export function canWrite(role: UserRole) {
  return role === 'admin' || role === 'operator'
}

export function isAdmin(role: UserRole) {
  return role === 'admin'
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  operator: 'Operador',
  client: 'Cliente',
}

export const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-700',
  operator: 'bg-blue-100 text-blue-700',
  client: 'bg-gray-100 text-gray-600',
}
