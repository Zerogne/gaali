import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { PlateRecognitionPanel } from "@/components/plate-recognition-panel"
import { TruckDetailsPanel } from "@/components/truck-details-panel"
import { AlertsBanner } from "@/components/alerts-banner"
import { DashboardSummary } from "@/components/dashboard-summary"

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <AlertsBanner />
        <main className="flex-1 overflow-auto p-6">
          <DashboardSummary />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <PlateRecognitionPanel />
            <TruckDetailsPanel />
          </div>
        </main>
      </div>
    </div>
  )
}
