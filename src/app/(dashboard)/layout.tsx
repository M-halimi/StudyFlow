import { SidebarProvider } from "@/components/shared/sidebar-context"
import { Sidebar, MobileSidebar } from "@/components/shared/sidebar"
import { TopNav } from "@/components/shared/top-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen">
        <Sidebar />
        <MobileSidebar />
        <div className="lg:pl-[calc(240px+0.75rem)] transition-all duration-300">
          <div className="mx-auto max-w-7xl px-4 pt-3">
            <TopNav />
            <main className="pb-12">
              {children}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
