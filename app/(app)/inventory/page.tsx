import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/roles-server'
import { canWrite } from '@/lib/roles'
import { DEVICE_TYPE_LABELS, DEVICE_STATUS_LABELS, DeviceType, DeviceStatus } from '@/types'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PlusCircle, Upload } from 'lucide-react'
import { InventoryFilters } from '@/components/inventory/inventory-filters'

interface SearchParams {
  q?: string
  type?: string
  status?: string
  site?: string
}

const STATUS_COLORS: Record<DeviceStatus, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-700',
  maintenance: 'bg-yellow-100 text-yellow-800',
  retired: 'bg-red-100 text-red-700',
  unknown: 'bg-gray-100 text-gray-500',
}

export default async function InventoryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const [supabase, role] = await Promise.all([createClient(), getUserRole()])
  const writer = canWrite(role)

  let query = supabase
    .from('devices')
    .select('*, sites(name)')
    .order('created_at', { ascending: false })

  if (params.q) {
    query = query.or(`hostname.ilike.%${params.q}%,serial.ilike.%${params.q}%,brand.ilike.%${params.q}%,model.ilike.%${params.q}%,ip_address.ilike.%${params.q}%,mac_address.ilike.%${params.q}%`)
  }
  if (params.type) query = query.eq('type', params.type)
  if (params.status) query = query.eq('status', params.status)
  if (params.site) query = query.eq('site_id', params.site)

  const { data: devices } = await query
  const { data: sites } = await supabase.from('sites').select('id, name').order('name')

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-500 text-sm mt-1">{devices?.length ?? 0} equipos encontrados</p>
        </div>
        {writer && (
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/import"><Upload className="h-4 w-4 mr-2" />Importar</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/inventory/new"><PlusCircle className="h-4 w-4 mr-2" />Agregar</Link>
            </Button>
          </div>
        )}
      </div>

      <InventoryFilters sites={sites ?? []} />

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Hostname / Modelo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Marca</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">IP</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Ubicación</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Agente</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {devices?.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  {writer
                    ? <>No hay equipos. <Link href="/inventory/new" className="text-blue-600 hover:underline">Agregar el primero</Link></>
                    : 'No hay equipos registrados.'}
                </td>
              </tr>
            )}
            {devices?.map((device) => (
              <tr key={device.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/inventory/${device.id}`} className="font-medium text-blue-600 hover:underline">
                    {device.hostname || device.model || '—'}
                  </Link>
                  {device.serial && <p className="text-xs text-gray-400">S/N: {device.serial}</p>}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {DEVICE_TYPE_LABELS[device.type as DeviceType] ?? device.type}
                </td>
                <td className="px-4 py-3 text-gray-700">{device.brand || '—'}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{device.ip_address || '—'}</td>
                <td className="px-4 py-3 text-gray-700">{device.sites?.name || device.location || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[device.status as DeviceStatus]}`}>
                    {DEVICE_STATUS_LABELS[device.status as DeviceStatus]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {device.auto_reported
                    ? <span className="text-green-600 text-xs">● Auto</span>
                    : <span className="text-gray-400 text-xs">Manual</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
