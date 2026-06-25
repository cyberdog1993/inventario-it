'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, List, PlusCircle,
  Upload, Key, LogOut, Building2, Terminal, Users
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { UserRole } from '@/lib/roles'
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/roles'

const allNavItems = [
  { href: '/dashboard',     label: 'Dashboard',     icon: LayoutDashboard, roles: ['admin','operator','client'] },
  { href: '/inventory',     label: 'Inventario',    icon: List,            roles: ['admin','operator','client'] },
  { href: '/inventory/new', label: 'Agregar Equipo',icon: PlusCircle,      roles: ['admin','operator'] },
  { href: '/import',        label: 'Importar Excel',icon: Upload,          roles: ['admin','operator'] },
  { href: '/sites',         label: 'Ubicaciones',   icon: Building2,       roles: ['admin','operator'] },
  { href: '/agents',        label: 'Agentes',       icon: Terminal,        roles: ['admin','operator'] },
  { href: '/api-keys',      label: 'API Keys',      icon: Key,             roles: ['admin'] },
  { href: '/users',         label: 'Usuarios',      icon: Users,           roles: ['admin'] },
]

export function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const navItems = allNavItems.filter((item) => item.roles.includes(role))

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('Sesión cerrada')
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="p-5 border-b border-gray-700 flex flex-col items-center gap-2">
        <Image src="/logo-blanco.png" alt="Consultores-IT" width={160} height={27} priority />
        <p className="text-xs text-gray-400 tracking-widest">i n v e n t a r i o</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                ? 'bg-orange-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700 space-y-3">
        <div className="px-3">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[role]}`}>
            {ROLE_LABELS[role]}
          </span>
        </div>
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
