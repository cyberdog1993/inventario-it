'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Monitor, LayoutDashboard, List, PlusCircle,
  Upload, Key, LogOut, Building2, Terminal
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inventory', label: 'Inventario', icon: List },
  { href: '/inventory/new', label: 'Agregar Equipo', icon: PlusCircle },
  { href: '/import', label: 'Importar Excel', icon: Upload },
  { href: '/sites', label: 'Ubicaciones', icon: Building2 },
  { href: '/agents', label: 'Agentes', icon: Terminal },
  { href: '/api-keys', label: 'API Keys', icon: Key },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('Sesión cerrada')
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="p-6 flex items-center gap-3 border-b border-gray-700">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Monitor className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-sm">Inventario IT</p>
          <p className="text-xs text-gray-400">Consultores-IT</p>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white w-full transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
