"use client";

import { EditLogDialog } from "@/components/history/EditLogDialog";
import { AlertBanner } from "@/components/layout/AlertBanner";
import { Sidebar } from "@/components/layout/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
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
import { exportLogToPDF } from "@/lib/pdf-export";
import type { Direction, TruckLog } from "@/lib/types";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit,
  FileDown,
  Loader2,
  Search,
  Send,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SessionDirection = Direction | "ALL";
type TimePeriod = "all" | "today" | "week" | "month" | "custom";

export default function HistoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { sendFormData, isConnected } = useThirdPartyAutofill();
  const [logs, setLogs] = useState<TruckLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingLog, setEditingLog] = useState<TruckLog | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());

  // Filter state
  const [plateFilter, setPlateFilter] = useState("");
  const [driverNameFilter, setDriverNameFilter] = useState("");
  const [driverPhoneFilter, setDriverPhoneFilter] = useState("");
  const [originFilter, setOriginFilter] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [directionFilter, setDirectionFilter] =
    useState<SessionDirection>("ALL");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Applied filters (used for actual filtering)
  const [appliedPlateFilter, setAppliedPlateFilter] = useState("");
  const [appliedDriverNameFilter, setAppliedDriverNameFilter] = useState("");
  const [appliedDriverPhoneFilter, setAppliedDriverPhoneFilter] = useState("");
  const [appliedOriginFilter, setAppliedOriginFilter] = useState("");
  const [appliedDestinationFilter, setAppliedDestinationFilter] = useState("");
  const [appliedProductFilter, setAppliedProductFilter] = useState("");
  const [appliedDirectionFilter, setAppliedDirectionFilter] =
    useState<SessionDirection>("ALL");
  const [appliedStartDate, setAppliedStartDate] = useState<string | null>(null);
  const [appliedEndDate, setAppliedEndDate] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;

  // Check authentication on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/user");
        if (!response.ok) {
          router.push("/login");
          return;
        }
        setIsCheckingAuth(false);
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/login");
      }
    }

    checkAuth();
  }, [router]);

  // Load logs
  const loadLogs = async (page: number = 1) => {
    if (isCheckingAuth) return;

    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`/api/logs?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch logs");
      }

      const data = await response.json();
      let filteredLogs = data.logs || [];

      // Apply client-side filters
      if (appliedPlateFilter) {
        filteredLogs = filteredLogs.filter((log: TruckLog) =>
          log.plate.toLowerCase().includes(appliedPlateFilter.toLowerCase())
        );
      }
      if (appliedDriverNameFilter) {
        filteredLogs = filteredLogs.filter(
          (log: TruckLog) =>
            log.driverName
              ?.toLowerCase()
              .includes(appliedDriverNameFilter.toLowerCase()) || false
        );
      }
      if (appliedDriverPhoneFilter) {
        // Note: Driver phone might not be directly in log, checking if available
        filteredLogs = filteredLogs.filter((log: TruckLog) => {
          // Check if there's a driverPhone field or similar in the log
          const driverPhone = (log as any).driverPhone || "";
          return driverPhone
            .toLowerCase()
            .includes(appliedDriverPhoneFilter.toLowerCase());
        });
      }
      if (appliedOriginFilter) {
        filteredLogs = filteredLogs.filter(
          (log: TruckLog) =>
            log.origin
              ?.toLowerCase()
              .includes(appliedOriginFilter.toLowerCase()) || false
        );
      }
      if (appliedDestinationFilter) {
        filteredLogs = filteredLogs.filter(
          (log: TruckLog) =>
            log.destination
              ?.toLowerCase()
              .includes(appliedDestinationFilter.toLowerCase()) || false
        );
      }
      if (appliedProductFilter) {
        filteredLogs = filteredLogs.filter(
          (log: TruckLog) =>
            log.cargoType
              ?.toLowerCase()
              .includes(appliedProductFilter.toLowerCase()) || false
        );
      }
      if (appliedDirectionFilter !== "ALL") {
        filteredLogs = filteredLogs.filter(
          (log: TruckLog) => log.direction === appliedDirectionFilter
        );
      }
      if (appliedStartDate || appliedEndDate) {
        filteredLogs = filteredLogs.filter((log: TruckLog) => {
          const logDate = new Date(log.createdAt);
          if (appliedStartDate && logDate < new Date(appliedStartDate))
            return false;
          if (appliedEndDate) {
            const endDate = new Date(appliedEndDate);
            endDate.setHours(23, 59, 59, 999);
            if (logDate > endDate) return false;
          }
          return true;
        });
      }

      setLogs(filteredLogs);
      setTotal(filteredLogs.length);
      setTotalPages(Math.ceil(filteredLogs.length / limit));
      setCurrentPage(page);
    } catch (error) {
      console.error("Error loading logs:", error);
      setError(error instanceof Error ? error.message : "Failed to load logs");
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load logs when filters or page changes
  useEffect(() => {
    loadLogs(currentPage);
  }, [
    isCheckingAuth,
    appliedPlateFilter,
    appliedDriverNameFilter,
    appliedDriverPhoneFilter,
    appliedOriginFilter,
    appliedDestinationFilter,
    appliedProductFilter,
    appliedDirectionFilter,
    appliedStartDate,
    appliedEndDate,
    currentPage,
  ]);

  const getDateRange = (
    period: TimePeriod
  ): { start: string | null; end: string | null } => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (period) {
      case "today":
        return {
          start: today.toISOString(),
          end: new Date(
            today.getTime() + 24 * 60 * 60 * 1000 - 1
          ).toISOString(),
        };
      case "week":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        return {
          start: weekStart.toISOString(),
          end: new Date(
            weekStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1
          ).toISOString(),
        };
      case "month":
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
        return {
          start: monthStart.toISOString(),
          end: monthEnd.toISOString(),
        };
      case "custom":
        return {
          start: customStartDate
            ? new Date(customStartDate).toISOString()
            : null,
          end: customEndDate
            ? new Date(customEndDate + "T23:59:59").toISOString()
            : null,
        };
      default:
        return { start: null, end: null };
    }
  };

  const handleApplyFilters = () => {
    setAppliedPlateFilter(plateFilter);
    setAppliedDriverNameFilter(driverNameFilter);
    setAppliedDriverPhoneFilter(driverPhoneFilter);
    setAppliedOriginFilter(originFilter);
    setAppliedDestinationFilter(destinationFilter);
    setAppliedProductFilter(productFilter);
    setAppliedDirectionFilter(directionFilter);

    const dateRange = getDateRange(timePeriod);
    setAppliedStartDate(dateRange.start);
    setAppliedEndDate(dateRange.end);

    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setPlateFilter("");
    setDriverNameFilter("");
    setDriverPhoneFilter("");
    setOriginFilter("");
    setDestinationFilter("");
    setProductFilter("");
    setDirectionFilter("ALL");
    setTimePeriod("all");
    setCustomStartDate("");
    setCustomEndDate("");

    setAppliedPlateFilter("");
    setAppliedDriverNameFilter("");
    setAppliedDriverPhoneFilter("");
    setAppliedOriginFilter("");
    setAppliedDestinationFilter("");
    setAppliedProductFilter("");
    setAppliedDirectionFilter("ALL");
    setAppliedStartDate(null);
    setAppliedEndDate(null);

    setCurrentPage(1);
  };

  const handleEdit = (log: TruckLog) => {
    setEditingLog(log);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingLog(null);
    loadLogs(currentPage);
  };

  const handleDownloadPDF = async (log: TruckLog) => {
    try {
      await exportLogToPDF(log);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Алдаа",
        description: "PDF файл татахад алдаа гарлаа",
        variant: "destructive",
      });
    }
  };

  const handleSend = async (log: TruckLog) => {
    setSendingIds((prev) => new Set(prev).add(log.id));
    try {
      // Check if WebSocket is connected
      if (!isConnected) {
        toast({
          title: "Алдаа",
          description:
            "3-р талын програмтай холбогдоогүй байна. Тохиргоо хэсэгт холбогдоно уу.",
          variant: "destructive",
        });
        return;
      }

      // Find the corresponding session to get the uniqueCode (AKT)
      const sessionsResponse = await fetch(
        `/api/truck-sessions?direction=${
          log.direction
        }&plateNumber=${encodeURIComponent(log.plate)}&limit=10`
      );

      if (!sessionsResponse.ok) {
        throw new Error("Failed to find session");
      }

      const sessionsData = await sessionsResponse.json();
      // Find session that matches the log's date/time (closest match)
      const session =
        sessionsData.sessions?.find((s: any) => {
          const sessionDate = new Date(s.createdAt);
          const logDate = new Date(log.createdAt);
          // Match if within 1 hour of each other
          return Math.abs(sessionDate.getTime() - logDate.getTime()) < 3600000;
        }) || sessionsData.sessions?.[0]; // Fallback to first session

      if (!session || !session.uniqueCode) {
        toast({
          title: "Алдаа",
          description: "Холбогдох сессийн мэдээлэл олдсонгүй",
          variant: "destructive",
        });
        return;
      }

      // Get product name if productId exists
      let productName = log.cargoType || "";
      if (log.cargoType && !productName) {
        try {
          const productsResponse = await fetch("/api/products");
          if (productsResponse.ok) {
            const products = await productsResponse.json();
            const product = products.find(
              (p: any) => p.label === log.cargoType
            );
            if (product) productName = product.label;
          }
        } catch (e) {
          // Ignore error
        }
      }

      // Get transport company name if transportCompanyId exists
      let transportCompanyName = "";
      if (log.transportCompanyId) {
        try {
          const companiesResponse = await fetch("/api/transport-companies");
          if (companiesResponse.ok) {
            const companies = await companiesResponse.json();
            const company = companies.find(
              (c: any) => c.id === log.transportCompanyId
            );
            if (company) transportCompanyName = company.name;
          }
        } catch (e) {
          // Ignore error
        }
      }

      // Send to 3rd party app using the session data
      const formDataForThirdParty = {
        aktNumber: session.uniqueCode,
        uniqueCode: session.uniqueCode,
        plateNumber: log.plate,
        driverName: log.driverName || "",
        product: productName,
        transporterCompany: transportCompanyName,
        origin: log.origin || "",
        destination: log.destination || "",
        grossWeightKg: log.weightKg || 0,
        netWeightKg: log.netWeightKg || 0,
        trailerNumber: log.trailerPlate || "",
        sealNumber: log.sealNumber || "",
      };

      const result = await sendFormData(formDataForThirdParty);

      if (result.success) {
        toast({
          title: "Амжилттай",
          description: "3-р талын програм руу илгээгдлээ",
        });
        loadLogs(currentPage);
      } else {
        toast({
          title: "Алдаа",
          description: "3-р талын програм руу илгээхэд алдаа гарлаа",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending log:", error);
      toast({
        title: "Алдаа",
        description:
          error instanceof Error
            ? error.message
            : "3-р талын програм руу илгээхэд алдаа гарлаа",
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

  const formatDate = (date: Date | string) => {
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      if (isNaN(d.getTime())) {
        return "Invalid date";
      }
      return d.toLocaleString("mn-MN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Уншиж байна...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AlertBanner />
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1920px] mx-auto p-6 lg:p-8">
            <Card className="border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 mb-1">
                      Тээврийн хэрэгслийн түүх
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      Бүх тээврийн хэрэгслийн орох/гарах бүртгэлийн мэдээлэл
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Filter Bar */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">
                        Хайлт ба шүүлт
                      </span>
                    </div>
                    {(plateFilter ||
                      driverNameFilter ||
                      driverPhoneFilter ||
                      originFilter ||
                      destinationFilter ||
                      productFilter ||
                      directionFilter !== "ALL" ||
                      timePeriod !== "all") && (
                      <Button
                        onClick={handleClearFilters}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        Цэвэрлэх
                      </Button>
                    )}
                  </div>

                  {/* First row of filters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <SearchInput
                      placeholder="Улсын дугаар хайх..."
                      value={plateFilter}
                      onChange={(e) => setPlateFilter(e.target.value)}
                      onEnter={handleApplyFilters}
                    />
                    <SearchInput
                      placeholder="Жолоочийн нэр хайх..."
                      value={driverNameFilter}
                      onChange={(e) => setDriverNameFilter(e.target.value)}
                      onEnter={handleApplyFilters}
                    />
                    <SearchInput
                      placeholder="Жолоочийн утас хайх..."
                      value={driverPhoneFilter}
                      onChange={(e) => setDriverPhoneFilter(e.target.value)}
                      onEnter={handleApplyFilters}
                    />
                  </div>

                  {/* Second row of filters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <SearchInput
                      placeholder="Хаанаас хайх..."
                      value={originFilter}
                      onChange={(e) => setOriginFilter(e.target.value)}
                      onEnter={handleApplyFilters}
                    />
                    <SearchInput
                      placeholder="Хаашаа хайх..."
                      value={destinationFilter}
                      onChange={(e) => setDestinationFilter(e.target.value)}
                      onEnter={handleApplyFilters}
                    />
                    <SearchInput
                      placeholder="Бүтээгдэхүүн хайх..."
                      value={productFilter}
                      onChange={(e) => setProductFilter(e.target.value)}
                      onEnter={handleApplyFilters}
                    />
                  </div>

                  {/* Third row: Direction, Time Period, Apply Button */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 whitespace-nowrap">
                        Чиглэл:
                      </span>
                      <Select
                        value={directionFilter}
                        onValueChange={(value) =>
                          setDirectionFilter(value as SessionDirection)
                        }
                      >
                        <SelectTrigger className="w-full bg-white border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">Бүх чиглэл</SelectItem>
                          <SelectItem value="IN">Зөвхөн ОРОХ</SelectItem>
                          <SelectItem value="OUT">Зөвхөн ГАРАХ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <Select
                        value={timePeriod}
                        onValueChange={(value) =>
                          setTimePeriod(value as TimePeriod)
                        }
                      >
                        <SelectTrigger className="w-full bg-white border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Бүх хугацаа</SelectItem>
                          <SelectItem value="today">Өнөөдөр</SelectItem>
                          <SelectItem value="week">Энэ долоо хоног</SelectItem>
                          <SelectItem value="month">Энэ сар</SelectItem>
                          <SelectItem value="custom">Тусгай хугацаа</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleApplyFilters}
                      className="bg-blue-600 text-white hover:bg-blue-700 w-full lg:col-span-2"
                    >
                      Шүүлт хэрэглэх
                    </Button>
                  </div>
                  {timePeriod === "custom" && (
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                      <span className="text-sm text-gray-600 whitespace-nowrap">
                        Огнооны хүрээ:
                      </span>
                      <Input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full sm:w-[150px] bg-white border-gray-300"
                        placeholder="Эхлэх огноо"
                      />
                      <span className="text-sm text-gray-500">-</span>
                      <Input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full sm:w-[150px] bg-white border-gray-300"
                        placeholder="Дуусах огноо"
                      />
                    </div>
                  )}
                </div>
              </CardHeader>

              <Separator />

              <CardContent className="pt-6">
                {error ? (
                  <div className="text-center py-12">
                    <p className="text-red-600 font-medium mb-2">
                      Алдаа гарлаа
                    </p>
                    <p className="text-sm text-gray-500">{error}</p>
                    <Button
                      onClick={() => loadLogs(currentPage)}
                      className="mt-4"
                      variant="outline"
                    >
                      Дахин оролдох
                    </Button>
                  </div>
                ) : isLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Түүх уншиж байна...</p>
                  </div>
                ) : logs.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-base font-medium mb-1">
                      Бүртгэл олдсонгүй
                    </p>
                    <p className="text-sm text-gray-400">
                      Хайлтын үр дүнд тохирох бүртгэл байхгүй байна.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          Нийт бүртгэл:
                        </span>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {total}
                        </Badge>
                      </div>
                    </div>
                    <Separator />

                    {/* Table */}
                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="text-gray-700 font-semibold">
                              Чиглэл
                            </TableHead>
                            <TableHead className="text-gray-700 font-semibold">
                              Улсын дугаар
                            </TableHead>
                            <TableHead className="text-gray-700 font-semibold">
                              Жолооч
                            </TableHead>
                            <TableHead className="text-gray-700 font-semibold">
                              Бүтээгдэхүүн
                            </TableHead>
                            <TableHead className="text-gray-700 font-semibold">
                              Жин (кг)
                            </TableHead>
                            <TableHead className="text-gray-700 font-semibold">
                              Хаанаас
                            </TableHead>
                            <TableHead className="text-gray-700 font-semibold">
                              Хаашаа
                            </TableHead>
                            <TableHead className="text-gray-700 font-semibold">
                              Үүсгэсэн огноо
                            </TableHead>
                            <TableHead className="text-gray-700 font-semibold">
                              Төлөв
                            </TableHead>
                            <TableHead className="text-gray-700 font-semibold">
                              Үйлдлүүд
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {logs.map((log) => (
                            <TableRow
                              key={log.id}
                              className="hover:bg-gray-50 even:bg-gray-50/50"
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
                              <TableCell className="text-gray-700">
                                {log.driverName || "—"}
                              </TableCell>
                              <TableCell className="text-gray-700 capitalize">
                                {log.cargoType || "—"}
                              </TableCell>
                              <TableCell className="text-gray-700 font-medium">
                                {log.weightKg?.toLocaleString() || "—"}
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
                              <TableCell>
                                {log.sentToCustoms ? (
                                  <Badge className="bg-green-50 text-green-700 border-green-200">
                                    Гаалинд илгээсэн
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="bg-amber-50 text-amber-700 border-amber-200"
                                  >
                                    Зөвхөн хадгалсан
                                  </Badge>
                                )}
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
                                    {log.sentToCustoms
                                      ? "Дахин засах"
                                      : "Засах"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDownloadPDF(log)}
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
                                      onClick={() => handleSend(log)}
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
                                      onClick={() => handleSend(log)}
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
                      <div className="flex items-center justify-between pt-4">
                        <div className="text-sm text-gray-600">
                          Хуудас {currentPage} / {totalPages} (Нийт: {total})
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(1, prev - 1))
                            }
                            disabled={currentPage === 1 || isLoading}
                            className="border-gray-300 hover:bg-gray-50"
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Өмнөх
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(totalPages, prev + 1)
                              )
                            }
                            disabled={currentPage === totalPages || isLoading}
                            className="border-gray-300 hover:bg-gray-50"
                          >
                            Дараах
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <EditLogDialog
        log={editingLog}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
