'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { DEVICE_TYPE_LABELS, DEVICE_STATUS_LABELS } from '@/types'
import { X } from 'lucide-react'
import { useCallback } from 'react'

interface Site { id: string; name: string }

export function InventoryFilters({ sites }: { sites: Site[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateParam = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  const hasFilters = searchParams.size > 0

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Input
        placeholder="Buscar hostname, serial, IP, marca..."
        className="max-w-xs"
        defaultValue={searchParams.get('q') ?? ''}
        onChange={(e) => updateParam('q', e.target.value || null)}
      />
      <Select
        defaultValue={searchParams.get('type') ?? 'all'}
        onValueChange={(v) => updateParam('type', v)}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los tipos</SelectItem>
          {Object.entries(DEVICE_TYPE_LABELS).map(([k, v]) => (
            <SelectItem key={k} value={k}>{v}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        defaultValue={searchParams.get('status') ?? 'all'}
        onValueChange={(v) => updateParam('status', v)}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          {Object.entries(DEVICE_STATUS_LABELS).map(([k, v]) => (
            <SelectItem key={k} value={k}>{v}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {sites.length > 0 && (
        <Select
          defaultValue={searchParams.get('site') ?? 'all'}
          onValueChange={(v) => updateParam('site', v)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Ubicación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las ubicaciones</SelectItem>
            {sites.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => router.push(pathname)}>
          <X className="h-4 w-4 mr-1" />Limpiar
        </Button>
      )}
    </div>
  )
}
