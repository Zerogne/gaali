"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, FileDown, Eye, Filter, ChevronLeft, ChevronRight, Edit } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { EditLogDialog } from "@/components/history/EditLogDialog"
import { exportLogToPDF } from "@/lib/pdf-export"
import type { TruckLog } from "@/lib/types"

interface HistoryTableProps {
  logs: TruckLog[]
  onUpdate?: () => void
}

export function HistoryTable({ logs, onUpdate }: HistoryTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [editingLog, setEditingLog] = useState<TruckLog | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const itemsPerPage = 10

  const handleEdit = (log: TruckLog) => {
    setEditingLog(log)
    setIsEditDialogOpen(true)
  }

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false)
    setEditingLog(null)
    if (onUpdate) {
      onUpdate()
    }
  }

  // Filter logs based on search query
  const filteredData = useMemo(() => {
    return logs.filter(
      (log) =>
        log.plate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.driverName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.cargoType?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [logs, searchQuery])

  // Paginate filtered data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredData.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredData, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  // Format weight for display
  const formatWeight = (weight?: number) => {
    if (!weight) return "—"
    return `${weight.toLocaleString()} kg`
  }

  // Get status badge variant
  const getStatusVariant = (log: TruckLog) => {
    if (log.sentToCustoms) return "default"
    return "secondary"
  }

  // Get status text
  const getStatusText = (log: TruckLog) => {
    if (log.sentToCustoms) return "Sent to Customs"
    return "Saved"
  }

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
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <p className="text-muted-foreground">No records found matching your search</p>
                </td>
              </tr>
            ) : (
              paginatedData.map((log) => (
                <tr key={log.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-4">
                    <span className="font-mono font-semibold text-foreground">{log.plate || "—"}</span>
                  </td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">
                    {log.createdAt ? formatDate(log.createdAt) : "—"}
                  </td>
                  <td className="py-4 px-4 text-sm text-foreground">{log.driverName || "—"}</td>
                  <td className="py-4 px-4 text-sm text-foreground">{log.cargoType || "—"}</td>
                  <td className="py-4 px-4 text-sm font-semibold text-foreground">
                    {formatWeight(log.weightKg)}
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={getStatusVariant(log)}>
                      {getStatusText(log)}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1"
                        onClick={() => handleEdit(log)}
                        disabled={log.sentToCustoms}
                        title={log.sentToCustoms ? "Cannot edit logs sent to customs" : "Edit log"}
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="gap-1">
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1"
                        onClick={async () => {
                          try {
                            await exportLogToPDF(log)
                          } catch (error) {
                            console.error("Error exporting PDF:", error)
                          }
                        }}
                        title="Export to PDF"
                      >
                        <FileDown className="w-4 h-4" />
                        PDF
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-muted-foreground">
          Showing {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{" "}
          {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} records
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
          <span className="text-sm text-foreground px-3">
            Page {currentPage} of {totalPages || 1}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <EditLogDialog
        log={editingLog}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={handleEditSuccess}
      />
    </Card>
  )
}
