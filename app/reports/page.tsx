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
import { FilterableSelect } from "@/components/ui/filterable-select";
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
  
  // Filters (match dashboard / TruckTable)
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

  // Unique options for FilterableSelect (from logs / transportCompanies) — match dashboard
  const uniqueDrivers = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((log) => {
      if (log.driverName?.trim()) set.add(log.driverName.trim());
    });
    return Array.from(set).sort().map((name) => ({ value: name, label: name }));
  }, [logs]);

  const uniqueProducts = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((log) => {
      if (log.cargoType?.trim()) set.add(log.cargoType.trim());
    });
    return Array.from(set).sort().map((name) => ({ value: name, label: name }));
  }, [logs]);

  const uniqueTrailers = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((log) => {
      if (log.trailerPlate?.trim()) set.add(log.trailerPlate.trim());
    });
    return Array.from(set).sort().map((name) => ({ value: name, label: name }));
  }, [logs]);

  const uniqueContracts = useMemo(() => {
    const set = new Set<string>();
    transportCompanies.forEach((c) => {
      if (c.contract?.trim()) set.add(c.contract.trim());
    });
    return Array.from(set).sort().map((name) => ({ value: name, label: name }));
  }, [transportCompanies]);

  const uniqueVehicles = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((log) => {
      const v = log.vehicleRegistrationNumber?.trim();
      if (v) set.add(v);
    });
    return Array.from(set).sort().map((name) => ({ value: name, label: name }));
  }, [logs]);

  // Filter logs (same logic as dashboard TruckTable)
  const filteredLogs = useMemo(() => {
    let result = [...logs];

    if (directionFilter !== "ALL") {
      result = result.filter((log) => log.direction === directionFilter);
    }
    if (plateSearch.trim()) {
      const q = plateSearch.toLowerCase().trim();
      result = result.filter((log) => log.plate.toLowerCase().includes(q));
    }
    if (driverSearch.trim()) {
      const q = driverSearch.toLowerCase().trim();
      result = result.filter((log) => log.driverName?.toLowerCase().includes(q));
    }
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase().trim();
      result = result.filter((log) => log.cargoType?.toLowerCase().includes(q));
    }
    if (trailerSearch.trim()) {
      const q = trailerSearch.toLowerCase().trim();
      result = result.filter((log) => log.trailerPlate?.toLowerCase().includes(q));
    }
    if (contractSearch.trim()) {
      const q = contractSearch.toLowerCase().trim();
      result = result.filter((log) => {
        if (!log.transportCompanyId) return false;
        const company = transportCompanies.find((c) => c.id === log.transportCompanyId);
        return company?.contract?.toLowerCase().includes(q);
      });
    }
    if (vehicleSearch.trim()) {
      const q = vehicleSearch.toLowerCase().trim();
      result = result.filter((log) =>
        log.vehicleRegistrationNumber?.toLowerCase().includes(q)
      );
    }
    if (companyFilter !== "ALL") {
      result = result.filter((log) => log.transportCompanyId === companyFilter);
    }
    if (dateFrom) {
      const from = new Date(dateFrom);
      result = result.filter((log) => new Date(log.createdAt) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((log) => new Date(log.createdAt) <= to);
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [logs, directionFilter, plateSearch, driverSearch, productSearch, trailerSearch, contractSearch, vehicleSearch, companyFilter, dateFrom, dateTo, transportCompanies]);

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

  const hasActiveFilters =
    directionFilter !== "ALL" ||
    !!plateSearch ||
    !!driverSearch ||
    !!productSearch ||
    !!trailerSearch ||
    !!contractSearch ||
    !!vehicleSearch ||
    !!dateFrom ||
    !!dateTo ||
    companyFilter !== "ALL";

  // Helper function to get transport company name
  const getTransportCompanyName = (companyId?: string): string => {
    if (!companyId) return "—";
    const company = transportCompanies.find((c) => c.id === companyId);
    return company?.name || "—";
  };

  // Report summary for government/official use: period, total weight IN, total weight OUT
  // OUT sessions usually merge into the IN log (direction stays "IN", netWeightKg set, weightKg = exit weight).
  // So "total out" must include: direction===OUT (standalone) + direction===IN with netWeightKg (merged/completed).
  const reportSummary = useMemo(() => {
    const totalWeightIn = filteredLogs
      .filter((log) => log.direction === "IN")
      .reduce((sum, log) => sum + (typeof log.weightKg === "number" && !isNaN(log.weightKg) ? log.weightKg : 0), 0);
    const isMergedOrOut = (log: TruckLog) =>
      log.direction === "OUT" || (log.direction === "IN" && log.netWeightKg != null && log.netWeightKg !== undefined);
    const totalWeightOut = filteredLogs
      .filter(isMergedOrOut)
      .reduce((sum, log) => sum + (typeof log.weightKg === "number" && !isNaN(log.weightKg) ? log.weightKg : 0), 0);
    const periodLabel =
      dateFrom && dateTo
        ? `${dateFrom} - ${dateTo}`
        : dateFrom
          ? `${dateFrom} - (одоо)`
          : dateTo
            ? `(эхлэх) - ${dateTo}`
            : "Бүх хугацаа";
    return {
      periodLabel,
      totalWeightIn,
      totalWeightOut,
      totalRecords: filteredLogs.length,
    };
  }, [filteredLogs, dateFrom, dateTo]);

  // Export to Excel — government/official report with header (when-to-when, totals)
  const handleExportToExcel = () => {
    try {
      const { periodLabel, totalWeightIn, totalWeightOut, totalRecords } = reportSummary;

      // Ensure "when to when" is explicit in Excel: use filter dates or derive from data (never empty)
      let excelPeriodFrom = dateFrom;
      let excelPeriodTo = dateTo;
      if (!excelPeriodFrom || !excelPeriodTo) {
        if (filteredLogs.length > 0) {
          const dates = filteredLogs.map((log) => new Date(log.createdAt).getTime());
          const minDate = new Date(Math.min(...dates));
          const maxDate = new Date(Math.max(...dates));
          excelPeriodFrom = minDate.toISOString().split("T")[0];
          excelPeriodTo = maxDate.toISOString().split("T")[0];
        } else {
          const today = new Date().toISOString().split("T")[0];
          excelPeriodFrom = excelPeriodFrom || today;
          excelPeriodTo = excelPeriodTo || today;
        }
      }
      const whenToWhenLabel =
        [excelPeriodFrom, excelPeriodTo].every(Boolean) ? `${excelPeriodFrom} - ${excelPeriodTo}` : "";
      const whenToWhenDisplay =
        whenToWhenLabel || `${new Date().toISOString().split("T")[0]} - ${new Date().toISOString().split("T")[0]}`;

      // Prepare row data — use numbers for weights so Excel shows and sums correctly
      const excelData = filteredLogs.map((log) => ({
        "Дугаар": uniqueCodes.get(log.id) ?? "",
        "Улсын дугаар": log.plate ?? "",
        "Чиргүүл": log.trailerPlate ?? "",
        "Жолооч": log.driverName ?? "",
        "Бүтээгдэхүүн": log.cargoType ?? "",
        "Тээврийн компани": getTransportCompanyName(log.transportCompanyId),
        "Чиглэл": (log.direction === "OUT") || (log.direction === "IN" && log.netWeightKg != null) ? "орсон гарсан" : "орсон гараагүй",
        "Төлөв": log.sentToCustoms ? "илгээгдсэн" : "илгээгдээгүй",
        "Жин (кг)": typeof log.weightKg === "number" && !isNaN(log.weightKg) ? log.weightKg : "",
        "Цэвэр жин (кг)": typeof log.netWeightKg === "number" && !isNaN(log.netWeightKg) ? log.netWeightKg : "",
        "Хаанаас": log.origin ?? "",
        "Хаашаа": log.destination ?? "",
        "Илгээч": log.senderOrganization ?? "",
        "Хүлээн авагч": log.receiverOrganization ?? "",
        "Огноо": formatDateTimeForExcel(log.createdAt),
      }));

      // Summary block: title merged across all columns; compact key-value rows to use horizontal space
      const reportName = "Тээврийн хэрэгслийн орсон гарсан бүртгэлийн тайлан";
      const headerRows: (string | number)[][] = [
        ["ТЭЭВРИЙН ХЭРЭГСЛИЙН ОРСОН ГАРСАН ТАЙЛАН"],
        ["Хугацаа (эхлэх - дуусах)", whenToWhenDisplay, "Тайлангийн нэр", reportName],
        ["Нийт орсон жин (кг)", totalWeightIn, "Нийт гарсан жин (кг)", totalWeightOut, "Нийт бүртгэлийн тоо", totalRecords],
        [],
      ];
      const dataHeaders = excelData.length > 0 ? Object.keys(excelData[0]) : [
        "Дугаар", "Улсын дугаар", "Чиргүүл", "Жолооч", "Бүтээгдэхүүн", "Тээврийн компани",
        "Чиглэл", "Төлөв", "Жин (кг)", "Цэвэр жин (кг)", "Хаанаас", "Хаашаа", "Илгээч", "Хүлээн авагч", "Огноо",
      ];
      const dataRows = excelData.map((row) => Object.values(row));
      const aoa = [...headerRows, dataHeaders, ...dataRows];
      const ws = XLSX.utils.aoa_to_sheet(aoa);

      const numCols = dataHeaders.length;

      // Merge title row (row 0) across all columns for a cleaner header
      ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: numCols - 1 } }];

      // Column widths: balanced for summary (A–B) and data table; avoid cramped or oversized columns
      const colWidths = dataHeaders.map((_, i) => {
        const w = i === 0 ? 20 : i === 1 ? 12 : i === 2 ? 12 : i <= 6 ? 14 : i <= 9 ? 12 : 14;
        return { wch: Math.min(Math.max(w, 10), 24) };
      });
      ws["!cols"] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Тайлан");

      const dateStr = dateFrom && dateTo ? `${dateFrom}_${dateTo}` : new Date().toISOString().split("T")[0];
      const filename = `Тайлан_${dateStr}.xlsx`;
      XLSX.writeFile(wb, filename);

      toast({
        title: "Амжилттай",
        description: `${totalRecords} бүртгэл, нийт орсон жин ${totalWeightIn.toLocaleString("mn-MN")} кг, гарсан жин ${totalWeightOut.toLocaleString("mn-MN")} кг татагдлаа`,
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

  // Format date+time for Excel so time is visible (locale string can be date-only in some environments)
  const formatDateTimeForExcel = (dateString: string): string => {
    const d = new Date(dateString);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const h = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${day} ${h}:${min}`;
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
                {/* Report summary: when-to-when + total weight IN/OUT — always visible (also included in Excel download) */}
                <div className="flex-shrink-0 mb-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-slate-800 mb-2">Тайлангийн тойм</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-slate-500 block">Хугацаа</span>
                      <span className="font-medium text-slate-900">{reportSummary.periodLabel}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Нийт орсон жин (кг)</span>
                      <span className="font-medium text-green-700">{reportSummary.totalWeightIn.toLocaleString("mn-MN")}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Нийт гарсан жин (кг)</span>
                      <span className="font-medium text-blue-700">{reportSummary.totalWeightOut.toLocaleString("mn-MN")}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Нийт бүртгэл</span>
                      <span className="font-medium text-slate-900">{reportSummary.totalRecords}</span>
                    </div>
                  </div>
                </div>

                {/* Filters Section — same as dashboard (Нүүр) TruckTable */}
                <div className="space-y-2 mb-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200 flex-shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    {hasActiveFilters && (
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
                    {/* Direction */}
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

                    {/* Plate */}
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

                    {/* Driver */}
                    <div>
                      <Label htmlFor="driver" className="text-xs font-medium text-gray-700 mb-0.5">
                        Жолооч
                      </Label>
                      <FilterableSelect
                        options={uniqueDrivers}
                        value={driverSearch}
                        onValueChange={setDriverSearch}
                        placeholder="Жолооч сонгох..."
                        searchPlaceholder="Жолооч хайх..."
                        className="bg-white"
                      />
                    </div>

                    {/* Company */}
                    <div>
                      <Label htmlFor="company" className="text-xs font-medium text-gray-700 mb-0.5">
                        Тээврийн компани
                      </Label>
                      <Select
                        value={companyFilter}
                        onValueChange={setCompanyFilter}
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

                    {/* Product */}
                    <div>
                      <Label htmlFor="product" className="text-xs font-medium text-gray-700 mb-0.5">
                        Бүтээгдэхүүн
                      </Label>
                      <FilterableSelect
                        options={uniqueProducts}
                        value={productSearch}
                        onValueChange={setProductSearch}
                        placeholder="Бүтээгдэхүүн сонгох..."
                        searchPlaceholder="Бүтээгдэхүүн хайх..."
                        className="bg-white"
                      />
                    </div>

                    {/* Trailer */}
                    <div>
                      <Label htmlFor="trailer" className="text-xs font-medium text-gray-700 mb-0.5">
                        Чиргүүл
                      </Label>
                      <FilterableSelect
                        options={uniqueTrailers}
                        value={trailerSearch}
                        onValueChange={setTrailerSearch}
                        placeholder="Чиргүүл сонгох..."
                        searchPlaceholder="Чиргүүл хайх..."
                        className="bg-white"
                      />
                    </div>

                    {/* Contract */}
                    <div>
                      <Label htmlFor="contract" className="text-xs font-medium text-gray-700 mb-0.5">
                        Гэрээ
                      </Label>
                      <FilterableSelect
                        options={uniqueContracts}
                        value={contractSearch}
                        onValueChange={setContractSearch}
                        placeholder="Гэрээ сонгох..."
                        searchPlaceholder="Гэрээ хайх..."
                        className="bg-white"
                      />
                    </div>

                    {/* Vehicle */}
                    <div>
                      <Label htmlFor="vehicle" className="text-xs font-medium text-gray-700 mb-0.5">
                        Тээврийн хэрэгсэл
                      </Label>
                      <FilterableSelect
                        options={uniqueVehicles}
                        value={vehicleSearch}
                        onValueChange={setVehicleSearch}
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
