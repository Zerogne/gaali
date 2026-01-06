"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { printLog } from "@/lib/pdf-export";
import type { Direction, TruckLog, TransportCompany } from "@/lib/types";
import { Edit, FileDown, Search, ArrowRight, X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditLogDialog } from "@/components/history/EditLogDialog";

interface TruckTableProps {
  logs: TruckLog[];
  onSend: (logId: string) => void;
  onUpdate?: () => void;
}

export function TruckTable({ logs, onSend, onUpdate }: TruckTableProps) {
  const { toast } = useToast();
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());
  const [uniqueCodes, setUniqueCodes] = useState<Map<string, string>>(new Map());
  const [transportCompanies, setTransportCompanies] = useState<TransportCompany[]>([]);
  const [directionFilter, setDirectionFilter] = useState<Direction | "ALL">("ALL");
  const [plateSearch, setPlateSearch] = useState("");
  const [driverSearch, setDriverSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [companyFilter, setCompanyFilter] = useState<string>("ALL");
  const [editingLog, setEditingLog] = useState<TruckLog | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEdit = (log: TruckLog) => {
    setEditingLog(log);
    setIsEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setEditingLog(null);
  };

  const handleEditSave = () => {
    handleEditDialogClose();
    if (onUpdate) {
      onUpdate();
    }
  };

  // Helper function to get transport company name
  const getTransportCompanyName = (companyId?: string): string => {
    if (!companyId) return "—";
    const company = transportCompanies.find((c) => c.id === companyId);
    return company?.name || "—";
  };

  // Filter and display logs based on search filters
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
      toDate.setHours(23, 59, 59, 999); // End of day
      result = result.filter((log) => {
        const logDate = new Date(log.createdAt);
        return logDate <= toDate;
      });
    }
    
    // Sort by date (newest first) and limit to 50
    return result
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50);
  }, [logs, directionFilter, plateSearch, driverSearch, companyFilter, dateFrom, dateTo]);
  
  const clearFilters = () => {
    setDirectionFilter("ALL");
    setPlateSearch("");
    setDriverSearch("");
    setDateFrom("");
    setDateTo("");
    setCompanyFilter("ALL");
  };

  const inCount = filteredLogs.filter((log) => log.direction === "IN").length;
  const outCount = filteredLogs.filter((log) => log.direction === "OUT").length;

  const handleResend = async (log: TruckLog) => {
    setSendingIds((prev) => new Set(prev).add(log.id));
    try {
      const result = await sendTruckLogToCustoms(log.id);

      if (result.success) {
        onSend(log.id);
        toast({
          title: "Амжилттай",
          description: "Мэдээлэл Монголын гаальд амжилттай илгээгдлээ",
        });
      } else {
        toast({
          title: "Алдаа",
          description: result.error || "Гаальд илгээхэд алдаа гарлаа",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Алдаа",
        description: "Гаальд илгээхэд алдаа гарлаа",
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
    const codesMap = new Map<string, string>()
    
    await Promise.all(
      logsToFetch.map(async (log) => {
        try {
          const sessionsResponse = await fetch(
            `/api/truck-sessions?direction=${log.direction}&plateNumber=${encodeURIComponent(log.plate)}&limit=100`
          )

          if (sessionsResponse.ok) {
            const sessionsData = await sessionsResponse.json()
            
            if (sessionsData.sessions && sessionsData.sessions.length > 0) {
              const logDate = new Date(log.createdAt)
              
              const sortedSessions = sessionsData.sessions
                .map((s: any) => ({
                  ...s,
                  timeDiff: Math.abs(new Date(s.createdAt).getTime() - logDate.getTime())
                }))
                .sort((a: any, b: any) => a.timeDiff - b.timeDiff)
              
              const session = sortedSessions.find((s: any) => s.timeDiff < 24 * 60 * 60 * 1000) 
                || sortedSessions[0]

              if (session?.uniqueCode) {
                codesMap.set(log.id, session.uniqueCode)
              }
            }
          }
        } catch (error) {
          console.error(`❌ Error fetching unique code for log ${log.id}:`, error)
        }
      })
    )
    
    setUniqueCodes(codesMap)
  }

  // Fetch transport companies
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

  // Fetch unique codes when logs change
  useEffect(() => {
    if (logs.length > 0) {
      fetchUniqueCodesForLogs(logs).catch(console.error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs])

  // Helper function to format from/to
  const formatFromTo = (origin?: string, destination?: string): string => {
    if (!origin && !destination) return "—";
    if (!origin) return `→ ${destination}`;
    if (!destination) return `${origin} →`;
    return `${origin} → ${destination}`;
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
    <Card className="border-gray-200 bg-white shadow-sm min-h-[700px] flex flex-col">
      <CardHeader className="pb-1 flex-shrink-0 px-4 pt-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900">
            Тээврийн хэрэгслийн түүх, хайлт
          </CardTitle>
          
        </div>
      </CardHeader>
      <Separator className="flex-shrink-0" />
      <CardContent className="pt-1.5 flex-1 min-h-[550px] overflow-hidden flex flex-col px-4 pb-3">
        {/* Filters Section */}
        <div className="space-y-2 mb-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200 flex-shrink-0">
          

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
        
        {filteredLogs.length === 0 ? (
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
                    <TableHead className="text-gray-700 font-semibold text-xs relative pr-3">
                      Засах
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold text-xs">
                      Хэвлэх
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow 
                      key={log.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onDoubleClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log("🖱️ Double-clicked on log:", log.id)
                        handleEdit(log)
                      }}
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
                            // Show "гарсан" (OUT) only if:
                            // 1. Direction is explicitly OUT, OR
                            // 2. Direction is IN but has netWeightKg (merged log with OUT data)
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
                      <TableCell className="relative pr-3">
                        <Button
                          size="default"
                          variant="outline"
                          onClick={() => handleEdit(log)}
                          title={
                            log.sentToCustoms
                              ? "Бүртгэлийг засах"
                              : "Бүртгэл засах"
                          }
                          className="border-gray-300 hover:bg-gray-50 h-8 px-3 text-xs"
                        >
                          <Edit className="w-3 h-3 mr-1.5" />
                          Засах
                        </Button>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="default"
                          variant="outline"
                          onClick={async () => {
                            try {
                              await printLog(log);
                            } catch (error) {
                              console.error("Error printing:", error);
                              toast({
                                title: "Алдаа",
                                description: error instanceof Error ? error.message : "Хэвлэхэд алдаа гарлаа",
                                variant: "destructive",
                              });
                            }
                          }}
                          title="Хэвлэх"
                          className="border-gray-300 hover:bg-gray-50 h-8 px-3 text-xs"
                        >
                          <FileDown className="w-3 h-3 mr-1.5" />
                          Хэвлэх
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
      <EditLogDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        log={editingLog}
        onSave={handleEditSave}
      />
    </Card>
  );
}
