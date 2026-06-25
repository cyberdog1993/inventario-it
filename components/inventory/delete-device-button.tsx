'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export function DeleteDeviceButton({ id }: { id: string }) {
  const [confirm, setConfirm] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleDelete() {
    const { error } = await supabase.from('devices').delete().eq('id', id)
    if (error) { toast.error('Error al eliminar'); return }
    toast.success('Equipo eliminado')
    router.push('/inventory')
    router.refresh()
  }

  if (confirm) {
    return (
      <div className="flex gap-2">
        <Button variant="destructive" size="sm" onClick={handleDelete}>Confirmar</Button>
        <Button variant="outline" size="sm" onClick={() => setConfirm(false)}>Cancelar</Button>
      </div>
    )
  }

  return (
    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => setConfirm(true)}>
      <Trash2 className="h-4 w-4 mr-2" />Eliminar
    </Button>
  )
}
