import { Sidebar } from "@/components/sidebar"
import { SettingsPanel } from "@/components/settings-panel"

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Тохиргоо</h1>
            <p className="text-muted-foreground">Системийн тохиргоо болон интеграци тохируулах</p>
          </div>
          <SettingsPanel />
        </main>
      </div>
    </div>
  )
}
