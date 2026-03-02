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
import { fetchUniqueCodesForLogs } from "@/lib/uniqueCodes";
import { exportLogToPDF, printLog } from "@/lib/pdf-export";
import type { Direction, Driver, TruckLog, TransportCompany, Organization } from "@/lib/types";
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
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
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
      const dbResult = await sendTruckLogToCustoms(log.id);
      if (dbResult.success) {
        onSend(log.id);
        toast({
          title: "Амжилттай",
          description: "Гаальд илгээсэн",
        });
        if (onUpdate) onUpdate();
      } else {
        toast({
          title: "Алдаа",
          description: dbResult.error || "Гаальд илгээсэн төлөв хадгалахад алдаа гарлаа",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Алдаа",
        description: error instanceof Error ? error.message : "Гаальд илгээсэн төлөв хадгалахад алдаа гарлаа",
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

  // Fetch unique codes for logs (shared lib)
  const loadUniqueCodes = async (logsToFetch: TruckLog[]) => {
    const codesMap = await fetchUniqueCodesForLogs(logsToFetch);
    setUniqueCodes(codesMap);
  };

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

  // Fetch drivers (for DRN phone/registrationNumber when sending)
  useEffect(() => {
    async function fetchDrivers() {
      try {
        const response = await fetch("/api/drivers");
        if (response.ok) {
          const data = await response.json();
          setDrivers(Array.isArray(data) ? data : data.drivers || []);
        }
      } catch (error) {
        console.error("Error fetching drivers:", error);
      }
    }
    fetchDrivers();
  }, []);

  // Fetch sender organizations (to get sender contract when sending)
  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const response = await fetch("/api/organizations?type=sender");
        if (response.ok) {
          const data = await response.json();
          setOrganizations(Array.isArray(data) ? data : data.organizations || []);
        }
      } catch (error) {
        console.error("Error fetching organizations:", error);
      }
    }
    fetchOrganizations();
  }, []);

  // Fetch unique codes when logs change
  useEffect(() => {
    if (logs.length > 0) {
      loadUniqueCodes(logs).catch(console.error);
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
    <Card className="border-gray-200 bg-white shadow-sm min-h-[600px] flex flex-col !py-0 !gap-1">
      <CardHeader className="!py-1.5 flex-shrink-0 px-2">
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
      <CardContent className="pt-1 flex-1 min-h-[400px] overflow-hidden flex flex-col px-3 pb-2">
        {/* Filters Section - Compact, all visible */}
        <div className="mb-1.5 p-2 bg-gray-50 rounded-lg border border-gray-200 flex-shrink-0">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            <div className="min-w-0">
              <Label htmlFor="direction" className="text-[10px] font-medium text-gray-600 mb-0.5 block">Чиглэл</Label>
              <Select value={directionFilter} onValueChange={(v) => setDirectionFilter(v as Direction | "ALL")}>
                <SelectTrigger className="h-8 text-xs bg-white py-1 w-full min-w-0"> <SelectValue /> </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Бүх</SelectItem>
                  <SelectItem value="IN">ОРОХ</SelectItem>
                  <SelectItem value="OUT">ГАРАХ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0">
              <Label htmlFor="plate" className="text-[10px] font-medium text-gray-600 mb-0.5 block">Дугаар</Label>
              <Input id="plate" placeholder="Хайх..." value={plateSearch} onChange={(e) => setPlateSearch(e.target.value)} className="h-8 text-xs bg-white py-1 w-full" />
            </div>
            <div className="min-w-0">
              <Label htmlFor="dateFrom" className="text-[10px] font-medium text-gray-600 mb-0.5 block">Эхлэх</Label>
              <Input id="dateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-8 text-xs bg-white py-1 w-full" />
            </div>
            <div className="min-w-0">
              <Label htmlFor="dateTo" className="text-[10px] font-medium text-gray-600 mb-0.5 block">Дуусах</Label>
              <Input id="dateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-8 text-xs bg-white py-1 w-full" />
            </div>
            <div className="min-w-0">
              <Label className="text-[10px] font-medium text-gray-600 mb-0.5 block">Жолооч</Label>
              <FilterableSelect options={uniqueDrivers} value={driverSearch} onValueChange={setDriverSearch} placeholder="Сонгох..." searchPlaceholder="Хайх..." className="bg-white h-8 text-xs w-full" />
            </div>
            <div className="min-w-0">
              <Label className="text-[10px] font-medium text-gray-600 mb-0.5 block">Тээврийн компани</Label>
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger className="h-8 text-xs bg-white py-1 w-full min-w-0"> <SelectValue /> </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Бүх компани</SelectItem>
                  {transportCompanies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0">
              <Label className="text-[10px] font-medium text-gray-600 mb-0.5 block">Бүтээгдэхүүн</Label>
              <FilterableSelect options={uniqueProducts} value={productSearch} onValueChange={setProductSearch} placeholder="Сонгох..." searchPlaceholder="Хайх..." className="bg-white h-8 text-xs w-full" />
            </div>
            <div className="min-w-0">
              <Label className="text-[10px] font-medium text-gray-600 mb-0.5 block">Чиргүүл</Label>
              <FilterableSelect options={uniqueTrailers} value={trailerSearch} onValueChange={setTrailerSearch} placeholder="Сонгох..." searchPlaceholder="Хайх..." className="bg-white h-8 text-xs w-full" />
            </div>
            <div className="min-w-0">
              <Label className="text-[10px] font-medium text-gray-600 mb-0.5 block">Гэрээ</Label>
              <FilterableSelect options={uniqueContracts} value={contractSearch} onValueChange={setContractSearch} placeholder="Сонгох..." searchPlaceholder="Хайх..." className="bg-white h-8 text-xs w-full" />
            </div>
            <div className="min-w-0">
              <Label className="text-[10px] font-medium text-gray-600 mb-0.5 block">Тээврийн хэрэгсэл</Label>
              <FilterableSelect options={uniqueVehicles} value={vehicleSearch} onValueChange={setVehicleSearch} placeholder="Сонгох..." searchPlaceholder="Хайх..." className="bg-white h-8 text-xs w-full" />
            </div>
            <div className="flex items-end">
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs text-gray-600">
                <X className="w-3 h-3 mr-1" /> Цэвэрлэх
              </Button>
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
            <div className="flex items-center justify-between flex-shrink-0 mb-1">
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
              <Table className="text-xs">
                <TableHeader>
                  <TableRow className="bg-gray-50 h-8">
                    <TableHead className="w-8 !py-1 !px-1.5 [&_[role=checkbox]]:scale-75">
                      <Checkbox
                        checked={selectedLogIds.size === filteredLogs.length && filteredLogs.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold text-xs relative pr-2 !py-1 !px-1.5">
                      Дугаар
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold text-xs relative pr-2 !py-1 !px-1.5">
                      Улсын дугаар
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold text-xs relative pr-2 !py-1 !px-1.5">
                      Чиргүүл
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold text-xs relative pr-2 !py-1 !px-1.5">
                      Жолооч
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold text-xs relative pr-2 !py-1 !px-1.5">
                      Бүтээгдхүүн
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold text-xs relative pr-2 !py-1 !px-1.5">
                      Тээврийн компани
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold text-xs relative pr-2 !py-1 !px-1.5">
                      Чиглэл
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold text-xs relative pr-2 !py-1 !px-1.5">
                      Төлөв
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold text-xs relative pr-2 !py-1 !px-1.5">
                      Оролтын жин (кг)
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold text-xs relative pr-2 !py-1 !px-1.5">
                      Гаралтын жин (кг)
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold text-xs relative pr-2 !py-1 !px-1.5">
                      Цэвэр жин (кг)
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold text-xs !py-1 !px-1.5">
                      Үйлдэл
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow 
                      key={log.id} 
                      className="hover:bg-gray-50 cursor-pointer h-8"
                      onDoubleClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleEdit(log)
                      }}
                    >
                      <TableCell className="!py-0.5 !px-1.5 [&_[role=checkbox]]:scale-75">
                        <Checkbox
                          checked={selectedLogIds.has(log.id)}
                          onCheckedChange={() => handleToggleSelect(log.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                      <TableCell className="text-gray-700 font-mono text-xs relative pr-2 !py-0.5 !px-1.5">
                        {uniqueCodes.get(log.id) || "—"}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                      </TableCell>
                      <TableCell className="font-mono font-semibold text-gray-900 text-xs relative pr-2 !py-0.5 !px-1.5">
                        {log.plate}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                      </TableCell>
                      <TableCell className="text-gray-700 font-mono text-xs relative pr-2 !py-0.5 !px-1.5">
                        {log.trailerPlate || "—"}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                      </TableCell>
                      <TableCell className="text-gray-700 text-xs relative pr-2 !py-0.5 !px-1.5">
                        {log.driverName}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                      </TableCell>
                      <TableCell className="text-gray-700 text-xs relative pr-2 !py-0.5 !px-1.5">
                        {log.cargoType || "—"}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                      </TableCell>
                      <TableCell className="text-gray-700 text-xs relative pr-2 !py-0.5 !px-1.5">
                        {getTransportCompanyName(log.transportCompanyId)}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                      </TableCell>
                      <TableCell className="relative pr-2 !py-0.5 !px-1.5">
                        <Badge
                          variant="outline"
                          className={
                            // Show "гарсан" (OUT) only if:
                            // 1. Direction is explicitly OUT, OR
                            // 2. Direction is IN but has netWeightKg (merged log with OUT data)
                            (log.direction === "OUT") || (log.direction === "IN" && log.netWeightKg !== undefined && log.netWeightKg !== null)
                              ? "bg-green-50 text-green-700 border-green-200 text-[10px] !py-0 !px-1"
                              : "bg-blue-50 text-blue-700 border-blue-200 text-[10px] !py-0 !px-1"
                          }
                        >
                          {(log.direction === "OUT") || (log.direction === "IN" && log.netWeightKg !== undefined && log.netWeightKg !== null) ? "орсон гарсан" : "орсон гараагүй"}
                        </Badge>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                      </TableCell>
                      <TableCell className="relative pr-2 !py-0.5 !px-1.5">
                        <span className={`text-xs font-medium ${
                          log.sentToCustoms 
                            ? "text-green-600" 
                            : "text-gray-500"
                        }`}>
                          {log.sentToCustoms ? "илгээгдсэн" : "илгээгдээгүй"}
                        </span>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                      </TableCell>
                      <TableCell className="text-gray-700 font-mono text-xs relative pr-2 !py-0.5 !px-1.5">
                        {log.totalInWeight != null
                          ? Number(log.totalInWeight).toLocaleString()
                          : "—"}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                      </TableCell>
                      <TableCell className="text-gray-700 font-mono text-xs relative pr-2 !py-0.5 !px-1.5">
                        {log.totalOutWeight != null
                          ? Number(log.totalOutWeight).toLocaleString()
                          : "—"}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                      </TableCell>
                      <TableCell className="text-gray-700 font-mono text-xs relative pr-2 !py-0.5 !px-1.5">
                        {(() => {
                          const net =
                            (log as any).netWeight ??
                            log.netWeightKg ??
                            null;
                          return net != null
                            ? Number(Math.abs(net)).toLocaleString()
                            : "—";
                        })()}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                      </TableCell>
                      <TableCell className="!py-0.5 !px-1.5">
                        <div className="flex items-center gap-0.5">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); handleEdit(log); }}
                            title={log.sentToCustoms ? "Бүртгэлийг засах" : "Бүртгэл засах"}
                            className="h-6 w-6 min-w-6 border-gray-300 hover:bg-gray-50 shrink-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); handleSend(log); }}
                            disabled={sendingIds.has(log.id)}
                            title="Гаальд илгээх"
                            className="h-6 w-6 min-w-6 bg-green-500 text-white border-green-600 hover:bg-green-600 disabled:bg-green-300 disabled:text-white shrink-0"
                          >
                            {sendingIds.has(log.id) ? (
                              <span className="text-[10px]">...</span>
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={async (e) => {
                              e.stopPropagation();
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
                            className="h-6 w-6 min-w-6 border-gray-300 hover:bg-gray-50 shrink-0"
                          >
                            <FileDown className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportLogToPDF(log);
                            }}
                            title="PDF татах"
                            className="h-6 w-6 min-w-6 border-gray-300 hover:bg-gray-50 shrink-0"
                          >
                            <Download className="w-3 h-3" />
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
