"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useThirdPartyAutofill } from "@/hooks/useThirdPartyAutofill";
import { sendTruckLogToCustoms } from "@/lib/api";
import { exportLogToPDF, printLog } from "@/lib/pdf-export";
import type { Direction, Driver, TruckLog, TransportCompany } from "@/lib/types";
import { Edit, FileDown, Search, Send, X, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";

interface FullHistoryTableProps {
  logs: TruckLog[];
  onSend: (logId: string) => void;
  onUpdate?: () => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function FullHistoryTable({ 
  logs, 
  onSend, 
  onUpdate,
  currentPage: externalCurrentPage,
  totalPages: externalTotalPages,
  onPageChange
}: FullHistoryTableProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { sendFormData } = useThirdPartyAutofill();
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());
  const [uniqueCodes, setUniqueCodes] = useState<Map<string, string>>(new Map());
  const [transportCompanies, setTransportCompanies] = useState<TransportCompany[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [selectedLogIds, setSelectedLogIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Use external pagination if provided, otherwise use internal
  const currentPage = externalCurrentPage ?? internalCurrentPage;
  const setCurrentPage = onPageChange ?? setInternalCurrentPage;

  // Filter states
  const [directionFilter, setDirectionFilter] = useState<Direction | "ALL">("ALL");
  const [plateSearch, setPlateSearch] = useState("");
  const [driverSearch, setDriverSearch] = useState("");
  const [cargoSearch, setCargoSearch] = useState("");
  const [trailerSearch, setTrailerSearch] = useState("");
  const [contractSearch, setContractSearch] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [originSearch, setOriginSearch] = useState("");
  const [destinationSearch, setDestinationSearch] = useState("");
  const [weightMin, setWeightMin] = useState("");
  const [weightMax, setWeightMax] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sentToCustomsFilter, setSentToCustomsFilter] = useState<"ALL" | "true" | "false">("ALL");

  const handleEdit = (log: TruckLog) => {
    // Redirect to the appropriate session page based on direction
    if (log.direction === "IN") {
      router.push(`/in-session?edit=${log.id}`);
    } else {
      router.push(`/out-session?edit=${log.id}`);
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

      // Trailer search
      if (trailerSearch && !log.trailerPlate?.toLowerCase().includes(trailerSearch.toLowerCase())) {
        return false;
      }

      // Contract search (search in transport company contract)
      if (contractSearch) {
        const query = contractSearch.toLowerCase();
        const company = transportCompanies.find((c) => c.id === log.transportCompanyId);
        if (!company?.contract?.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Vehicle registration number search
      if (vehicleSearch && !log.vehicleRegistrationNumber?.toLowerCase().includes(vehicleSearch.toLowerCase())) {
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
    trailerSearch,
    contractSearch,
    vehicleSearch,
    originSearch,
    destinationSearch,
    weightMin,
    weightMax,
    dateFrom,
    dateTo,
    sentToCustomsFilter,
    transportCompanies,
  ]);

  // Use filtered logs directly if external pagination is provided, otherwise paginate client-side
  const paginatedLogs = externalCurrentPage !== undefined ? filteredLogs : filteredLogs;
  const totalPages = externalTotalPages ?? Math.ceil(filteredLogs.length / 30);

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

  useEffect(() => {
    // Reset to first page when filters change (only if using internal pagination)
    if (externalCurrentPage === undefined) {
      setCurrentPage(1);
    }
  }, [
    directionFilter,
    plateSearch,
    driverSearch,
    cargoSearch,
    trailerSearch,
    contractSearch,
    vehicleSearch,
    originSearch,
    destinationSearch,
    weightMin,
    weightMax,
    dateFrom,
    dateTo,
    sentToCustomsFilter,
    externalCurrentPage,
  ]);

  const performSendToThirdParty = async (log: TruckLog): Promise<boolean> => {
    const uniqueCode = uniqueCodes.get(log.id);
    if (!uniqueCode) {
      toast({
        title: "Алдаа",
        description: "Актын дугаар олдсонгүй. Бүртгэл хадгалагдаагүй байж магадгүй.",
        variant: "destructive",
      });
      return false;
    }
    const driver = log.driverId ? drivers.find((d) => d.id === log.driverId) : undefined;
    const formData = {
      aktNumber: uniqueCode,
      uniqueCode,
      plateNumber: log.plate,
      plate: log.plate,
      driverName: log.driverName || "",
      driverId: log.driverId || "",
      driverPhone: driver?.phone || "",
      driverRegistrationNumber: driver?.registrationNumber || "",
      cargoType: log.cargoType || "",
      product: log.cargoType || "",
      weightKg: log.weightKg || 0,
      grossWeightKg: log.weightKg || 0,
      netWeightKg: log.netWeightKg ?? 0,
      netWeight: log.netWeightKg ?? 0,
      origin: log.origin || "",
      destination: log.destination || "",
      transportCompanyName: transportCompanies.find((c) => c.id === log.transportCompanyId)?.name || "—",
      transporterCompany: transportCompanies.find((c) => c.id === log.transportCompanyId)?.name || "—",
      senderOrganization: log.senderOrganization || "",
      senderOrganizationName: log.senderOrganization || "",
      receiverOrganization: log.receiverOrganization || "",
      receiverOrganizationName: log.receiverOrganization || "",
      sealNumber: log.sealNumber || "",
      trailerPlate: log.trailerPlate || "",
      trailerNumber: log.trailerPlate || "",
    };
    const sendResult = await sendFormData(formData);
    if (!sendResult.success) {
      toast({
        title: "Алдаа",
        description: sendResult.error || "Гаальд илгээхэд алдаа гарлаа. Холболтыг шалгана уу.",
        variant: "destructive",
      });
      return false;
    }
    const dbResult = await sendTruckLogToCustoms(log.id);
    if (dbResult.success) {
      onSend(log.id);
      toast({
        title: "Амжилттай",
        description: "Мэдээлэл Монголын гаальд амжилттай илгээгдлээ",
      });
      if (onUpdate) onUpdate();
    } else {
      toast({
        title: "Анхааруулга",
        description: "Өгөгдөл илгээгдсэн боловч төлөв шинэчлэгдээгүй.",
        variant: "destructive",
      });
    }
    return true;
  };

  const handleSend = async (log: TruckLog) => {
    setSendingIds((prev) => new Set(prev).add(log.id));
    try {
      await performSendToThirdParty(log);
    } catch (error) {
      toast({
        title: "Алдаа",
        description: error instanceof Error ? error.message : "Гаальд илгээхэд алдаа гарлаа",
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
      await performSendToThirdParty(log);
    } catch (error) {
      toast({
        title: "Алдаа",
        description: error instanceof Error ? error.message : "Гаальд илгээхэд алдаа гарлаа",
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

  // Fetch unique codes when logs change
  useEffect(() => {
    if (paginatedLogs.length > 0) {
      fetchUniqueCodesForLogs(paginatedLogs).catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginatedLogs]);

  // Helper function to get transport company name
  const getTransportCompanyName = (companyId?: string): string => {
    if (!companyId) return "—";
    const company = transportCompanies.find((c) => c.id === companyId);
    return company?.name || "—";
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

  const clearFilters = () => {
    setDirectionFilter("ALL");
    setPlateSearch("");
    setDriverSearch("");
    setCargoSearch("");
    setTrailerSearch("");
    setContractSearch("");
    setVehicleSearch("");
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
              <FilterableSelect
                options={uniqueDrivers}
                value={driverSearch}
                onValueChange={(value) => setDriverSearch(value)}
                placeholder="Жолооч сонгох..."
                searchPlaceholder="Жолооч хайх..."
                className="bg-white"
              />
            </div>

            {/* Cargo Search */}
            <div>
              <Label htmlFor="cargo" className="text-xs font-medium text-gray-700 mb-1">
                Бүтээгдэхүүн
              </Label>
              <FilterableSelect
                options={uniqueProducts}
                value={cargoSearch}
                onValueChange={(value) => setCargoSearch(value)}
                placeholder="Бүтээгдэхүүн сонгох..."
                searchPlaceholder="Бүтээгдэхүүн хайх..."
                className="bg-white"
              />
            </div>

            {/* Trailer Search */}
            <div>
              <Label htmlFor="trailer" className="text-xs font-medium text-gray-700 mb-1">
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
              <Label htmlFor="contract" className="text-xs font-medium text-gray-700 mb-1">
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
              <Label htmlFor="vehicle" className="text-xs font-medium text-gray-700 mb-1">
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
                Гаальд илгээсэн
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
              ОРОХ: {inCount}
            </Badge>
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              ГАРАХ: {outCount}
            </Badge>
            {selectedLogIds.size > 0 && (
              <Badge
                variant="outline"
                className="bg-red-50 text-red-700 border-red-200"
              >
                Сонгогдсон: {selectedLogIds.size}
              </Badge>
            )}
          </div>
          {selectedLogIds.size > 0 && (
            <Button
              variant="destructive"
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="h-9 px-4 text-sm"
            >
              {isDeleting ? (
                "Устгаж байна..."
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Устгах ({selectedLogIds.size})
                </>
              )}
            </Button>
          )}
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
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedLogIds.size === filteredLogs.length && filteredLogs.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                  <TableHead className="text-gray-700 font-semibold relative pr-3">
                      Дугаар
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold relative pr-3">
                      Улсын дугаар
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold relative pr-3">
                      Жолооч
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold relative pr-3">
                      Төлөв
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold relative pr-3">
                      Тээврийн компани
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold">
                      Үйлдлүүд
                    </TableHead>
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
                        <Checkbox
                          checked={selectedLogIds.has(log.id)}
                          onCheckedChange={() => handleToggleSelect(log.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                      <TableCell className="font-mono font-semibold text-gray-900 relative pr-3">
                        {log.plate}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                      </TableCell>
                      <TableCell className="text-gray-700 relative pr-3">
                        {log.driverName}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                      </TableCell>
                      <TableCell className="text-gray-700 font-mono text-sm relative pr-3">
                        {uniqueCodes.get(log.id) || "—"}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                      </TableCell>
                      <TableCell className="text-gray-700 text-sm relative pr-3">
                        {formatFromTo(log.origin, log.destination)}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                      </TableCell>
                      <TableCell className="relative pr-3">
                        <Badge
                          variant="outline"
                          className={
                            log.direction === "IN"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-green-50 text-green-700 border-green-200"
                          }
                        >
                          {log.direction === "IN" ? "орсон гараагүй" : "орсон гарсан"}
                        </Badge>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-gray-300"></div>
                      </TableCell>
                      <TableCell className="text-gray-700 text-sm relative pr-3">
                        {getTransportCompanyName(log.transportCompanyId)}
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
                                ? "Бүртгэлийг дахин засах"
                                : "Бүртгэл засах"
                            }
                            className="border-gray-300 hover:bg-gray-50 h-9 px-4 text-sm"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            {log.sentToCustoms ? "Дахин засах" : "Засах"}
                          </Button>
                          <Button
                            size="default"
                            variant="outline"
                            onClick={() => handleSend(log)}
                            disabled={sendingIds.has(log.id)}
                            className="bg-green-500 text-white border-green-600 hover:bg-green-600 disabled:bg-green-300 disabled:text-white h-9 px-4 text-sm"
                            title="Гаальд илгээх"
                          >
                            {sendingIds.has(log.id) ? (
                              "Илгээж байна..."
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
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
                            className="border-gray-300 hover:bg-gray-50 h-9 px-4 text-sm"
                          >
                            <FileDown className="w-4 h-4 mr-2" />
                            Хэвлэх
                          </Button>
                          <Button
                            size="default"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("PDF clicked", log.id);
                              exportLogToPDF(log);
                            }}
                            title="PDF татах"
                            className="border-gray-300 hover:bg-gray-50 h-9 px-4 text-sm"
                          >
                            PDF
                          </Button>
                          {log.sentToCustoms ? (
                            <Button
                              size="default"
                              variant="outline"
                              onClick={() => handleResend(log)}
                              disabled={sendingIds.has(log.id)}
                              className="bg-green-400 text-white border-green-500 hover:bg-green-500 disabled:bg-green-200 disabled:text-white h-9 px-4 text-sm"
                              title="Гаальд илгээх"
                            >
                              {sendingIds.has(log.id) ? (
                                "Илгээж байна..."
                              ) : (
                                <>
                                  <Send className="w-4 h-4 mr-2" />
                                  Илгээх
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button
                              size="default"
                              variant="outline"
                              onClick={() => handleResend(log)}
                              disabled={sendingIds.has(log.id)}
                              className="bg-green-500 text-white border-green-600 hover:bg-green-600 disabled:bg-green-300 disabled:text-white h-9 px-4 text-sm"
                              title="Гаальд илгээх"
                            >
                              {sendingIds.has(log.id) ? (
                                "Илгээж байна..."
                              ) : (
                                <>
                                  <Send className="w-4 h-4 mr-2" />
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
              <div className="flex flex-col items-center gap-3 mt-4">
                <div className="text-sm text-gray-600">
                  Нийт: {filteredLogs.length} бүртгэл
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newPage = Math.max(1, currentPage - 1);
                      if (onPageChange) {
                        onPageChange(newPage);
                      } else {
                        setInternalCurrentPage(newPage);
                      }
                    }}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  {/* Page Number Buttons */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      // Show first page, last page, current page, and pages around current
                      const showPage = 
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);
                      
                      if (!showPage) {
                        // Show ellipsis
                        if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                          return (
                            <span key={pageNum} className="px-2 text-gray-400">
                              ...
                  </span>
                          );
                        }
                        return null;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (onPageChange) {
                              onPageChange(pageNum);
                            } else {
                              setInternalCurrentPage(pageNum);
                            }
                          }}
                          className={
                            pageNum === currentPage
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : ""
                          }
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newPage = Math.min(totalPages, currentPage + 1);
                      if (onPageChange) {
                        onPageChange(newPage);
                      } else {
                        setInternalCurrentPage(newPage);
                      }
                    }}
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

    </Card>
  );
}
