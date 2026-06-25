import { createClient } from '@/lib/supabase/server'
import { ApiKeysManager } from '@/components/inventory/api-keys-manager'

export default async function ApiKeysPage() {
  const supabase = await createClient()
  const { data: keys } = await supabase
    .from('api_keys')
    .select('id, name, active, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
        <p className="text-gray-500 text-sm mt-1">Claves para que los agentes reporten equipos automáticamente</p>
      </div>
      <ApiKeysManager keys={keys ?? []} />
    </div>
  )
}
