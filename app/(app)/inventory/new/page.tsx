import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/roles-server'
import { canWrite } from '@/lib/roles'
import { DeviceForm } from '@/components/inventory/device-form'

export default async function NewDevicePage() {
  const role = await getUserRole()
  if (!canWrite(role)) redirect('/inventory')
  const supabase = await createClient()
  const { data: sites } = await supabase.from('sites').select('id, name').order('name')

  return (
    <div className="p-8 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agregar equipo</h1>
        <p className="text-gray-500 text-sm mt-1">Registrar nuevo equipo en el inventario</p>
      </div>
      <DeviceForm sites={sites ?? []} />
    </div>
  )
}
