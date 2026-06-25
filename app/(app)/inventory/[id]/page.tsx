import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { DEVICE_TYPE_LABELS, DEVICE_STATUS_LABELS, DeviceType, DeviceStatus } from '@/types'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DeleteDeviceButton } from '@/components/inventory/delete-device-button'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function DeviceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: device } = await supabase
    .from('devices')
    .select('*, sites(name)')
    .eq('id', id)
    .single()

  if (!device) notFound()

  function row(label: string, value: string | number | null | undefined) {
    if (!value && value !== 0) return null
    return (
      <div key={label} className="grid grid-cols-2 gap-2 py-2 border-b last:border-0">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="text-sm font-medium">{String(value)}</span>
      </div>
    )
  }

  const STATUS_COLORS: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-700',
    maintenance: 'bg-yellow-100 text-yellow-800',
    retired: 'bg-red-100 text-red-700',
    unknown: 'bg-gray-100 text-gray-500',
  }

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/inventory"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{device.hostname || device.model || 'Equipo sin nombre'}</h1>
            <p className="text-gray-500 text-sm">{DEVICE_TYPE_LABELS[device.type as DeviceType]} · {device.brand || '—'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/inventory/${id}/edit`}><Edit className="h-4 w-4 mr-2" />Editar</Link>
          </Button>
          <DeleteDeviceButton id={id} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[device.status]}`}>
          {DEVICE_STATUS_LABELS[device.status as DeviceStatus]}
        </span>
        {device.auto_reported && (
          <span className="text-green-600 text-xs bg-green-50 px-2 py-1 rounded-full">● Reportado automáticamente</span>
        )}
        {device.last_seen && (
          <span className="text-gray-500 text-xs">
            Visto {formatDistanceToNow(new Date(device.last_seen), { addSuffix: true, locale: es })}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Identificación</CardTitle></CardHeader>
          <CardContent className="divide-y">
            {row('Hostname', device.hostname)}
            {row('Número de serie', device.serial)}
            {row('Marca', device.brand)}
            {row('Modelo', device.model)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Red</CardTitle></CardHeader>
          <CardContent className="divide-y">
            {row('IP', device.ip_address)}
            {row('MAC', device.mac_address)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Especificaciones</CardTitle></CardHeader>
          <CardContent className="divide-y">
            {row('Sistema operativo', device.os)}
            {row('Versión OS', device.os_version)}
            {row('CPU', device.cpu)}
            {row('RAM', device.ram_gb ? `${device.ram_gb} GB` : null)}
            {row('Almacenamiento', device.storage_gb ? `${device.storage_gb} GB` : null)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Ubicación y asignación</CardTitle></CardHeader>
          <CardContent className="divide-y">
            {row('Sitio', device.sites?.name)}
            {row('Ubicación', device.location)}
            {row('Asignado a', device.assigned_to)}
            {row('Fecha de compra', device.purchase_date)}
            {row('Garantía hasta', device.warranty_until)}
          </CardContent>
        </Card>
      </div>

      {device.notes && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Notas</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-gray-700">{device.notes}</p></CardContent>
        </Card>
      )}
    </div>
  )
}
