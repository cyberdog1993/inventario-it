'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DEVICE_TYPE_LABELS, DEVICE_STATUS_LABELS, Device } from '@/types'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Site { id: string; name: string }

interface Props {
  device?: Device
  sites: Site[]
}

export function DeviceForm({ device, sites }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    type: device?.type ?? 'desktop',
    hostname: device?.hostname ?? '',
    serial: device?.serial ?? '',
    brand: device?.brand ?? '',
    model: device?.model ?? '',
    ip_address: device?.ip_address ?? '',
    mac_address: device?.mac_address ?? '',
    os: device?.os ?? '',
    os_version: device?.os_version ?? '',
    cpu: device?.cpu ?? '',
    ram_gb: device?.ram_gb?.toString() ?? '',
    storage_gb: device?.storage_gb?.toString() ?? '',
    location: device?.location ?? '',
    site_id: device?.site_id ?? '',
    status: device?.status ?? 'unknown',
    notes: device?.notes ?? '',
    assigned_to: device?.assigned_to ?? '',
    purchase_date: device?.purchase_date ?? '',
    warranty_until: device?.warranty_until ?? '',
  })

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const payload = {
      ...form,
      ram_gb: form.ram_gb ? Number(form.ram_gb) : null,
      storage_gb: form.storage_gb ? Number(form.storage_gb) : null,
      site_id: form.site_id || null,
      purchase_date: form.purchase_date || null,
      warranty_until: form.warranty_until || null,
    }

    if (device) {
      const { error } = await supabase.from('devices').update(payload).eq('id', device.id)
      if (error) { toast.error('Error al actualizar'); setLoading(false); return }
      toast.success('Equipo actualizado')
      router.push(`/inventory/${device.id}`)
    } else {
      const { error } = await supabase.from('devices').insert([payload])
      if (error) { toast.error('Error al guardar'); setLoading(false); return }
      toast.success('Equipo agregado al inventario')
      router.push('/inventory')
    }
    router.refresh()
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Información básica</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Tipo de equipo *</Label>
            <Select value={form.type} onValueChange={(v) => set('type', v ?? 'other')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(DEVICE_TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Estado *</Label>
            <Select value={form.status} onValueChange={(v) => set('status', v ?? 'unknown')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(DEVICE_STATUS_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Hostname</Label>
            <Input value={form.hostname} onChange={(e) => set('hostname', e.target.value)} placeholder="PC-JULIO-01" />
          </div>
          <div className="space-y-1.5">
            <Label>Marca</Label>
            <Input value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="Dell, HP, Cisco..." />
          </div>
          <div className="space-y-1.5">
            <Label>Modelo</Label>
            <Input value={form.model} onChange={(e) => set('model', e.target.value)} placeholder="OptiPlex 7010..." />
          </div>
          <div className="space-y-1.5">
            <Label>Número de serie</Label>
            <Input value={form.serial} onChange={(e) => set('serial', e.target.value)} placeholder="ABC123XYZ" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Red</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Dirección IP</Label>
            <Input value={form.ip_address} onChange={(e) => set('ip_address', e.target.value)} placeholder="192.168.1.100" />
          </div>
          <div className="space-y-1.5">
            <Label>Dirección MAC</Label>
            <Input value={form.mac_address} onChange={(e) => set('mac_address', e.target.value)} placeholder="AA:BB:CC:DD:EE:FF" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Especificaciones</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Sistema operativo</Label>
            <Input value={form.os} onChange={(e) => set('os', e.target.value)} placeholder="Windows, Linux..." />
          </div>
          <div className="space-y-1.5">
            <Label>Versión OS</Label>
            <Input value={form.os_version} onChange={(e) => set('os_version', e.target.value)} placeholder="11, Ubuntu 24.04..." />
          </div>
          <div className="space-y-1.5">
            <Label>CPU</Label>
            <Input value={form.cpu} onChange={(e) => set('cpu', e.target.value)} placeholder="Intel Core i7-12700..." />
          </div>
          <div className="space-y-1.5">
            <Label>RAM (GB)</Label>
            <Input type="number" value={form.ram_gb} onChange={(e) => set('ram_gb', e.target.value)} placeholder="16" />
          </div>
          <div className="space-y-1.5">
            <Label>Almacenamiento (GB)</Label>
            <Input type="number" value={form.storage_gb} onChange={(e) => set('storage_gb', e.target.value)} placeholder="512" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Ubicación y asignación</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Sitio</Label>
            <Select value={form.site_id || 'none'} onValueChange={(v) => set('site_id', (v ?? 'none') === 'none' ? '' : (v ?? ''))}>
              <SelectTrigger><SelectValue placeholder="Seleccionar sitio" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin asignar</SelectItem>
                {sites.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Ubicación (texto)</Label>
            <Input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Piso 2, sala de servidores..." />
          </div>
          <div className="space-y-1.5">
            <Label>Asignado a</Label>
            <Input value={form.assigned_to} onChange={(e) => set('assigned_to', e.target.value)} placeholder="Nombre del usuario" />
          </div>
          <div className="space-y-1.5">
            <Label>Fecha de compra</Label>
            <Input type="date" value={form.purchase_date} onChange={(e) => set('purchase_date', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Garantía hasta</Label>
            <Input type="date" value={form.warranty_until} onChange={(e) => set('warranty_until', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Notas</CardTitle></CardHeader>
        <CardContent>
          <Textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} placeholder="Observaciones adicionales..." />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : device ? 'Actualizar equipo' : 'Guardar equipo'}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
      </div>
    </form>
  )
}
