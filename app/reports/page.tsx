import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ReportsGenerator } from "@/components/reports-generator"

export default function ReportsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Reports</h1>
            <p className="text-muted-foreground">Generate custom reports and export data</p>
          </div>
          <ReportsGenerator />
        </main>
      </div>
    </div>
  )
}
