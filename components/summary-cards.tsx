"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Truck, AlertCircle, Send, Clock } from "lucide-react"
interface SummaryCard { title: string; value: string | number; trend?: string; icon: React.ComponentType<{ className?: string }>; trendPositive?: boolean }
const summaryData: SummaryCard[] = [{ title: "Total Trucks Today", value: 47, trend: "+12 from yesterday", icon: Truck, trendPositive: true }, { title: "Alerts", value: 3, trend: "2 require attention", icon: AlertCircle, trendPositive: false }, { title: "Pending Sends", value: 8, trend: "Awaiting customs", icon: Send, trendPositive: false }, { title: "Avg Processing Time", value: "2.4 min", trend: "-0.3 min improvement", icon: Clock, trendPositive: true }]
export function SummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {summaryData.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title} className="shadow-md hover:shadow-lg transition-shadow duration-200 border-border/50 bg-gradient-to-br from-card to-card/95">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">{card.title}</p>
                  <p className="text-3xl font-bold text-foreground mb-2 tracking-tight">{card.value}</p>
                  {card.trend && <p className={`text-xs font-medium ${card.trendPositive ? "text-success" : "text-muted-foreground"}`}>{card.trend}</p>}
                </div>
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10 ml-4 flex-shrink-0">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
