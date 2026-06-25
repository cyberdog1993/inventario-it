import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { DeviceForm } from '@/components/inventory/device-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditDevicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const [{ data: device }, { data: sites }] = await Promise.all([
    supabase.from('devices').select('*').eq('id', id).single(),
    supabase.from('sites').select('id, name').order('name'),
  ])
  if (!device) notFound()

  return (
    <div className="p-8 max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/inventory/${id}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar equipo</h1>
          <p className="text-gray-500 text-sm">{device.hostname || device.model}</p>
        </div>
      </div>
      <DeviceForm device={device} sites={sites ?? []} />
    </div>
  )
}
