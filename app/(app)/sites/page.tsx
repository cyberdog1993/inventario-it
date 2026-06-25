import { createClient } from '@/lib/supabase/server'
import { SitesManager } from '@/components/inventory/sites-manager'

export default async function SitesPage() {
  const supabase = await createClient()
  const { data: sites } = await supabase.from('sites').select('*').order('name')

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ubicaciones</h1>
        <p className="text-gray-500 text-sm mt-1">Gestiona los sitios o sucursales de tu organización</p>
      </div>
      <SitesManager sites={sites ?? []} />
    </div>
  )
}
