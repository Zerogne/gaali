"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Send, Search, Edit, FileDown } from "lucide-react"
import { EditLogDialog } from "@/components/history/EditLogDialog"
import { exportLogToPDF } from "@/lib/pdf-export"
import type { TruckLog, Direction } from "@/lib/types"
import { sendTruckLogToCustoms } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface TruckTableProps {
  logs: TruckLog[]
  onSend: (logId: string) => void
  onUpdate?: () => void
}

export function TruckTable({ logs, onSend, onUpdate }: TruckTableProps) {
  const { toast } = useToast()
  const [directionFilter, setDirectionFilter] = useState<Direction | "ALL">("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set())
  const [editingLog, setEditingLog] = useState<TruckLog | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

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

  const filteredLogs = logs.filter((log) => {
    const matchesDirection = directionFilter === "ALL" || log.direction === directionFilter
    const matchesSearch = searchQuery === "" || 
      log.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.driverName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesDirection && matchesSearch
  })

  const handleResend = async (log: TruckLog) => {
    if (log.sentToCustoms) return

    setSendingIds((prev) => new Set(prev).add(log.id))
    try {
      const result = await sendTruckLogToCustoms(log.id)
      
      if (result.success) {
        onSend(log.id)
        toast({
          title: "Success",
          description: "Data successfully sent to Mongolian Customs",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send to customs",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send to customs",
        variant: "destructive",
      })
    } finally {
      setSendingIds((prev) => {
        const next = new Set(prev)
        next.delete(log.id)
        return next
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="border-gray-200 bg-white">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Truck Log History</CardTitle>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by plate or driver name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-300 focus:bg-white focus:border-blue-500"
            />
          </div>
          <Select value={directionFilter} onValueChange={(value) => setDirectionFilter(value as Direction | "ALL")}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Directions</SelectItem>
              <SelectItem value="IN">IN Only</SelectItem>
              <SelectItem value="OUT">OUT Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No truck logs found</p>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-gray-700 font-semibold">Direction</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Plate</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Driver</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Бүтээгдэхүүн</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Weight (kg)</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Хаанаас</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Хаашаа</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Created At</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Status</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          log.direction === "IN"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-orange-50 text-orange-700 border-orange-200"
                        }
                      >
                        {log.direction}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono font-semibold text-gray-900">
                      {log.plate}
                    </TableCell>
                    <TableCell className="text-gray-700">{log.driverName}</TableCell>
                    <TableCell className="text-gray-700 capitalize">{log.cargoType}</TableCell>
                    <TableCell className="text-gray-700 font-medium">
                      {log.weightKg?.toLocaleString() || "N/A"}
                    </TableCell>
                    <TableCell className="text-gray-700 text-sm">
                      {log.origin || "—"}
                    </TableCell>
                    <TableCell className="text-gray-700 text-sm">
                      {log.destination || "—"}
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">{formatDate(log.createdAt)}</TableCell>
                    <TableCell>
                      {log.sentToCustoms ? (
                        <Badge className="bg-green-50 text-green-700 border-green-200">
                          Sent to Customs
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          Saved only
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(log)}
                          disabled={log.sentToCustoms}
                          title={log.sentToCustoms ? "Cannot edit logs sent to customs" : "Edit log"}
                          className="border-gray-300 hover:bg-gray-50"
                        >
                          <Edit className="w-3.5 h-3.5 mr-1.5" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              await exportLogToPDF(log)
                            } catch (error) {
                              console.error("Error exporting PDF:", error)
                            }
                          }}
                          title="Export to PDF"
                          className="border-gray-300 hover:bg-gray-50"
                        >
                          <FileDown className="w-3.5 h-3.5 mr-1.5" />
                          PDF
                        </Button>
                        {!log.sentToCustoms && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResend(log)}
                            disabled={sendingIds.has(log.id)}
                            className="border-gray-300 hover:bg-gray-50"
                          >
                            {sendingIds.has(log.id) ? (
                              "Sending..."
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5 mr-1.5" />
                                Resend
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <EditLogDialog
        log={editingLog}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={handleEditSuccess}
      />
    </Card>
  )
}

