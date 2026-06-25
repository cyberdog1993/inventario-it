import { Sidebar } from '@/components/layout/sidebar'
import { Footer } from '@/components/layout/footer'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  )
}
