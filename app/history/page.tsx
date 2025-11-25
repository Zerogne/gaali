import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { HistoryTable } from "@/components/history-table"

export default function HistoryPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">History</h1>
            <p className="text-muted-foreground">View and search all scanned truck records</p>
          </div>
          <HistoryTable />
        </main>
      </div>
    </div>
  )
}
