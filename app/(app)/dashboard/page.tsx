import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DEVICE_TYPE_LABELS, DEVICE_STATUS_LABELS } from '@/types'
import { Monitor, Server, Wifi, Printer, Clock, Activity, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: total },
    { data: byType },
    { data: byStatus },
    { data: recent },
    { data: recentlySeen },
  ] = await Promise.all([
    supabase.from('devices').select('*', { count: 'exact', head: true }),
    supabase.from('devices').select('type'),
    supabase.from('devices').select('status'),
    supabase.from('devices').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('devices').select('*').not('last_seen', 'is', null).order('last_seen', { ascending: false }).limit(5),
  ])

  const typeCounts: Record<string, number> = {}
  byType?.forEach((d) => { typeCounts[d.type] = (typeCounts[d.type] || 0) + 1 })

  const statusCounts: Record<string, number> = {}
  byStatus?.forEach((d) => { statusCounts[d.status] = (statusCounts[d.status] || 0) + 1 })

  const topTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 6)

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Resumen general del inventario</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Equipos</CardTitle>
            <Monitor className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{total ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Activos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{statusCounts['active'] ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Mantenimiento</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{statusCounts['maintenance'] ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Retirados</CardTitle>
            <Activity className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500">{statusCounts['retired'] ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por tipo de equipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topTypes.length === 0 && <p className="text-sm text-gray-400">Sin datos aún</p>}
              {topTypes.map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                    <span className="text-sm">{DEVICE_TYPE_LABELS[type as keyof typeof DEVICE_TYPE_LABELS] ?? type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-100 rounded-full h-2 w-24">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.round((count / (total ?? 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recently added */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Últimos agregados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recent?.length === 0 && <p className="text-sm text-gray-400">Sin equipos aún</p>}
              {recent?.map((device) => (
                <Link key={device.id} href={`/inventory/${device.id}`} className="flex items-center justify-between hover:bg-gray-50 rounded p-1 -mx-1">
                  <div>
                    <p className="text-sm font-medium">{device.hostname || device.model || 'Sin nombre'}</p>
                    <p className="text-xs text-gray-500">{DEVICE_TYPE_LABELS[device.type as keyof typeof DEVICE_TYPE_LABELS]} · {device.brand || '—'}</p>
                  </div>
                  <Badge variant={device.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {DEVICE_STATUS_LABELS[device.status as keyof typeof DEVICE_STATUS_LABELS]}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recently seen online */}
      {(recentlySeen?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              Vistos recientemente (agente)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentlySeen?.map((device) => (
                <Link key={device.id} href={`/inventory/${device.id}`}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{device.hostname || device.model}</p>
                    <p className="text-xs text-gray-500">
                      {device.last_seen
                        ? formatDistanceToNow(new Date(device.last_seen), { addSuffix: true, locale: es })
                        : '—'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
