"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, FileDown, Eye, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const historyData = [
  {
    id: 1,
    plate: "Б1234АВ",
    time: "2024-01-15 14:32:15",
    driver: "Батмөнх Дорж",
    cargo: "Steel Pipes",
    weight: "24.5 т",
    status: "verified",
  },
  {
    id: 2,
    plate: "У5678ГД",
    time: "2024-01-15 14:18:42",
    driver: "Энхбат Түвшин",
    cargo: "Construction Materials",
    weight: "18.2 т",
    status: "verified",
  },
  {
    id: 3,
    plate: "UNKNOWN",
    time: "2024-01-15 14:05:23",
    driver: "N/A",
    cargo: "Unknown",
    weight: "15.3 т",
    status: "unrecognized",
  },
  {
    id: 4,
    plate: "М9012ЕЖ",
    time: "2024-01-15 13:47:11",
    driver: "Ганбат Өлзий",
    cargo: "Food Products",
    weight: "12.8 т",
    status: "pending",
  },
  {
    id: 5,
    plate: "А3456ЗИ",
    time: "2024-01-15 13:22:55",
    driver: "Сүхбат Болд",
    cargo: "Textiles",
    weight: "9.4 т",
    status: "verified",
  },
  {
    id: 6,
    plate: "Х7890ЙК",
    time: "2024-01-15 12:58:30",
    driver: "Төмөр Бат",
    cargo: "Electronics",
    weight: "7.6 т",
    status: "verified",
  },
]

export function HistoryTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredData = historyData.filter(
    (item) =>
      item.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.cargo.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="flex-1 min-w-[280px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by plate, driver, or cargo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
        <Button className="gap-2">
          <FileDown className="w-4 h-4" />
          Export All
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">License Plate</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Timestamp</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Driver</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Cargo</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Weight</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Status</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row) => (
              <tr key={row.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="py-4 px-4">
                  <span className="font-mono font-semibold text-foreground">{row.plate}</span>
                </td>
                <td className="py-4 px-4 text-sm text-muted-foreground">{row.time}</td>
                <td className="py-4 px-4 text-sm text-foreground">{row.driver}</td>
                <td className="py-4 px-4 text-sm text-foreground">{row.cargo}</td>
                <td className="py-4 px-4 text-sm font-semibold text-foreground">{row.weight}</td>
                <td className="py-4 px-4">
                  <Badge
                    variant={
                      row.status === "verified"
                        ? "default"
                        : row.status === "unrecognized"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {row.status}
                  </Badge>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button size="sm" variant="ghost" className="gap-1">
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                    <Button size="sm" variant="ghost" className="gap-1">
                      <FileDown className="w-4 h-4" />
                      PDF
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No records found matching your search</p>
        </div>
      )}

      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-muted-foreground">
          Showing {filteredData.length} of {historyData.length} records
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-foreground px-3">Page {currentPage}</span>
          <Button size="sm" variant="outline" onClick={() => setCurrentPage((p) => p + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
