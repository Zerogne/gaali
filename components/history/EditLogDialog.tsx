"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { FilterableSelect } from "@/components/ui/filterable-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { sendTruckLogToCustoms } from "@/lib/api";
import type {
  Driver,
  Organization,
  TransportCompany,
  TruckLog,
} from "@/lib/types";
import { Loader2, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface Product {
  value: string;
  label: string;
}

interface EditLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: TruckLog | null;
  onSave: () => void;
}

type Direction = "IN" | "OUT";

export function EditLogDialog({
  open,
  onOpenChange,
  log,
  onSave,
}: EditLogDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Form state
  const [plate, setPlate] = useState("");
  const [driverId, setDriverId] = useState("");
  const [driverName, setDriverName] = useState("");
  const [cargoType, setCargoType] = useState("");
  const [weight, setWeight] = useState("");
  const [inWeight, setInWeight] = useState("");
  const [outWeight, setOutWeight] = useState("");
  const [netWeight, setNetWeight] = useState("");
  const [comments, setComments] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [senderOrganizationId, setSenderOrganizationId] = useState<string>("");
  const [receiverOrganizationId, setReceiverOrganizationId] =
    useState<string>("");
  const [transportCompanyId, setTransportCompanyId] = useState("");
  const [sealNumber, setSealNumber] = useState("");
  const [bagQuantity, setBagQuantity] = useState("");
  const [bagQuantityOut, setBagQuantityOut] = useState("");
  const [hasTrailer, setHasTrailer] = useState(false);
  const [trailerPlate, setTrailerPlate] = useState("");
  const [direction, setDirection] = useState<Direction>("IN");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fullLog, setFullLog] = useState<TruckLog | null>(null);
  const [isLoadingLog, setIsLoadingLog] = useState(false);

  // Data loading state
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [transportCompanies, setTransportCompanies] = useState<
    TransportCompany[]
  >([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(false);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Load drivers
  useEffect(() => {
    async function loadDrivers() {
      setIsLoadingDrivers(true);
      try {
        const response = await fetch("/api/drivers");
        if (response.ok) {
          const data = await response.json();
          // API returns array directly, not wrapped in drivers property
          setDrivers(Array.isArray(data) ? data : (data.drivers || []));
        }
      } catch (error) {
        console.error("Error loading drivers:", error);
      } finally {
        setIsLoadingDrivers(false);
      }
    }
    loadDrivers();
  }, []);

  // Load transport companies
  useEffect(() => {
    async function loadCompanies() {
      setIsLoadingCompanies(true);
      try {
        const response = await fetch("/api/transport-companies");
        if (response.ok) {
          const data = await response.json();
          // API returns array directly, not wrapped in companies property
          setTransportCompanies(Array.isArray(data) ? data : (data.companies || []));
        }
      } catch (error) {
        console.error("Error loading companies:", error);
      } finally {
        setIsLoadingCompanies(false);
      }
    }
    loadCompanies();
  }, []);

  // Load organizations
  useEffect(() => {
    async function loadOrganizations() {
      setIsLoadingOrganizations(true);
      try {
        const response = await fetch("/api/organizations");
        if (response.ok) {
          const data = await response.json();
          // API returns array directly, not wrapped in organizations property
          setOrganizations(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error loading organizations:", error);
      } finally {
        setIsLoadingOrganizations(false);
      }
    }
    loadOrganizations();
  }, []);

  // Load products
  useEffect(() => {
    async function loadProducts() {
      setIsLoadingProducts(true);
      try {
        const response = await fetch("/api/products");
        if (response.ok) {
          const data = await response.json();
          // API returns array directly, not wrapped in products property
          setProducts(Array.isArray(data) ? data : (data.products || []));
        }
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    loadProducts();
  }, []);

  const organizationOptions = useMemo(() => {
    return organizations.map((org) => ({
      value: org.id,
      label: org.name,
    }));
  }, [organizations]);

  /** Extract weights from log - supports totalInWeight/totalOutWeight/netWeight and alternate DB spellings (e.g. TotalOutweight) */
  const getWeightsFromLog = (l: TruckLog) => {
    const raw = l as any;
    const ti = raw.totalInWeight ?? raw.TotalInWeight ?? raw.totalinweight ?? undefined;
    const to = raw.totalOutWeight ?? raw.TotalOutWeight ?? raw.TotalOutweight ?? raw.totaloutweight ?? undefined;
    const nw = raw.netWeight ?? raw.NetWeight ?? l.netWeightKg;
    const wkg = l.weightKg;
    const hasOut = (nw != null || to != null) && l.direction === "IN";
    return {
      totalInWeight: ti ?? (hasOut && to != null && nw != null ? to + Math.abs(nw) : wkg),
      totalOutWeight: to ?? (hasOut ? wkg : l.direction === "OUT" ? wkg : undefined),
      netWeight: nw != null ? Math.abs(nw) : undefined,
    };
  };

  /** Populate entire form from a log (used after fetching full log from API) */
  const populateFormFromLog = (l: TruckLog) => {
    setPlate(l.plate || "");
    setDriverId(l.driverId || "");
    setDriverName(l.driverName || "");
    let productIdForSelect = "";
    if ((l as any).productId) {
      const productExists = products.find((p: Product) => p.value === (l as any).productId);
      productIdForSelect = productExists ? productExists.value : "";
      if (!productIdForSelect && l.cargoType && products.length > 0) {
        const matched = products.find((p: Product) => p.label === l.cargoType);
        if (matched) productIdForSelect = matched.value;
      }
    } else if (l.cargoType) {
      const labelMatch = products.find((p: Product) => p.label === l.cargoType);
      const valueMatch = products.find((p: Product) => p.value === l.cargoType);
      productIdForSelect = labelMatch?.value ?? valueMatch?.value ?? l.cargoType;
    }
    setCargoType(productIdForSelect);
    setComments(l.comments || "");
    setOrigin(l.origin || "");
    setDestination(l.destination || "");
    setSenderOrganizationId(l.senderOrganizationId || "");
    setReceiverOrganizationId(l.receiverOrganizationId || "");
    setTransportCompanyId(l.transportCompanyId || "");
    setSealNumber(l.sealNumber || "");
    setBagQuantity(l.bagQuantity ?? "");
    setBagQuantityOut(l.bagQuantityOut ?? "");
    setHasTrailer(l.hasTrailer || false);
    setTrailerPlate(l.trailerPlate || "");
    setDirection(l.direction);

    const { totalInWeight, totalOutWeight, netWeight } = getWeightsFromLog(l);
    const hasOutData = (l as any).netWeight != null || l.netWeightKg != null;
    const isCombined = hasOutData && l.direction === "IN";

    if (isCombined) {
      setInWeight(totalInWeight != null ? String(totalInWeight) : "");
      setOutWeight(totalOutWeight != null ? String(totalOutWeight) : "");
      setWeight(totalOutWeight != null ? String(totalOutWeight) : "");
      setNetWeight(netWeight != null ? String(netWeight) : "");
    } else {
      const singleWeight = l.direction === "IN" ? totalInWeight : totalOutWeight;
      setWeight(singleWeight != null ? String(singleWeight) : (l.weightKg != null ? String(l.weightKg) : ""));
      setNetWeight(netWeight != null ? String(netWeight) : "");
      setInWeight("");
      setOutWeight("");
    }
    setErrors({});
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFullLog(null);
      setPlate("");
      setDriverId("");
      setDriverName("");
      setCargoType("");
      setWeight("");
      setInWeight("");
      setOutWeight("");
      setNetWeight("");
      setComments("");
      setOrigin("");
      setDestination("");
      setSenderOrganizationId("");
      setReceiverOrganizationId("");
      setTransportCompanyId("");
      setSealNumber("");
      setBagQuantity("");
      setBagQuantityOut("");
      setHasTrailer(false);
      setTrailerPlate("");
      setErrors({});
    }
  }, [open]);

  // Fetch full log from API when dialog opens - single source of truth (reflects DB changes)
  useEffect(() => {
    if (!open || !log?.id) return;

    const controller = new AbortController();
    setIsLoadingLog(true);
    setFullLog(null);

    fetch(`/api/logs/${log.id}`, { signal: controller.signal, cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const fetched = data?.log as TruckLog | undefined;
        if (!fetched) return;
        setFullLog(fetched);
        populateFormFromLog(fetched);
      })
      .catch(() => {
        // Fallback: use prop log if fetch fails
        if (log) populateFormFromLog(log);
      })
      .finally(() => setIsLoadingLog(false));

    return () => controller.abort();
  }, [open, log?.id]);

  // Re-populate product/cargoType when products load (fullLog may have been set before products arrived)
  useEffect(() => {
    if (fullLog && products.length > 0) {
      let productIdForSelect = "";
      if ((fullLog as any).productId) {
        const productExists = products.find((p: Product) => p.value === (fullLog as any).productId);
        productIdForSelect = productExists ? productExists.value : "";
        if (!productIdForSelect && fullLog.cargoType) {
          const matched = products.find((p: Product) => p.label === fullLog.cargoType);
          if (matched) productIdForSelect = matched.value;
        }
      } else if (fullLog.cargoType) {
        const labelMatch = products.find((p: Product) => p.label === fullLog.cargoType);
        const valueMatch = products.find((p: Product) => p.value === fullLog.cargoType);
        productIdForSelect = labelMatch?.value ?? valueMatch?.value ?? fullLog.cargoType;
      }
      setCargoType(productIdForSelect);
    }
  }, [fullLog, products]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!log) return;

    setIsSaving(true);
    setErrors({});

    try {
      const hasOutData = (fullLog ?? log).netWeightKg !== undefined && (fullLog ?? log).netWeightKg !== null ||
        ((fullLog ?? log) as any).netWeight != null;
      const isCombinedLog = hasOutData && direction === "IN";

      // Find product label from productId (cargoType contains productId)
      let cargoTypeLabel = cargoType.trim() || "Бусад";
      if (cargoType && products.length > 0) {
        const selectedProduct = products.find((p: Product) => p.value === cargoType);
        if (selectedProduct) {
          cargoTypeLabel = selectedProduct.label;
        }
      }
      
      // Find driver name from driverId if driverName is empty
      let finalDriverName = driverName.trim();
      if (!finalDriverName && driverId && drivers.length > 0) {
        const selectedDriver = drivers.find((d) => d.id === driverId);
        if (selectedDriver) {
          finalDriverName = selectedDriver.name;
        }
      }
      if (!finalDriverName) {
        finalDriverName = "Тодорхойгүй";
      }
      
      const outW = isCombinedLog && outWeight ? Number(outWeight) : (direction === "OUT" ? Number(weight) : undefined);
      const inW = isCombinedLog && inWeight ? Number(inWeight) : (direction === "IN" ? Number(weight) : undefined);
      const netW = (direction === "OUT" || isCombinedLog) && netWeight ? Number(netWeight) : undefined;

      const response = await fetch(`/api/logs/${log.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plate: plate.trim(),
          driverId: driverId || undefined,
          driverName: finalDriverName,
          cargoType: cargoTypeLabel,
          productId: cargoType || undefined,
          totalInWeight: inW,
          totalOutWeight: outW,
          netWeight: netW,
          weightKg: outW ?? inW,
          netWeightKg: netW,
          comments: comments.trim() || undefined,
          origin: origin.trim() || undefined,
          destination: destination.trim() || undefined,
          senderOrganizationId: senderOrganizationId || undefined,
          receiverOrganizationId: receiverOrganizationId || undefined,
          transportCompanyId: transportCompanyId || undefined,
          sealNumber: sealNumber.trim() || undefined,
          bagQuantity: bagQuantity.trim() || undefined,
          bagQuantityOut: bagQuantityOut.trim() || undefined,
          hasTrailer: hasTrailer || undefined,
          trailerPlate: trailerPlate.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: "Failed to update log",
        }));
        throw new Error(errorData.error || "Failed to update log");
      }

      toast({
        title: "Амжилттай",
        description: "Бүртгэл амжилттай шинэчлэгдлээ",
      });

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating log:", error);
      toast({
        title: "Алдаа",
        description:
          error instanceof Error
            ? error.message
            : "Бүртгэл шинэчлэхэд алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSend = async () => {
    if (!log) return;

    setIsSending(true);
    try {
      await sendTruckLogToCustoms(log.id);
      toast({
        title: "Амжилттай",
        description: "Бүртгэл гаальд амжилттай илгээгдлээ",
      });
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending to customs:", error);
      toast({
        title: "Алдаа",
        description: "Гаальд илгээхэд алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!log) return null;

  const displayLog = fullLog ?? log;
  const isSentToCustoms = displayLog.sentToCustoms;
  const hasOutData = displayLog.netWeightKg != null || (displayLog as any).netWeight != null;
  const isCombinedLog = hasOutData && direction === "IN";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-6xl sm:!max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="text-xl font-semibold text-gray-900 mb-1">
          {isSentToCustoms ? "Дахин засах" : "Бүртгэл засах"}
        </DialogTitle>
        <DialogDescription className="text-sm text-gray-600 mb-4">
          {isCombinedLog
            ? "ОРОХ/ГАРАХ бүрэн бүртгэл"
            : direction === "IN"
            ? "ОРОХ бүртгэл"
            : "ГАРАХ бүртгэл"}
        </DialogDescription>

        {isSentToCustoms && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>Анхаар:</strong> Энэ бүртгэл гаальд илгээгдсэн байна. Засварласны дараа дахин илгээх шаардлагатай.
            </p>
          </div>
        )}

        {isLoadingLog ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Бүртгэл уншиж байна...</span>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">
              Үндсэн мэдээлэл
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-plate" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Улсын дугаар <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-plate"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  className="h-10 text-sm font-mono font-semibold"
                  placeholder="1234ААА"
                  required
                />
                {errors.plate && (
                  <p className="mt-1 text-xs text-red-600">{errors.plate}</p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-driver" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Жолооч <span className="text-red-500">*</span>
                </Label>
                <FilterableSelect
                  options={drivers.map((driver) => ({
                    value: driver.id,
                    label: `${driver.name}${driver.phone ? ` (${driver.phone})` : ""}`,
                  }))}
                  value={driverId}
                  onValueChange={(value) => {
                    const selectedDriver = drivers.find((d) => d.id === value);
                    setDriverId(value);
                    setDriverName(selectedDriver?.name || "");
                  }}
                  disabled={isLoadingDrivers}
                  placeholder={isLoadingDrivers ? "Уншиж байна..." : "Жолооч сонгох"}
                  searchPlaceholder="Жолооч хайх..."
                  className="h-10"
                  inDialog
                />
                {errors.driverId && (
                  <p className="mt-1 text-xs text-red-600">{errors.driverId}</p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-transport-company" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Тээврийн компани <span className="text-red-500">*</span>
                </Label>
                <FilterableSelect
                  options={transportCompanies.map((company) => ({
                    value: company.id,
                    label: company.name,
                  }))}
                  value={transportCompanyId || undefined}
                  onValueChange={(value) => {
                    setTransportCompanyId(value || "");
                  }}
                  disabled={isLoadingCompanies}
                  placeholder={isLoadingCompanies ? "Уншиж байна..." : "Тээврийн компани сонгох"}
                  searchPlaceholder="Тээврийн компани хайх..."
                  className="h-10"
                  required
                  inDialog
                />
              </div>

              <div>
                <Label htmlFor="edit-cargo" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Бүтээгдэхүүн <span className="text-red-500">*</span>
                </Label>
                <FilterableSelect
                  options={products.map((product: Product) => ({
                    value: product.value,
                    label: product.label,
                  }))}
                  value={
                    // Only set value if it exists in the options, otherwise undefined
                    (() => {
                      const isValid = cargoType && products.length > 0 && products.some((p: Product) => p.value === cargoType);
                      return isValid ? cargoType : undefined;
                    })()
                  }
                  onValueChange={(value) => {
                    setCargoType(value || "");
                  }}
                  disabled={isLoadingProducts}
                  placeholder={
                    isLoadingProducts
                      ? "Уншиж байна..."
                      : cargoType && !products.some((p: Product) => p.value === cargoType)
                      ? `Бүтээгдэхүүн сонгох (${cargoType} олдсонгүй)`
                      : "Бүтээгдэхүүн сонгох"
                  }
                  searchPlaceholder="Бүтээгдэхүүн хайх..."
                  className="h-10"
                  inDialog
                />
                {cargoType && !products.some((p: Product) => p.value === cargoType) && (
                  <p className="mt-1 text-xs text-amber-600">
                    ⚠️ "{cargoType}" бүтээгдэхүүн олдсонгүй. Шинэ бүтээгдэхүүн сонгоно уу.
                  </p>
                )}
                {errors.cargoType && (
                  <p className="mt-1 text-xs text-red-600">{errors.cargoType}</p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-origin" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Хаанаас
                </Label>
                <Input
                  id="edit-origin"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="h-10 text-sm"
                  placeholder="Гарах газар"
                />
              </div>

              <div>
                <Label htmlFor="edit-destination" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Хаашаа
                </Label>
                <Input
                  id="edit-destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="h-10 text-sm"
                  placeholder="Очих газар"
                />
              </div>

              <div>
                <Label htmlFor="edit-sender" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Илгээч байгууллага
                </Label>
                <FilterableSelect
                  options={organizationOptions}
                  value={senderOrganizationId || undefined}
                  onValueChange={(value) => setSenderOrganizationId(value || "")}
                  disabled={isLoadingOrganizations}
                  placeholder={isLoadingOrganizations ? "Уншиж байна..." : "Илгээч байгууллага сонгох"}
                  searchPlaceholder="Илгээч байгууллага хайх..."
                  className="h-10"
                  inDialog
                />
              </div>

              <div>
                <Label htmlFor="edit-receiver" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Хүлээн авагч байгууллага
                </Label>
                <FilterableSelect
                  options={organizationOptions}
                  value={receiverOrganizationId || undefined}
                  onValueChange={(value) => setReceiverOrganizationId(value || "")}
                  disabled={isLoadingOrganizations}
                  placeholder={isLoadingOrganizations ? "Уншиж байна..." : "Хүлээн авагч байгууллага сонгох"}
                  searchPlaceholder="Хүлээн авагч байгууллага хайх..."
                  className="h-10"
                  inDialog
                />
              </div>

              {(direction === "OUT" || isCombinedLog) && (
                <div>
                  <Label htmlFor="edit-seal" className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Лацны дугаар
                  </Label>
                  <Input
                    id="edit-seal"
                    value={sealNumber}
                    onChange={(e) => setSealNumber(e.target.value)}
                    className="h-10 text-sm"
                    placeholder="Лацны дугаар оруулах"
                  />
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Чиргүүл
                </Label>
                <div className="flex items-center gap-3 h-10">
                  <Checkbox
                    id="edit-has-trailer"
                    checked={hasTrailer}
                    onCheckedChange={(checked) => {
                      setHasTrailer(checked === true);
                      if (!checked) {
                        setTrailerPlate("");
                      }
                    }}
                  />
                  <Label htmlFor="edit-has-trailer" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Чиргүүлтэй
                  </Label>
                  {hasTrailer && (
                    <Input
                      id="edit-trailer-plate"
                      value={trailerPlate}
                      onChange={(e) => setTrailerPlate(e.target.value)}
                      className="h-10 text-sm font-mono flex-1 max-w-[200px]"
                      placeholder="1234ААА"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Weight and Time Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">
              Жин ба цаг
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isCombinedLog ? (
                <>
                  <div>
                    <Label htmlFor="edit-in-weight" className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Орох жин (кг) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-in-weight"
                      type="number"
                      value={inWeight}
                      onChange={(e) => {
                        setInWeight(e.target.value);
                        if (outWeight && e.target.value) {
                          const inW = Number(e.target.value);
                          const outW = Number(outWeight);
                          const netW = inW - outW;
                          if (netW >= 0) {
                            setNetWeight(netW.toString());
                          }
                        }
                      }}
                      className="h-10 text-sm font-semibold"
                      placeholder="Орох жин оруулах (кг)"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-out-weight" className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Гарах жин (кг) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-out-weight"
                      type="number"
                      value={outWeight}
                      onChange={(e) => {
                        setOutWeight(e.target.value);
                        setWeight(e.target.value);
                        if (inWeight && e.target.value) {
                          const inW = Number(inWeight);
                          const outW = Number(e.target.value);
                          const netW = inW - outW;
                          if (netW >= 0) {
                            setNetWeight(netW.toString());
                          }
                        }
                      }}
                      className="h-10 text-sm font-semibold"
                      placeholder="Гарах жин оруулах (кг)"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-net-weight" className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Цэвэр жин (кг) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-net-weight"
                      type="number"
                      value={netWeight !== null && netWeight !== undefined && netWeight !== "" ? Math.abs(Number(netWeight)) : ""}
                      readOnly
                      className="bg-gray-50 font-semibold text-sm cursor-not-allowed h-10"
                      placeholder="Цэвэр жин автоматаар тооцоологдоно"
                    />
                    {errors.netWeight && (
                      <p className="mt-1 text-xs text-red-600">{errors.netWeight}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="edit-in-time" className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Орох цаг <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-in-time"
                      type="datetime-local"
                      value={displayLog.createdAt ? new Date(displayLog.createdAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)}
                      onChange={() => {}}
                      className="h-10 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-out-time" className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Гарах цаг <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-out-time"
                      type="datetime-local"
                      value={displayLog.createdAt ? new Date(displayLog.createdAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)}
                      onChange={() => {}}
                      className="h-10 text-sm"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="edit-weight" className="text-sm font-medium text-gray-700 mb-1.5 block">
                      {direction === "IN" ? "Орох жин (кг)" : "Гарах жин (кг)"} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-weight"
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="h-10 text-sm font-semibold"
                      placeholder="Жин оруулах (кг)"
                      required
                    />
                    {errors.weight && (
                      <p className="mt-1 text-xs text-red-600">{errors.weight}</p>
                    )}
                  </div>
                  {direction === "OUT" && (
                    <div>
                      <Label htmlFor="edit-net-weight" className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Цэвэр жин (кг) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="edit-net-weight"
                        type="number"
                        value={netWeight !== null && netWeight !== undefined ? Math.abs(Number(netWeight)) : ""}
                        readOnly
                        className="bg-gray-50 font-semibold text-sm cursor-not-allowed h-10"
                        placeholder="Цэвэр жин автоматаар тооцоологдоно"
                      />
                      {errors.netWeight && (
                        <p className="mt-1 text-xs text-red-600">{errors.netWeight}</p>
                      )}
                    </div>
                  )}
                  <div>
                    <Label htmlFor="edit-time" className="text-sm font-medium text-gray-700 mb-1.5 block">
                      {direction === "IN" ? "Орох цаг" : "Гарах цаг"} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-time"
                      type="datetime-local"
                      value={displayLog.createdAt ? new Date(displayLog.createdAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)}
                      onChange={() => {}}
                      className="h-10 text-sm"
                      required
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Шуудайны тоо Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">
              Шуудайны тоо хэмжээ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(direction === "IN" || isCombinedLog) && (
                <div>
                  <Label htmlFor="edit-bag-quantity" className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Шуудайны тоо хэмжээ орсон (IN)
                  </Label>
                  <Input
                    id="edit-bag-quantity"
                    type="text"
                    value={bagQuantity}
                    onChange={(e) => setBagQuantity(e.target.value)}
                    className="h-10 text-sm"
                    placeholder="Орсон шуудайны тоо"
                  />
                </div>
              )}
              {(direction === "OUT" || isCombinedLog) && (
                <div>
                  <Label htmlFor="edit-bag-quantity-out" className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Шуудайны тоо хэмжээ гарсан (OUT)
                  </Label>
                  <Input
                    id="edit-bag-quantity-out"
                    type="text"
                    value={bagQuantityOut}
                    onChange={(e) => setBagQuantityOut(e.target.value)}
                    className="h-10 text-sm"
                    placeholder="Гарсан шуудайны тоо"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">
              Нэмэлт мэдээлэл
            </h3>
            <div>
              <Label htmlFor="edit-comments" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Тэмдэглэл
              </Label>
              <Textarea
                id="edit-comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="text-sm resize-none"
                placeholder="Нэмэлт мэдээлэл..."
                rows={4}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving || isSending}
            >
              Цуцлах
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSend}
              disabled={isSaving || isSending || !log}
              className="bg-green-500 text-white border-green-600 hover:bg-green-600 disabled:bg-green-300 disabled:text-white"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Илгээж байна...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {log?.sentToCustoms ? "Дахин илгээх" : "Гаальд илгээх"}
                </>
              )}
            </Button>
            <Button
              type="submit"
              disabled={isSaving || isSending}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Хадгалж байна...
                </>
              ) : (
                "Өөрчлөлт хадгалах"
              )}
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
