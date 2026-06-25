'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { PlusCircle, Copy, Trash2, Key } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import crypto from 'crypto'

interface ApiKey { id: string; name: string; active: boolean; created_at: string }

export function ApiKeysManager({ keys: initial }: { keys: ApiKey[] }) {
  const [keys, setKeys] = useState(initial)
  const [name, setName] = useState('')
  const [newKey, setNewKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)

    const rawKey = `inv_${crypto.randomUUID().replace(/-/g, '')}`
    const keyHash = await sha256(rawKey)

    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('api_keys')
      .insert([{ name: name.trim(), key_hash: keyHash, created_by: user?.id, active: true }])
      .select('id, name, active, created_at')
      .single()

    if (error) { toast.error('Error al crear la clave'); setLoading(false); return }

    setKeys((prev) => [data, ...prev])
    setNewKey(rawKey)
    setName('')
    setLoading(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('api_keys').delete().eq('id', id)
    if (error) { toast.error('Error al eliminar'); return }
    setKeys((prev) => prev.filter((k) => k.id !== id))
    toast.success('Clave eliminada')
    router.refresh()
  }

  function copyKey(key: string) {
    navigator.clipboard.writeText(key)
    toast.success('Copiado al portapapeles')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-4">
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nombre de la clave</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Agente Windows - Oficina" required />
            </div>
            <Button type="submit" size="sm" disabled={loading}>
              <PlusCircle className="h-4 w-4 mr-2" />Generar nueva clave
            </Button>
          </form>
        </CardContent>
      </Card>

      {newKey && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-green-800">¡Clave generada! Cópiala ahora — no se mostrará de nuevo.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white border rounded px-3 py-2 text-sm font-mono text-green-900 break-all">{newKey}</code>
            <Button size="sm" variant="outline" onClick={() => copyKey(newKey)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <Button size="sm" variant="ghost" className="text-xs" onClick={() => setNewKey(null)}>Entendido, ya la copié</Button>
        </div>
      )}

      <div className="space-y-2">
        {keys.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No hay claves aún</p>}
        {keys.map((key) => (
          <div key={key.id} className="flex items-center justify-between p-4 bg-white border rounded-lg">
            <div className="flex items-center gap-3">
              <Key className="h-4 w-4 text-gray-400" />
              <div>
                <p className="font-medium text-sm">{key.name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(key.created_at).toLocaleDateString('es-MX')} · {key.active ? '● Activa' : '○ Inactiva'}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 h-7 w-7" onClick={() => handleDelete(key.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

async function sha256(text: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}
