'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ROLE_LABELS, ROLE_COLORS, type UserRole } from '@/lib/roles'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { UserCircle } from 'lucide-react'

interface User {
  id: string
  email: string
  role: UserRole
  created_at: string
  last_sign_in: string | null
}

export function UsersManager({ users: initial }: { users: User[] }) {
  const [users, setUsers] = useState(initial)
  const supabase = createClient()

  async function handleRoleChange(userId: string, newRole: UserRole | null) {
    if (!newRole) return
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('user_roles').upsert({
      user_id: userId,
      role: newRole,
      assigned_by: user?.id,
      assigned_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    if (error) { toast.error('Error al cambiar rol'); return }

    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u))
    toast.success('Rol actualizado')
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <div key={user.id} className="flex items-center justify-between p-4 bg-white border rounded-lg">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-gray-100 rounded-full p-2 flex-shrink-0">
              <UserCircle className="h-5 w-5 text-gray-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user.email}</p>
              <p className="text-xs text-gray-400">
                {user.last_sign_in
                  ? `Último acceso ${formatDistanceToNow(new Date(user.last_sign_in), { addSuffix: true, locale: es })}`
                  : 'Sin accesos registrados'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 ml-4">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium hidden sm:inline ${ROLE_COLORS[user.role]}`}>
              {ROLE_LABELS[user.role]}
            </span>
            <Select
              value={user.role}
              onValueChange={(v) => handleRoleChange(user.id, v as UserRole ?? null)}
            >
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}
    </div>
  )
}
