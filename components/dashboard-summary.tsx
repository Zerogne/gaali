import { Truck, AlertTriangle, FileText, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"

const summaryCards = [
  {
    icon: Truck,
    label: "Total Trucks Today",
    value: "47",
    change: "+12 from yesterday",
    positive: true,
  },
  {
    icon: AlertTriangle,
    label: "Alerts",
    value: "3",
    change: "2 unrecognized plates",
    positive: false,
  },
  {
    icon: FileText,
    label: "Pending Reports",
    value: "8",
    change: "Requires review",
    positive: false,
  },
  {
    icon: TrendingUp,
    label: "Avg. Processing Time",
    value: "2.3 min",
    change: "-0.5 min improvement",
    positive: true,
  },
]

export function DashboardSummary() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {summaryCards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.label} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-foreground mb-2">{card.value}</p>
                <p className={`text-xs ${card.positive ? "text-green-500" : "text-orange-500"}`}>{card.change}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  card.positive ? "bg-green-500/10" : "bg-orange-500/10"
                }`}
              >
                <Icon className={`w-6 h-6 ${card.positive ? "text-green-500" : "text-orange-500"}`} />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
