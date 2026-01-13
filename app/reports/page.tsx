"use client";

import { useState, useEffect, useMemo } from "react";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getTruckLogs } from "@/lib/api";
import type { TruckLog, Direction, TransportCompany } from "@/lib/types";
import * as XLSX from "xlsx";

export default function ReportsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<TruckLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transportCompanies, setTransportCompanies] = useState<TransportCompany[]>([]);
  const [uniqueCodes, setUniqueCodes] = useState<Map<string, string>>(new Map());
  
  // Filters
  const [directionFilter, setDirectionFilter] = useState<Direction | "ALL">("ALL");
  const [plateSearch, setPlateSearch] = useState("");
  const [driverSearch, setDriverSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [companyFilter, setCompanyFilter] = useState<string>("ALL");

  // Load logs
  useEffect(() => {
    async function loadLogs() {
      try {
        setIsLoading(true);
        const result = await getTruckLogs(1, 10000); // Get all logs for reports
        setLogs(result.logs);
      } catch (error) {
        console.error("Error loading logs:", error);
        toast({
          title: "Алдаа",
          description: "Тайлан ачаалахад алдаа гарлаа",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadLogs();
  }, [toast]);

  // Load transport companies
  useEffect(() => {
    async function fetchTransportCompanies() {
      try {
        const response = await fetch("/api/transport-companies");
        if (response.ok) {
          const companies = await response.json();
          setTransportCompanies(companies);
        }
      } catch (error) {
        console.error("Error fetching transport companies:", error);
      }
    }
    fetchTransportCompanies();
  }, []);

  // Fetch unique codes for logs
  useEffect(() => {
    async function fetchUniqueCodesForLogs(logsToFetch: TruckLog[]) {
      const codesMap = new Map<string, string>();
      
      await Promise.all(
        logsToFetch.map(async (log) => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const sessionsResponse = await fetch(
              `/api/truck-sessions?direction=${log.direction}&plateNumber=${encodeURIComponent(log.plate)}&limit=100`,
              {
                signal: controller.signal,
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );

            clearTimeout(timeoutId);

            if (sessionsResponse.ok) {
              const sessionsData = await sessionsResponse.json();
              
              if (sessionsData.sessions && sessionsData.sessions.length > 0) {
                const logDate = new Date(log.createdAt);
                
                const sortedSessions = sessionsData.sessions
                  .map((s: any) => ({
                    ...s,
                    timeDiff: Math.abs(new Date(s.createdAt).getTime() - logDate.getTime())
                  }))
                  .sort((a: any, b: any) => a.timeDiff - b.timeDiff);
                
                const session = sortedSessions.find((s: any) => s.timeDiff < 24 * 60 * 60 * 1000) 
                  || sortedSessions[0];

                if (session?.uniqueCode) {
                  codesMap.set(log.id, session.uniqueCode);
                }
              }
            } else {
              // Only log if it's not a 404 (session might not exist, which is fine)
              if (sessionsResponse.status !== 404) {
                console.warn(`⚠️ Failed to fetch unique code for log ${log.id}: HTTP ${sessionsResponse.status}`);
              }
            }
          } catch (error) {
            // Only log if it's not an abort error (timeout) or network error
            if (error instanceof Error) {
              if (error.name === 'AbortError') {
                // Timeout - silently skip
                return;
              }
              if (error.message.includes('Failed to fetch')) {
                // Network error - silently skip (might be offline or CORS issue)
                return;
              }
            }
            // Only log unexpected errors
            console.warn(`⚠️ Error fetching unique code for log ${log.id}:`, error instanceof Error ? error.message : String(error));
          }
        })
      );
      
      setUniqueCodes(codesMap);
    }

    if (logs.length > 0) {
      fetchUniqueCodesForLogs(logs).catch(console.error);
    }
  }, [logs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    let result = [...logs];
    
    // Direction filter
    if (directionFilter !== "ALL") {
      result = result.filter((log) => log.direction === directionFilter);
    }
    
    // Plate search
    if (plateSearch.trim()) {
      const query = plateSearch.toLowerCase().trim();
      result = result.filter((log) => 
        log.plate.toLowerCase().includes(query)
      );
    }
    
    // Driver search
    if (driverSearch.trim()) {
      const query = driverSearch.toLowerCase().trim();
      result = result.filter((log) => 
        log.driverName?.toLowerCase().includes(query)
      );
    }
    
    // Company filter
    if (companyFilter !== "ALL") {
      result = result.filter((log) => log.transportCompanyId === companyFilter);
    }
    
    // Date filters
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      result = result.filter((log) => {
        const logDate = new Date(log.createdAt);
        return logDate >= fromDate;
      });
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter((log) => {
        const logDate = new Date(log.createdAt);
        return logDate <= toDate;
      });
    }
    
    // Sort by date (newest first)
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [logs, directionFilter, plateSearch, driverSearch, companyFilter, dateFrom, dateTo]);

  const clearFilters = () => {
    setDirectionFilter("ALL");
    setPlateSearch("");
    setDriverSearch("");
    setDateFrom("");
    setDateTo("");
    setCompanyFilter("ALL");
  };

  // Helper function to get transport company name
  const getTransportCompanyName = (companyId?: string): string => {
    if (!companyId) return "—";
    const company = transportCompanies.find((c) => c.id === companyId);
    return company?.name || "—";
  };

  // Export to Excel
  const handleExportToExcel = () => {
    try {
      // Prepare data for Excel
      const excelData = filteredLogs.map((log) => ({
        "Дугаар": uniqueCodes.get(log.id) || "—",
        "Улсын дугаар": log.plate,
        "Чиргүүл": log.trailerPlate || "—",
        "Жолооч": log.driverName || "—",
        "Бүтээгдхүүн": log.cargoType || "—",
        "Тээврийн компани": getTransportCompanyName(log.transportCompanyId),
        "Чиглэл": (log.direction === "OUT") || (log.direction === "IN" && log.netWeightKg !== undefined && log.netWeightKg !== null) ? "гарсан" : "орсон",
        "Төлөв": log.sentToCustoms ? "илгээгдсэн" : "илгээгдээгүй",
        "Жин (кг)": log.weightKg || "—",
        "Цэвэр жин (кг)": log.netWeightKg || "—",
        "Гарал": log.origin || "—",
        "Хаялга": log.destination || "—",
        "Илгээч": log.senderOrganization || "—",
        "Хүлээн авагч": log.receiverOrganization || "—",
        "Огноо": new Date(log.createdAt).toLocaleString("mn-MN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Тайлан");

      // Generate filename with date range
      const dateStr = dateFrom && dateTo 
        ? `${dateFrom}_${dateTo}`
        : new Date().toISOString().split("T")[0];
      const filename = `Тайлан_${dateStr}.xlsx`;

      // Download
      XLSX.writeFile(wb, filename);

      toast({
        title: "Амжилттай",
        description: `${filteredLogs.length} бүртгэл Excel файлд экспорт хийгдлээ`,
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast({
        title: "Алдаа",
        description: "Excel файл үүсгэхэд алдаа гарлаа",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("mn-MN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto min-w-0">
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Тайлан
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Тээврийн бүртгэлийн тайлан үүсгэх, харах
              </p>
            </div>

            <Card className="border-gray-200 bg-white shadow-sm min-h-[700px] flex flex-col">
              <CardHeader className="pb-1 flex-shrink-0 px-4 pt-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-gray-900">
                    Тээврийн хэрэгслийн тайлан
                  </CardTitle>
                  <Button
                    onClick={handleExportToExcel}
                    disabled={isLoading || filteredLogs.length === 0}
                    className="h-8 px-3 text-xs"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                        Уншиж байна...
                      </>
                    ) : (
                      <>
                        <Download className="w-3 h-3 mr-1.5" />
                        Excel татах ({filteredLogs.length})
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <Separator className="flex-shrink-0" />
              <CardContent className="pt-1.5 flex-1 min-h-[550px] overflow-hidden flex flex-col px-4 pb-3">
                {/* Filters Section */}
                <div className="space-y-2 mb-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200 flex-shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    
                    
                    {(directionFilter !== "ALL" || plateSearch || driverSearch || dateFrom || dateTo || companyFilter !== "ALL") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-6 px-2 text-xs"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Цэвэрлэх
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                    {/* Direction Filter */}
                    <div>
                      <Label htmlFor="direction" className="text-xs font-medium text-gray-700 mb-0.5">
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
                      <Label htmlFor="plate" className="text-xs font-medium text-gray-700 mb-0.5">
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
                      <Label htmlFor="driver" className="text-xs font-medium text-gray-700 mb-0.5">
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

                    {/* Company Filter */}
                    <div>
                      <Label htmlFor="company" className="text-xs font-medium text-gray-700 mb-0.5">
                        Тээврийн компани
                      </Label>
                      <Select
                        value={companyFilter}
                        onValueChange={(value) => setCompanyFilter(value)}
                      >
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">Бүх компани</SelectItem>
                          {transportCompanies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date From */}
                    <div>
                      <Label htmlFor="dateFrom" className="text-xs font-medium text-gray-700 mb-0.5">
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
                      <Label htmlFor="dateTo" className="text-xs font-medium text-gray-700 mb-0.5">
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
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : filteredLogs.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-base font-medium mb-1">
                      Тээврийн хэрэгслийн бүртгэл олдсонгүй
                    </p>
                    <p className="text-sm text-gray-400">
                      Хайлтын үр дүнд тохирох бүртгэл байхгүй байна. Шүүлтийг өөрчлөх
                      эсвэл хайлтын үгсийг өөрчлөн үзнэ үү.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col h-full min-h-0">
                    <div className="flex items-center justify-between flex-shrink-0 mb-1.5">
                      <div className="text-xs text-gray-600">
                        Нийт: <span className="font-semibold">{filteredLogs.length}</span> бүртгэл
                      </div>
                    </div>
                    <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-gray-200">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="text-gray-700 font-semibold text-xs relative pr-3">
                              Дугаар
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                            </TableHead>
                            <TableHead className="text-gray-700 font-semibold text-xs relative pr-3">
                              Улсын дугаар
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                            </TableHead>
                            <TableHead className="text-gray-700 font-semibold text-xs relative pr-3">
                              Чиргүүл
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                            </TableHead>
                            <TableHead className="text-gray-700 font-semibold text-xs relative pr-3">
                              Жолооч
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                            </TableHead>
                            <TableHead className="text-gray-700 font-semibold text-xs relative pr-3">
                              Бүтээгдхүүн
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                            </TableHead>
                            <TableHead className="text-gray-700 font-semibold text-xs relative pr-3">
                              Тээврийн компани
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                            </TableHead>
                            <TableHead className="text-gray-700 font-semibold text-xs relative pr-3">
                              Чиглэл
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                            </TableHead>
                            <TableHead className="text-gray-700 font-semibold text-xs relative pr-3">
                              Төлөв
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                            </TableHead>
                            <TableHead className="text-gray-700 font-semibold text-xs">
                              Огноо
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredLogs.map((log) => (
                            <TableRow 
                              key={log.id} 
                              className="hover:bg-gray-50"
                            >
                              <TableCell className="text-gray-700 font-mono text-xs relative pr-3">
                                {uniqueCodes.get(log.id) || "—"}
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                              </TableCell>
                              <TableCell className="font-mono font-semibold text-gray-900 text-xs relative pr-3">
                                {log.plate}
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                              </TableCell>
                              <TableCell className="text-gray-700 font-mono text-xs relative pr-3">
                                {log.trailerPlate || "—"}
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                              </TableCell>
                              <TableCell className="text-gray-700 text-xs relative pr-3">
                                {log.driverName}
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                              </TableCell>
                              <TableCell className="text-gray-700 text-xs relative pr-3">
                                {log.cargoType || "—"}
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                              </TableCell>
                              <TableCell className="text-gray-700 text-xs relative pr-3">
                                {getTransportCompanyName(log.transportCompanyId)}
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                              </TableCell>
                              <TableCell className="relative pr-3">
                                <Badge
                                  variant="outline"
                                  className={
                                    (log.direction === "OUT") || (log.direction === "IN" && log.netWeightKg !== undefined && log.netWeightKg !== null)
                                      ? "bg-green-50 text-green-700 border-green-200 text-xs"
                                      : "bg-blue-50 text-blue-700 border-blue-200 text-xs"
                                  }
                                >
                                  {(log.direction === "OUT") || (log.direction === "IN" && log.netWeightKg !== undefined && log.netWeightKg !== null) ? "гарсан" : "орсон"}
                                </Badge>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                              </TableCell>
                              <TableCell className="relative pr-3">
                                <span className={`text-xs font-medium ${
                                  log.sentToCustoms 
                                    ? "text-green-600" 
                                    : "text-gray-500"
                                }`}>
                                  {log.sentToCustoms ? "илгээгдсэн" : "илгээгдээгүй"}
                                </span>
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                              </TableCell>
                              <TableCell className="text-gray-700 text-xs">
                                {formatDate(log.createdAt)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
