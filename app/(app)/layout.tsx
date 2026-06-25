import { unstable_noStore as noStore } from 'next/cache'
import { Sidebar } from '@/components/layout/sidebar'
import { Footer } from '@/components/layout/footer'
import { getUserRole } from '@/lib/roles-server'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  noStore()
  const role = await getUserRole()

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col overflow-auto">
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  )
}
