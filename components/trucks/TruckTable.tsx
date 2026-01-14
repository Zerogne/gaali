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
import { exportLogToPDF, printLog } from "@/lib/pdf-export";
import type { Direction, TruckLog, TransportCompany } from "@/lib/types";
import { Edit, FileDown, Search, ArrowRight, X, Send, Trash2, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterableSelect } from "@/components/ui/filterable-select";
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
  const [productSearch, setProductSearch] = useState("");
  const [trailerSearch, setTrailerSearch] = useState("");
  const [contractSearch, setContractSearch] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [companyFilter, setCompanyFilter] = useState<string>("ALL");
  const [editingLog, setEditingLog] = useState<TruckLog | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedLogIds, setSelectedLogIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

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
    
    // Product search
    if (productSearch.trim()) {
      const query = productSearch.toLowerCase().trim();
      result = result.filter((log) => 
        log.cargoType?.toLowerCase().includes(query)
      );
    }
    
    // Trailer search
    if (trailerSearch.trim()) {
      const query = trailerSearch.toLowerCase().trim();
      result = result.filter((log) => 
        log.trailerPlate?.toLowerCase().includes(query)
      );
    }
    
    // Contract search (search in transport company contract)
    if (contractSearch.trim()) {
      const query = contractSearch.toLowerCase().trim();
      result = result.filter((log) => {
        if (!log.transportCompanyId) return false;
        const company = transportCompanies.find((c) => c.id === log.transportCompanyId);
        return company?.contract?.toLowerCase().includes(query);
      });
    }
    
    // Vehicle registration number search
    if (vehicleSearch.trim()) {
      const query = vehicleSearch.toLowerCase().trim();
      result = result.filter((log) => 
        log.vehicleRegistrationNumber?.toLowerCase().includes(query)
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
  }, [logs, directionFilter, plateSearch, driverSearch, productSearch, trailerSearch, contractSearch, vehicleSearch, companyFilter, dateFrom, dateTo, transportCompanies]);
  
  // Get unique driver names for FilterableSelect
  const uniqueDrivers = useMemo(() => {
    const driverSet = new Set<string>();
    logs.forEach((log) => {
      if (log.driverName && log.driverName.trim()) {
        driverSet.add(log.driverName.trim());
      }
    });
    return Array.from(driverSet).sort().map((name) => ({
      value: name,
      label: name,
    }));
  }, [logs]);

  // Get unique products for FilterableSelect
  const uniqueProducts = useMemo(() => {
    const productSet = new Set<string>();
    logs.forEach((log) => {
      if (log.cargoType && log.cargoType.trim()) {
        productSet.add(log.cargoType.trim());
      }
    });
    return Array.from(productSet).sort().map((name) => ({
      value: name,
      label: name,
    }));
  }, [logs]);

  // Get unique trailer plates for FilterableSelect
  const uniqueTrailers = useMemo(() => {
    const trailerSet = new Set<string>();
    logs.forEach((log) => {
      if (log.trailerPlate && log.trailerPlate.trim()) {
        trailerSet.add(log.trailerPlate.trim());
      }
    });
    return Array.from(trailerSet).sort().map((name) => ({
      value: name,
      label: name,
    }));
  }, [logs]);

  // Get unique contracts for FilterableSelect
  const uniqueContracts = useMemo(() => {
    const contractSet = new Set<string>();
    transportCompanies.forEach((company) => {
      if (company.contract && company.contract.trim()) {
        contractSet.add(company.contract.trim());
      }
    });
    return Array.from(contractSet).sort().map((name) => ({
      value: name,
      label: name,
    }));
  }, [transportCompanies]);

  // Get unique vehicle registration numbers for FilterableSelect
  const uniqueVehicles = useMemo(() => {
    const vehicleSet = new Set<string>();
    logs.forEach((log) => {
      if (log.vehicleRegistrationNumber && log.vehicleRegistrationNumber.trim()) {
        vehicleSet.add(log.vehicleRegistrationNumber.trim());
      }
    });
    return Array.from(vehicleSet).sort().map((name) => ({
      value: name,
      label: name,
    }));
  }, [logs]);
  
  const clearFilters = () => {
    setDirectionFilter("ALL");
    setPlateSearch("");
    setDriverSearch("");
    setProductSearch("");
    setTrailerSearch("");
    setContractSearch("");
    setVehicleSearch("");
    setDateFrom("");
    setDateTo("");
    setCompanyFilter("ALL");
  };

  const inCount = filteredLogs.filter((log) => log.direction === "IN").length;
  const outCount = filteredLogs.filter((log) => log.direction === "OUT").length;

  const handleSend = async (log: TruckLog) => {
    setSendingIds((prev) => new Set(prev).add(log.id));
    try {
      const result = await sendTruckLogToCustoms(log.id);

      if (result.success) {
        onSend(log.id);
        toast({
          title: "Амжилттай",
          description: "Мэдээлэл Монголын гаальд амжилттай илгээгдлээ",
        });
        if (onUpdate) {
          onUpdate();
        }
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

  const handleToggleSelect = (logId: string) => {
    setSelectedLogIds((prev) => {
      const next = new Set(prev);
      if (next.has(logId)) {
        next.delete(logId);
      } else {
        next.add(logId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedLogIds.size === filteredLogs.length) {
      setSelectedLogIds(new Set());
    } else {
      setSelectedLogIds(new Set(filteredLogs.map(log => log.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedLogIds.size === 0) {
      toast({
        title: "Алдаа",
        description: "Устгах бүртгэл сонгоно уу",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      const deletePromises = Array.from(selectedLogIds).map(async (logId) => {
        try {
          const response = await fetch(`/api/logs/${logId}`, {
            method: "DELETE",
          });
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to delete log ${logId}`);
          }
          const result = await response.json();
          if (!result.success) {
            throw new Error(result.error || `Failed to delete log ${logId}`);
          }
          return logId;
        } catch (error) {
          console.error(`Error deleting log ${logId}:`, error);
          throw error;
        }
      });

      const results = await Promise.allSettled(deletePromises);
      
      // Check for any failures
      const failures = results.filter((result) => result.status === "rejected");
      const successes = results.filter((result) => result.status === "fulfilled");

      if (failures.length > 0) {
        const errorMessages = failures
          .map((f) => (f.status === "rejected" ? f.reason?.message || "Unknown error" : ""))
          .filter(Boolean);
        
        console.error("Some deletions failed:", errorMessages);
        toast({
          title: "Алдаа",
          description: `${successes.length} бүртгэл устгагдлаа, ${failures.length} бүртгэл устгахад алдаа гарлаа: ${errorMessages.join(", ")}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Амжилттай",
          description: `${selectedLogIds.size} бүртгэл амжилттай устгагдлаа`,
        });
      }

      // Clear selection and refresh if any succeeded
      if (successes.length > 0) {
        setSelectedLogIds(new Set());
        
        // Call onUpdate to refresh from server
        // The parent component will reload the logs
        if (onUpdate) {
          onUpdate();
        }
      }
    } catch (error) {
      console.error("Error deleting logs:", error);
      toast({
        title: "Алдаа",
        description: error instanceof Error ? error.message : "Бүртгэл устгахад алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Fetch unique codes for logs
  const fetchUniqueCodesForLogs = async (logsToFetch: TruckLog[]) => {
    const codesMap = new Map<string, string>()
    
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
      fetchUniqueCodesForLogs(logs).catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs]);

  // Updated: More robust PDF download handler
  // This function will export a session log as PDF using export-pdf.

  const handleExportLogToPDF = async (log: TruckLog) => {
    try {
      await exportLogToPDF(log);
    } catch (error) {
      console.error("Error exporting log PDF:", error);
      toast({
        title: "Алдаа",
        description:
          error instanceof Error
            ? error.message
            : "Сешн PDF татахад алдаа гарлаа. Та сүлжээгээ шалгана уу эсвэл PDF үүсгэх сервер ажиллаж буй эсэхийг шалгана уу.",
        variant: "destructive",
      });
    }
  };
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

  // Export to Excel - exports only filtered/search results
  const handleExportToExcel = () => {
    try {
      console.log("📊 Exporting to Excel - filtered logs count:", filteredLogs.length, "total logs:", logs.length);
      
      // Prepare data for Excel using filtered logs (respects all search filters)
      const excelData = filteredLogs.map((log) => ({
        "Дугаар": uniqueCodes.get(log.id) || "—",
        "Улсын дугаар": log.plate,
        "Чиргүүл": log.trailerPlate || "—",
        "Жолооч": log.driverName || "—",
        "Бүтээгдэхүүн": log.cargoType || "—",
        "Тээврийн компани": getTransportCompanyName(log.transportCompanyId),
        "Чиглэл": (log.direction === "OUT") || (log.direction === "IN" && log.netWeightKg !== undefined && log.netWeightKg !== null) ? "орсон гарсан" : "орсон гараагүй",
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

      // Generate filename with current date
      const dateStr = new Date().toISOString().split("T")[0];
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

  return (
    <Card className="border-gray-200 bg-white shadow-sm min-h-[700px] flex flex-col">
      <CardHeader className="pb-1 flex-shrink-0 px-4 pt-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900">
            Тээврийн хэрэгслийн түүх, хайлт
          </CardTitle>
          <Button
            onClick={handleExportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="default"
          >
            <Download className="w-4 h-4 mr-2" />
            Excel татах ({filteredLogs.length})
          </Button>
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
              <FilterableSelect
                options={uniqueDrivers}
                value={driverSearch}
                onValueChange={(value) => setDriverSearch(value)}
                placeholder="Жолооч сонгох..."
                searchPlaceholder="Жолооч хайх..."
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

            {/* Product Search */}
            <div>
              <Label htmlFor="product" className="text-xs font-medium text-gray-700 mb-0.5">
                Бүтээгдэхүүн
              </Label>
              <FilterableSelect
                options={uniqueProducts}
                value={productSearch}
                onValueChange={(value) => setProductSearch(value)}
                placeholder="Бүтээгдэхүүн сонгох..."
                searchPlaceholder="Бүтээгдэхүүн хайх..."
                className="bg-white"
              />
            </div>

            {/* Trailer Search */}
            <div>
              <Label htmlFor="trailer" className="text-xs font-medium text-gray-700 mb-0.5">
                Чиргүүл
              </Label>
              <FilterableSelect
                options={uniqueTrailers}
                value={trailerSearch}
                onValueChange={(value) => setTrailerSearch(value)}
                placeholder="Чиргүүл сонгох..."
                searchPlaceholder="Чиргүүл хайх..."
                className="bg-white"
              />
            </div>

            {/* Contract Search */}
            <div>
              <Label htmlFor="contract" className="text-xs font-medium text-gray-700 mb-0.5">
                Гэрээ
              </Label>
              <FilterableSelect
                options={uniqueContracts}
                value={contractSearch}
                onValueChange={(value) => setContractSearch(value)}
                placeholder="Гэрээ сонгох..."
                searchPlaceholder="Гэрээ хайх..."
                className="bg-white"
              />
            </div>

            {/* Vehicle Registration Search */}
            <div>
              <Label htmlFor="vehicle" className="text-xs font-medium text-gray-700 mb-0.5">
                Тээврийн хэрэгсэл
              </Label>
              <FilterableSelect
                options={uniqueVehicles}
                value={vehicleSearch}
                onValueChange={(value) => setVehicleSearch(value)}
                placeholder="Тээврийн хэрэгсэл сонгох..."
                searchPlaceholder="Тээврийн хэрэгсэл хайх..."
                className="bg-white"
              />
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
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-gray-700">
                  Нийт: {filteredLogs.length}
                </span>
                {selectedLogIds.size > 0 && (
                  <Badge
                    variant="outline"
                    className="bg-red-50 text-red-700 border-red-200 text-xs"
                  >
                    Сонгогдсон: {selectedLogIds.size}
                  </Badge>
                )}
              </div>
              {selectedLogIds.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  className="h-8 px-3 text-xs"
                >
                  {isDeleting ? (
                    "Устгаж байна..."
                  ) : (
                    <>
                      <Trash2 className="w-3 h-3 mr-1.5" />
                      Устгах ({selectedLogIds.size})
                    </>
                  )}
                </Button>
              )}
            </div>
            <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-10">
                      <Checkbox
                        checked={selectedLogIds.size === filteredLogs.length && filteredLogs.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
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
                      Үйлдэл
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
                      <TableCell>
                        <Checkbox
                          checked={selectedLogIds.has(log.id)}
                          onCheckedChange={() => handleToggleSelect(log.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
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
                          {(log.direction === "OUT") || (log.direction === "IN" && log.netWeightKg !== undefined && log.netWeightKg !== null) ? "орсон гарсан" : "орсон гараагүй"}
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
                      <TableCell>
                        <div className="flex items-center gap-1">
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
                          <Button
                            size="default"
                            variant="outline"
                            onClick={() => handleSend(log)}
                            disabled={sendingIds.has(log.id)}
                            className="bg-green-500 text-white border-green-600 hover:bg-green-600 disabled:bg-green-300 disabled:text-white h-8 px-3 text-xs"
                            title="Гаальд илгээх"
                          >
                            {sendingIds.has(log.id) ? (
                              "Илгээж байна..."
                            ) : (
                              <>
                                <Send className="w-3 h-3 mr-1.5" />
                                Илгээх
                              </>
                            )}
                          </Button>
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
                          <Button
                            size="default"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("PDF clicked", log.id);
                              handleExportLogToPDF(log);
                            }}
                            title="PDF татах"
                            className="border-gray-300 hover:bg-gray-50 h-9 px-4 text-sm"
                          >
                            PDF
                          </Button>
                        </div>
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
