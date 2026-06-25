import { createAdminClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/roles'
import { redirect } from 'next/navigation'
import { UsersManager } from '@/components/inventory/users-manager'

export default async function UsersPage() {
  const role = await getUserRole()
  if (role !== 'admin') redirect('/dashboard')

  const supabase = await createAdminClient()

  // Get all users with their roles
  const { data: { users } } = await supabase.auth.admin.listUsers()
  const { data: roles } = await supabase.from('user_roles').select('user_id, role')

  const roleMap = Object.fromEntries((roles ?? []).map((r) => [r.user_id, r.role]))

  const usersWithRoles = users.map((u) => ({
    id: u.id,
    email: u.email ?? '',
    role: (roleMap[u.id] ?? 'client') as 'admin' | 'operator' | 'client',
    created_at: u.created_at,
    last_sign_in: u.last_sign_in_at ?? null,
  }))

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <p className="text-gray-500 text-sm mt-1">Gestión de accesos y roles del sistema</p>
      </div>
      <UsersManager users={usersWithRoles} />
    </div>
  )
}
