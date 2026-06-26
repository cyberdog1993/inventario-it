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
import { UserCircle, PlusCircle, Trash2, Pencil, X, Check } from 'lucide-react'

interface User {
  id: string
  email: string
  role: UserRole
  created_at: string
  last_sign_in: string | null
}

interface EditState {
  role: UserRole
  password: string
}

export function UsersManager({ users: initial }: { users: User[] }) {
  const [users, setUsers] = useState(initial)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newRole, setNewRole] = useState<UserRole>('client')
  const [loading, setLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [editState, setEditState] = useState<EditState>({ role: 'client', password: '' })
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

  function startEdit(user: User) {
    setEditing(user.id)
    setEditState({ role: user.role, password: '' })
    setConfirmDelete(null)
  }

  function cancelEdit() {
    setEditing(null)
    setEditState({ role: 'client', password: '' })
  }

  async function handleSaveEdit(userId: string) {
    if (!editState.password && editState.role === users.find(u => u.id === userId)?.role) {
      cancelEdit(); return
    }
    const body: Record<string, string> = { userId, role: editState.role }
    if (editState.password) body.password = editState.password

    const res = await fetch('/api/users', {
      method: 'PATCH',
      headers: await authHeaders(),
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error ?? 'Error al guardar'); return }
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: editState.role } : u))
    toast.success('Usuario actualizado')
    cancelEdit()
    router.refresh()
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
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" required minLength={8} />
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
          <div key={user.id} className="bg-white border rounded-lg overflow-hidden">
            {/* Main row */}
            <div className="flex items-center justify-between p-4 gap-4">
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
                {editing !== user.id && confirmDelete !== user.id && (
                  <>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-700" onClick={() => startEdit(user)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:text-red-600" onClick={() => { setConfirmDelete(user.id); setEditing(null) }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
                {confirmDelete === user.id && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => handleDelete(user.id)}>Eliminar</Button>
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
                  </div>
                )}
                {editing === user.id && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="default" className="h-8 w-8 p-0" onClick={() => handleSaveEdit(user.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={cancelEdit}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Edit panel */}
            {editing === user.id && (
              <div className="border-t bg-gray-50 px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Rol</Label>
                  <Select value={editState.role} onValueChange={(v) => setEditState(s => ({ ...s, role: v as UserRole }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Nueva contraseña <span className="text-gray-400">(dejar vacío para no cambiar)</span></Label>
                  <Input
                    type="password"
                    className="h-8 text-xs"
                    placeholder="Mínimo 8 caracteres"
                    minLength={8}
                    value={editState.password}
                    onChange={(e) => setEditState(s => ({ ...s, password: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
