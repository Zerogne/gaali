"use client"

import { Truck, AlertTriangle, FileText, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"

const summaryCards = [
  {
    icon: Truck,
    label: "Total Trucks Today",
    value: "47",
    change: "+12 from yesterday",
    positive: true,
    gradient: "from-blue-50 to-cyan-50",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    icon: AlertTriangle,
    label: "Alerts",
    value: "3",
    change: "2 unrecognized plates",
    positive: false,
    gradient: "from-orange-50 to-red-50",
    iconColor: "text-orange-600",
    iconBg: "bg-orange-100",
  },
  {
    icon: FileText,
    label: "Pending Reports",
    value: "8",
    change: "Requires review",
    positive: false,
    gradient: "from-amber-50 to-yellow-50",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-100",
  },
  {
    icon: TrendingUp,
    label: "Avg. Processing Time",
    value: "2.3 min",
    change: "-0.5 min improvement",
    positive: true,
    gradient: "from-green-50 to-emerald-50",
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
  },
]

export function SummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {summaryCards.map((card) => {
        const Icon = card.icon
        return (
          <Card 
            key={card.label} 
            className="p-5 hover:shadow-lg transition-all duration-300 border-gray-200 bg-white"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-gray-600">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 tracking-tight">{card.value}</p>
                <p className={`text-xs font-medium ${
                  card.positive ? "text-green-600" : "text-orange-600"
                }`}>
                  {card.change}
                </p>
              </div>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-300 hover:scale-110 ${card.iconBg}`}>
                <Icon className={`w-7 h-7 ${card.iconColor}`} />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

