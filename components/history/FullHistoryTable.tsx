"use client";

import { EditLogDialog } from "@/components/history/EditLogDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { sendTruckLogToCustoms } from "@/lib/api";
import { exportLogToPDF } from "@/lib/pdf-export";
import type { Direction, TruckLog } from "@/lib/types";
import { Edit, FileDown, Search, Send, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";

interface FullHistoryTableProps {
  logs: TruckLog[];
  onSend: (logId: string) => void;
  onUpdate?: () => void;
}

export function FullHistoryTable({ logs, onSend, onUpdate }: FullHistoryTableProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());
  const [editingLog, setEditingLog] = useState<TruckLog | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [uniqueCodes, setUniqueCodes] = useState<Map<string, string>>(new Map());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Filter states
  const [directionFilter, setDirectionFilter] = useState<Direction | "ALL">("ALL");
  const [plateSearch, setPlateSearch] = useState("");
  const [driverSearch, setDriverSearch] = useState("");
  const [cargoSearch, setCargoSearch] = useState("");
  const [originSearch, setOriginSearch] = useState("");
  const [destinationSearch, setDestinationSearch] = useState("");
  const [weightMin, setWeightMin] = useState("");
  const [weightMax, setWeightMax] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sentToCustomsFilter, setSentToCustomsFilter] = useState<"ALL" | "true" | "false">("ALL");

  const handleEdit = (log: TruckLog) => {
    setEditingLog(log);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingLog(null);
    if (onUpdate) {
      onUpdate();
    }
  };

  // Filter logs based on all filter criteria
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Direction filter
      if (directionFilter !== "ALL" && log.direction !== directionFilter) {
        return false;
      }

      // Plate search
      if (plateSearch && !log.plate.toLowerCase().includes(plateSearch.toLowerCase())) {
        return false;
      }

      // Driver search
      if (driverSearch && !log.driverName?.toLowerCase().includes(driverSearch.toLowerCase())) {
        return false;
      }

      // Cargo type search
      if (cargoSearch && !log.cargoType?.toLowerCase().includes(cargoSearch.toLowerCase())) {
        return false;
      }

      // Origin search
      if (originSearch && !log.origin?.toLowerCase().includes(originSearch.toLowerCase())) {
        return false;
      }

      // Destination search
      if (destinationSearch && !log.destination?.toLowerCase().includes(destinationSearch.toLowerCase())) {
        return false;
      }

      // Weight filters
      if (weightMin && (!log.weightKg || log.weightKg < parseFloat(weightMin))) {
        return false;
      }
      if (weightMax && (!log.weightKg || log.weightKg > parseFloat(weightMax))) {
        return false;
      }

      // Date filters
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        const logDate = new Date(log.createdAt);
        if (logDate < fromDate) {
          return false;
        }
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        const logDate = new Date(log.createdAt);
        if (logDate > toDate) {
          return false;
        }
      }

      // Sent to customs filter
      if (sentToCustomsFilter !== "ALL") {
        const isSent = sentToCustomsFilter === "true";
        if (log.sentToCustoms !== isSent) {
          return false;
        }
      }

      return true;
    });
  }, [
    logs,
    directionFilter,
    plateSearch,
    driverSearch,
    cargoSearch,
    originSearch,
    destinationSearch,
    weightMin,
    weightMax,
    dateFrom,
    dateTo,
    sentToCustomsFilter,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [
    directionFilter,
    plateSearch,
    driverSearch,
    cargoSearch,
    originSearch,
    destinationSearch,
    weightMin,
    weightMax,
    dateFrom,
    dateTo,
    sentToCustomsFilter,
  ]);

  const handleResend = async (log: TruckLog) => {
    setSendingIds((prev) => new Set(prev).add(log.id));
    try {
      const result = await sendTruckLogToCustoms(log.id);

      if (result.success) {
        onSend(log.id);
        toast({
          title: "Амжилттай",
          description: "Мэдээлэл Монголын гаалинд амжилттай илгээгдлээ",
        });
      } else {
        toast({
          title: "Алдаа",
          description: result.error || "Гаалинд илгээхэд алдаа гарлаа",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Алдаа",
        description: "Гаалинд илгээхэд алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setSendingIds((prev) => {
        const next = new Set(prev);
        next.delete(log.id);
        return next;
      });
    }
  };

  // Fetch unique codes for logs
  const fetchUniqueCodesForLogs = async (logsToFetch: TruckLog[]) => {
    const codesMap = new Map<string, string>();

    await Promise.all(
      logsToFetch.map(async (log) => {
        try {
          const sessionsResponse = await fetch(
            `/api/truck-sessions?direction=${log.direction}&plateNumber=${encodeURIComponent(log.plate)}&limit=100`
          );

          if (sessionsResponse.ok) {
            const sessionsData = await sessionsResponse.json();

            if (sessionsData.sessions && sessionsData.sessions.length > 0) {
              const logDate = new Date(log.createdAt);

              const sortedSessions = sessionsData.sessions
                .map((s: any) => ({
                  ...s,
                  timeDiff: Math.abs(new Date(s.createdAt).getTime() - logDate.getTime()),
                }))
                .sort((a: any, b: any) => a.timeDiff - b.timeDiff);

              const session =
                sortedSessions.find((s: any) => s.timeDiff < 24 * 60 * 60 * 1000) ||
                sortedSessions[0];

              if (session?.uniqueCode) {
                codesMap.set(log.id, session.uniqueCode);
              }
            }
          }
        } catch (error) {
          console.error(`❌ Error fetching unique code for log ${log.id}:`, error);
        }
      })
    );

    setUniqueCodes(codesMap);
  };

  // Fetch unique codes when logs change
  useEffect(() => {
    if (paginatedLogs.length > 0) {
      fetchUniqueCodesForLogs(paginatedLogs).catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginatedLogs]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("mn-MN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const clearFilters = () => {
    setDirectionFilter("ALL");
    setPlateSearch("");
    setDriverSearch("");
    setCargoSearch("");
    setOriginSearch("");
    setDestinationSearch("");
    setWeightMin("");
    setWeightMax("");
    setDateFrom("");
    setDateTo("");
    setSentToCustomsFilter("ALL");
  };

  const inCount = filteredLogs.filter((log) => log.direction === "IN").length;
  const outCount = filteredLogs.filter((log) => log.direction === "OUT").length;

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-900">
            Бүрэн түүх
          </CardTitle>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            Буцах
          </Button>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        {/* Filters Section */}
        <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Search className="w-4 h-4" />
              Хайлт ба шүүлт
            </h3>
            <Button
              onClick={clearFilters}
              variant="ghost"
              size="sm"
              className="gap-2 text-xs"
            >
              <X className="w-3 h-3" />
              Цэвэрлэх
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Direction Filter */}
            <div>
              <Label htmlFor="direction" className="text-xs font-medium text-gray-700 mb-1">
                Чиглэл
              </Label>
              <Select
                value={directionFilter}
                onValueChange={(value) => setDirectionFilter(value as Direction | "ALL")}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Бүх чиглэл</SelectItem>
                  <SelectItem value="IN">ОРОХ</SelectItem>
                  <SelectItem value="OUT">ГАРАХ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Plate Search */}
            <div>
              <Label htmlFor="plate" className="text-xs font-medium text-gray-700 mb-1">
                Улсын дугаар
              </Label>
              <Input
                id="plate"
                placeholder="Хайх..."
                value={plateSearch}
                onChange={(e) => setPlateSearch(e.target.value)}
                className="bg-white"
              />
            </div>

            {/* Driver Search */}
            <div>
              <Label htmlFor="driver" className="text-xs font-medium text-gray-700 mb-1">
                Жолооч
              </Label>
              <Input
                id="driver"
                placeholder="Хайх..."
                value={driverSearch}
                onChange={(e) => setDriverSearch(e.target.value)}
                className="bg-white"
              />
            </div>

            {/* Cargo Search */}
            <div>
              <Label htmlFor="cargo" className="text-xs font-medium text-gray-700 mb-1">
                Бүтээгдэхүүн
              </Label>
              <Input
                id="cargo"
                placeholder="Хайх..."
                value={cargoSearch}
                onChange={(e) => setCargoSearch(e.target.value)}
                className="bg-white"
              />
            </div>

            {/* Origin Search */}
            <div>
              <Label htmlFor="origin" className="text-xs font-medium text-gray-700 mb-1">
                Хаанаас
              </Label>
              <Input
                id="origin"
                placeholder="Хайх..."
                value={originSearch}
                onChange={(e) => setOriginSearch(e.target.value)}
                className="bg-white"
              />
            </div>

            {/* Destination Search */}
            <div>
              <Label htmlFor="destination" className="text-xs font-medium text-gray-700 mb-1">
                Хаашаа
              </Label>
              <Input
                id="destination"
                placeholder="Хайх..."
                value={destinationSearch}
                onChange={(e) => setDestinationSearch(e.target.value)}
                className="bg-white"
              />
            </div>

            {/* Weight Min */}
            <div>
              <Label htmlFor="weightMin" className="text-xs font-medium text-gray-700 mb-1">
                Жин (мин, кг)
              </Label>
              <Input
                id="weightMin"
                type="number"
                placeholder="0"
                value={weightMin}
                onChange={(e) => setWeightMin(e.target.value)}
                className="bg-white"
              />
            </div>

            {/* Weight Max */}
            <div>
              <Label htmlFor="weightMax" className="text-xs font-medium text-gray-700 mb-1">
                Жин (макс, кг)
              </Label>
              <Input
                id="weightMax"
                type="number"
                placeholder="∞"
                value={weightMax}
                onChange={(e) => setWeightMax(e.target.value)}
                className="bg-white"
              />
            </div>

            {/* Date From */}
            <div>
              <Label htmlFor="dateFrom" className="text-xs font-medium text-gray-700 mb-1">
                Эхлэх огноо
              </Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-white"
              />
            </div>

            {/* Date To */}
            <div>
              <Label htmlFor="dateTo" className="text-xs font-medium text-gray-700 mb-1">
                Дуусах огноо
              </Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-white"
              />
            </div>

            {/* Sent to Customs Filter */}
            <div>
              <Label htmlFor="sentToCustoms" className="text-xs font-medium text-gray-700 mb-1">
                Гаалинд илгээсэн
              </Label>
              <Select
                value={sentToCustomsFilter}
                onValueChange={(value) => setSentToCustomsFilter(value as "ALL" | "true" | "false")}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Бүгд</SelectItem>
                  <SelectItem value="true">Тийм</SelectItem>
                  <SelectItem value="false">Үгүй</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              Нийт бүртгэл: {filteredLogs.length}
            </span>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              IN: {inCount}
            </Badge>
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              OUT: {outCount}
            </Badge>
          </div>
        </div>

        {/* Table */}
        {paginatedLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-base font-medium mb-1">
              Бүртгэл олдсонгүй
            </p>
            <p className="text-sm text-gray-400">
              Хайлтын үр дүнд тохирох бүртгэл байхгүй байна.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-gray-700 font-semibold">Чиглэл</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Улсын дугаар</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Жолооч</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Бүтээгдэхүүн</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Жин (кг)</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Хаанаас</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Хаашаа</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Үүсгэсэн огноо</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Уникаль код</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Үйлдлүүд</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLogs.map((log) => (
                    <TableRow
                      key={log.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onDoubleClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEdit(log);
                      }}
                    >
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
                      <TableCell className="text-gray-700 capitalize">
                        {log.cargoType}
                      </TableCell>
                      <TableCell className="text-gray-700 font-medium">
                        {log.weightKg?.toLocaleString() || "N/A"}
                      </TableCell>
                      <TableCell className="text-gray-700 text-sm">
                        {log.origin || "—"}
                      </TableCell>
                      <TableCell className="text-gray-700 text-sm">
                        {log.destination || "—"}
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {formatDate(log.createdAt)}
                      </TableCell>
                      <TableCell className="font-mono font-semibold text-gray-900">
                        {uniqueCodes.get(log.id) || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(log)}
                            title={
                              log.sentToCustoms
                                ? "Бүртгэлийг дахин засах"
                                : "Бүртгэл засах"
                            }
                            className="border-gray-300 hover:bg-gray-50"
                          >
                            <Edit className="w-3.5 h-3.5 mr-1.5" />
                            {log.sentToCustoms ? "Дахин засах" : "Засах"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                await exportLogToPDF(log);
                              } catch (error) {
                                console.error("Error exporting PDF:", error);
                              }
                            }}
                            title="PDF файл татах"
                            className="border-gray-300 hover:bg-gray-50"
                          >
                            <FileDown className="w-3.5 h-3.5 mr-1.5" />
                            PDF
                          </Button>
                          {log.sentToCustoms ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResend(log)}
                              disabled={sendingIds.has(log.id)}
                              className="bg-green-400 text-white border-green-500 hover:bg-green-500 disabled:bg-green-200 disabled:text-white"
                              title="Гаалинд дахин илгээх"
                            >
                              {sendingIds.has(log.id) ? (
                                "Илгээж байна..."
                              ) : (
                                <>
                                  <Send className="w-3.5 h-3.5 mr-1.5" />
                                  Дахин илгээх
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResend(log)}
                              disabled={sendingIds.has(log.id)}
                              className="bg-green-500 text-white border-green-600 hover:bg-green-600 disabled:bg-green-300 disabled:text-white"
                              title="Гаалинд илгээх"
                            >
                              {sendingIds.has(log.id) ? (
                                "Илгээж байна..."
                              ) : (
                                <>
                                  <Send className="w-3.5 h-3.5 mr-1.5" />
                                  Илгээх
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  {startIndex + 1}-{Math.min(endIndex, filteredLogs.length)} / {filteredLogs.length}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-700">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      <EditLogDialog
        log={editingLog}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={handleEditSuccess}
      />
    </Card>
  );
}
