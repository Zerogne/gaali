import { Truck, AlertTriangle, FileText, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const summaryCards = [
  {
    icon: Truck,
    label: "Total Trucks Today",
    value: "47",
    change: "+12 from yesterday",
    positive: true,
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
  },
  {
    icon: AlertTriangle,
    label: "Alerts",
    value: "3",
    change: "2 unrecognized plates",
    positive: false,
    gradient: "from-orange-500/10 to-red-500/10",
    iconColor: "text-orange-500",
    iconBg: "bg-orange-500/10",
  },
  {
    icon: FileText,
    label: "Pending Reports",
    value: "8",
    change: "Requires review",
    positive: false,
    gradient: "from-amber-500/10 to-yellow-500/10",
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10",
  },
  {
    icon: TrendingUp,
    label: "Avg. Processing Time",
    value: "2.3 min",
    change: "-0.5 min improvement",
    positive: true,
    gradient: "from-green-500/10 to-emerald-500/10",
    iconColor: "text-green-500",
    iconBg: "bg-green-500/10",
  },
]

export function DashboardSummary() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {summaryCards.map((card) => {
        const Icon = card.icon
        return (
          <Card 
            key={card.label} 
            className={cn(
              "p-5 hover:shadow-xl transition-all duration-300 border-border/50",
              "hover:border-primary/50 hover:-translate-y-1",
              "bg-gradient-to-br", card.gradient
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <p className="text-3xl font-bold text-foreground tracking-tight">{card.value}</p>
                <p className={cn(
                  "text-xs font-medium",
                  card.positive ? "text-green-500" : "text-orange-500"
                )}>
                  {card.change}
                </p>
              </div>
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center",
                "transition-transform duration-300 hover:scale-110",
                card.iconBg
              )}>
                <Icon className={cn("w-7 h-7", card.iconColor)} />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
