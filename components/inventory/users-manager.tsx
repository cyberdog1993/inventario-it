'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ROLE_LABELS, ROLE_COLORS, type UserRole } from '@/lib/roles'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { UserCircle, PlusCircle, Trash2 } from 'lucide-react'

interface User {
  id: string
  email: string
  role: UserRole
  created_at: string
  last_sign_in: string | null
}

export function UsersManager({ users: initial }: { users: User[] }) {
  const [users, setUsers] = useState(initial)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newRole, setNewRole] = useState<UserRole>('client')
  const [loading, setLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function authHeaders() {
    const { data: { session } } = await supabase.auth.getSession()
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token ?? ''}`,
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({ email, password, role: newRole }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error ?? 'Error al crear usuario'); setLoading(false); return }
    setUsers((prev) => [...prev, {
      id: data.id,
      email: data.email,
      role: data.role,
      created_at: new Date().toISOString(),
      last_sign_in: null,
    }])
    setEmail(''); setPassword(''); setNewRole('client')
    toast.success('Usuario creado')
    setLoading(false)
    router.refresh()
  }

  async function handleRoleChange(userId: string, role: UserRole | null) {
    if (!role) return
    const res = await fetch('/api/users', {
      method: 'PATCH',
      headers: await authHeaders(),
      body: JSON.stringify({ userId, role }),
    })
    if (!res.ok) { toast.error('Error al cambiar rol'); return }
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u))
    toast.success('Rol actualizado')
  }

  async function handleDelete(userId: string) {
    const res = await fetch('/api/users', {
      method: 'DELETE',
      headers: await authHeaders(),
      body: JSON.stringify({ userId }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error ?? 'Error al eliminar'); setConfirmDelete(null); return }
    setUsers((prev) => prev.filter((u) => u.id !== userId))
    setConfirmDelete(null)
    toast.success('Usuario eliminado')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Create user */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><PlusCircle className="h-4 w-4" />Crear usuario</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Correo electrónico</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario@consultores-it.com" required />
            </div>
            <div className="space-y-1.5">
              <Label>Contraseña</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6} />
            </div>
            <div className="space-y-1.5">
              <Label>Rol</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole((v ?? 'client') as UserRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? 'Creando...' : 'Crear usuario'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Users list */}
      <div className="space-y-2">
        {users.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No hay usuarios</p>}
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-4 bg-white border rounded-lg gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
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
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium hidden md:inline ${ROLE_COLORS[user.role]}`}>
                {ROLE_LABELS[user.role]}
              </span>
              <Select value={user.role} onValueChange={(v) => handleRoleChange(user.id, (v ?? null) as UserRole | null)}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {confirmDelete === user.id ? (
                <div className="flex gap-1">
                  <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => handleDelete(user.id)}>Confirmar</Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
                </div>
              ) : (
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:text-red-600" onClick={() => setConfirmDelete(user.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
