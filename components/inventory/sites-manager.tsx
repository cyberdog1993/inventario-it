'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { PlusCircle, Trash2, Building2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface Site { id: string; name: string; address: string | null; created_at: string }

export function SitesManager({ sites: initial }: { sites: Site[] }) {
  const [sites, setSites] = useState(initial)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    const { data, error } = await supabase.from('sites').insert([{ name: name.trim(), address: address.trim() || null }]).select().single()
    if (error) { toast.error('Error al guardar'); setLoading(false); return }
    setSites((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    setName(''); setAddress('')
    toast.success('Ubicación agregada')
    setLoading(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('sites').delete().eq('id', id)
    if (error) { toast.error('No se puede eliminar (tiene equipos asignados)'); return }
    setSites((prev) => prev.filter((s) => s.id !== id))
    toast.success('Ubicación eliminada')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-4">
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nombre del sitio *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Oficina Central" required />
              </div>
              <div className="space-y-1.5">
                <Label>Dirección</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Av. Principal 123" />
              </div>
            </div>
            <Button type="submit" size="sm" disabled={loading}>
              <PlusCircle className="h-4 w-4 mr-2" />Agregar ubicación
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {sites.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No hay ubicaciones aún</p>}
        {sites.map((site) => (
          <div key={site.id} className="flex items-center justify-between p-4 bg-white border rounded-lg">
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-gray-400" />
              <div>
                <p className="font-medium text-sm">{site.name}</p>
                {site.address && <p className="text-xs text-gray-500">{site.address}</p>}
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 h-7 w-7" onClick={() => handleDelete(site.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
