"use client";

import { DriverManager } from "@/components/drivers/DriverManager";
import { CameraPanel } from "@/components/sessions/CameraPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Camera, CheckCircle2, Loader2, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface Product {
  id: string;
  value: string;
  label: string;
  isCustom: boolean;
}

interface EditLogDialogProps {
  log: TruckLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditLogDialog({
  log,
  open,
  onOpenChange,
  onSuccess,
}: EditLogDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [transportCompanies, setTransportCompanies] = useState<
    TransportCompany[]
  >([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state (matching TruckSection structure)
  const [plate, setPlate] = useState("");
  const [driverId, setDriverId] = useState<string>("");
  const [driverName, setDriverName] = useState("");
  const [cargoType, setCargoType] = useState("");
  const [weight, setWeight] = useState("");
  const [netWeight, setNetWeight] = useState(""); // Цэвэр жин (net weight) - only for OUT
  const [comments, setComments] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [senderOrganizationId, setSenderOrganizationId] = useState<string>("");
  const [receiverOrganizationId, setReceiverOrganizationId] =
    useState<string>("");
  const [transportCompanyId, setTransportCompanyId] = useState<string>("");
  const [sealNumber, setSealNumber] = useState("");
  const [hasTrailer, setHasTrailer] = useState(false);
  const [trailerPlate, setTrailerPlate] = useState("");
  const [direction, setDirection] = useState<"IN" | "OUT">("IN");

  // Load all data on mount
  useEffect(() => {
    async function loadData() {
      // Load products
      try {
        setIsLoadingProducts(true);
        const response = await fetch("/api/products");
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsLoadingProducts(false);
      }

      // Load transport companies
      try {
        setIsLoadingCompanies(true);
        const response = await fetch("/api/transport-companies");
        if (response.ok) {
          const data = await response.json();
          setTransportCompanies(data);
        }
      } catch (error) {
        console.error("Error loading transport companies:", error);
      } finally {
        setIsLoadingCompanies(false);
      }

      // Load drivers
      try {
        setIsLoadingDrivers(true);
        const response = await fetch("/api/drivers");
        if (response.ok) {
          const data = await response.json();
          setDrivers(data);
        }
      } catch (error) {
        console.error("Error loading drivers:", error);
      } finally {
        setIsLoadingDrivers(false);
      }

      // Load organizations (shared pool)
      try {
        setIsLoadingOrganizations(true);
        const response = await fetch("/api/organizations");
        if (response.ok) {
          const data = await response.json();
          setOrganizations(data);
        }
      } catch (error) {
        console.error("Error loading organizations:", error);
      } finally {
        setIsLoadingOrganizations(false);
      }
    }

    loadData();
  }, []);

  const handleProductAdded = () => {
    async function reloadProducts() {
      try {
        const response = await fetch("/api/products");
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Error reloading products:", error);
      }
    }
    reloadProducts();
  };

  const handleCompanyAdded = () => {
    async function reloadCompanies() {
      try {
        const response = await fetch("/api/transport-companies");
        if (response.ok) {
          const data = await response.json();
          setTransportCompanies(data);
        }
      } catch (error) {
        console.error("Error reloading companies:", error);
      }
    }
    reloadCompanies();
  };

  const handleDriverAdded = () => {
    async function reloadDrivers() {
      try {
        const response = await fetch("/api/drivers");
        if (response.ok) {
          const data = await response.json();
          setDrivers(data);
        }
      } catch (error) {
        console.error("Error reloading drivers:", error);
      }
    }
    reloadDrivers();
  };

  const handleOrganizationAdded = () => {
    async function reloadOrganizations() {
      try {
        const response = await fetch("/api/organizations");
        if (response.ok) {
          const data = await response.json();
          setOrganizations(data);
        }
      } catch (error) {
        console.error("Error reloading organizations:", error);
      }
    }
    reloadOrganizations();
  };

  // Handle creating a new organization (shared for both sender and receiver)
  const handleCreateOrganization = async (
    name: string
  ): Promise<string | null> => {
    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          // Organization already exists, try to find it
          const existingResponse = await fetch("/api/organizations");
          if (existingResponse.ok) {
            const orgs = await existingResponse.json();
            const existing = orgs.find(
              (org: Organization) =>
                org.name.toLowerCase() === name.trim().toLowerCase()
            );
            if (existing) {
              handleOrganizationAdded();
              return existing.id;
            }
          }
        }
        toast({
          title: "Алдаа",
          description: errorData.error || "Байгууллага нэмэхэд алдаа гарлаа",
          variant: "destructive",
        });
        return null;
      }

      const newOrg = await response.json();
      handleOrganizationAdded();
      toast({
        title: "Амжилттай",
        description: `"${newOrg.name}" байгууллага нэмэгдлээ`,
      });
      return newOrg.id;
    } catch (error) {
      console.error("Error creating organization:", error);
      toast({
        title: "Алдаа",
        description: "Байгууллага нэмэхэд алдаа гарлаа",
        variant: "destructive",
      });
      return null;
    }
  };

  // Initialize form data when log changes
  useEffect(() => {
    if (log) {
      setPlate(log.plate || "");
      setDriverId(log.driverId || "");
      setDriverName(log.driverName || "");
      setCargoType(log.cargoType || "");
      setWeight(log.weightKg?.toString() || "");
      setNetWeight(log.netWeightKg?.toString() || "");
      setComments(log.comments || "");
      setOrigin(log.origin || "");
      setDestination(log.destination || "");
      setSenderOrganizationId(log.senderOrganizationId || "");
      setReceiverOrganizationId(log.receiverOrganizationId || "");
      setTransportCompanyId(log.transportCompanyId || "");
      setSealNumber(log.sealNumber || "");
      setHasTrailer(log.hasTrailer || false);
      setTrailerPlate(log.trailerPlate || "");
      setDirection(log.direction);
      setErrors({});
    }
  }, [log]);

  // Auto-calculate net weight for OUT direction
  useEffect(() => {
    if (direction === "OUT" && weight && plate && Number(weight) > 0) {
      async function calculateNetWeight() {
        try {
          // Fetch logs to find the IN log for this plate
          const response = await fetch("/api/logs?page=1&limit=100");
          if (response.ok) {
            const data = await response.json();
            const logs = data.logs || [];

            // Find the most recent IN log for the same plate (excluding current log if editing)
            const inLog = logs
              .filter(
                (logItem: TruckLog) =>
                  logItem.direction === "IN" &&
                  logItem.plate.trim().toUpperCase() ===
                    plate.trim().toUpperCase() &&
                  logItem.weightKg &&
                  logItem.weightKg > 0 &&
                  (!log || logItem.id !== log.id) // Exclude current log if editing
              )
              .sort(
                (a: TruckLog, b: TruckLog) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )[0];

            if (inLog && inLog.weightKg) {
              const outWeight = Number(weight);
              const inWeight = inLog.weightKg;
              // Calculate net weight: IN weight - OUT weight (cargo weight unloaded)
              const calculatedNetWeight = inWeight - outWeight;

              // Never show negative net weight - show 0 or empty instead
              const displayNetWeight =
                calculatedNetWeight < 0 ? 0 : Math.round(calculatedNetWeight);
              setNetWeight(displayNetWeight.toString());
            } else {
              // If no IN log found, keep existing netWeight if it exists, otherwise clear it
              if (!log?.netWeightKg) {
                setNetWeight("");
              }
            }
          }
        } catch (error) {
          console.error("Error calculating net weight:", error);
          // Keep existing netWeight if it exists
          if (!log?.netWeightKg) {
            setNetWeight("");
          }
        }
      }

      calculateNetWeight();
    } else if (direction === "IN" || !weight || !plate || Number(weight) <= 0) {
      setNetWeight("");
    }
  }, [direction, weight, plate, log]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!plate.trim()) {
      newErrors.plate = "Улсын дугаар заавал оруулна.";
    }
    if (!driverId) {
      newErrors.driverId = "Жолооч сонгох заавал оруулна.";
    }
    if (!cargoType.trim()) {
      newErrors.cargoType = "Бүтээгдэхүүний төрөл заавал оруулна.";
    }
    if (!weight.trim()) {
      newErrors.weight = "Жин заавал оруулна.";
    } else if (isNaN(Number(weight)) || Number(weight) <= 0) {
      newErrors.weight = "Жин эерэг тоо байх ёстой.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Memoize organization options to prevent infinite re-renders (must be before conditional return)
  const organizationOptions = useMemo(
    () =>
      organizations.map((org) => ({
        value: org.id,
        label: org.name,
      })),
    [organizations]
  );

  const handleSend = async () => {
    if (!log) {
      toast({
        title: "Алдаа",
        description: "Бүртгэл олдсонгүй",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const result = await sendTruckLogToCustoms(log.id);

      if (result.success) {
        toast({
          title: "Амжилттай",
          description: "Мэдээлэл Монголын гаалинд амжилттай илгээгдлээ",
        });
        onSuccess();
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
      setIsSending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!log) return;

    if (!validate()) {
      return;
    }

    setIsSaving(true);
    try {
      // Get driver name from selected driver
      const selectedDriver = drivers.find((d) => d.id === driverId);
      if (!selectedDriver) {
        toast({
          title: "Error",
          description: "Please select a driver",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      const response = await fetch(`/api/logs/${log.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          direction,
          plate: plate.trim(),
          driverId: driverId,
          driverName: selectedDriver.name,
          cargoType: cargoType.trim(),
          weightKg: Number(weight),
          netWeightKg:
            direction === "OUT" && netWeight ? Number(netWeight) : undefined,
          comments: comments.trim() || undefined,
          origin: origin.trim() || undefined,
          destination: destination.trim() || undefined,
          senderOrganizationId: senderOrganizationId || undefined,
          receiverOrganizationId: receiverOrganizationId || undefined,
          transportCompanyId: transportCompanyId || undefined,
          sealNumber: sealNumber.trim() || undefined,
          hasTrailer: hasTrailer || undefined,
          trailerPlate: hasTrailer
            ? trailerPlate.trim() || undefined
            : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update log");
      }

      toast({
        title: "Амжилттай",
        description: "Тээврийн хэрэгслийн бүртгэлийг амжилттай шинэчиллээ.",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Алдаа",
        description:
          error instanceof Error
            ? error.message
            : "Бүртгэлийг шинэчлэх амжилтгүй боллоо",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!log) return null;

  const isSentToCustoms = log.sentToCustoms;
  const title =
    direction === "IN"
      ? "Тээврийн хэрэгсэл ОРОХ – Хаалгаар орох"
      : "Тээврийн хэрэгсэл ГАРАХ – Хаалгаар гарах";
  const weightLabel = direction === "IN" ? "Бүрэн жин (кг)" : "Бүрэн жин (кг)";
  
  const timestamp = new Date(log.createdAt).toISOString();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!max-w-none !w-screen !h-screen !max-h-screen !top-0 !left-0 !right-0 !bottom-0 !translate-x-0 !translate-y-0 !rounded-none p-0"
        style={{
          width: "100vw",
          height: "100vh",
          maxWidth: "100vw",
          maxHeight: "100vh",
        }}
      >
        <DialogTitle className="sr-only">Edit Truck Log</DialogTitle>
        <DialogDescription className="sr-only">
          Update the truck log information below.
        </DialogDescription>
        <div className="h-full flex flex-col overflow-hidden p-2">
          {/* Header */}
          <div className="mb-2 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="flex items-center gap-2.5 text-gray-900 text-lg font-semibold">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Camera className="w-5 h-5 text-blue-600" />
                </div>
                {isSentToCustoms ? "Дахин засах: " : "Засах: "}
                {title}
              </CardTitle>
              <div className="flex items-center gap-2">
                {isSentToCustoms && (
                  <Badge className="bg-orange-50 text-orange-700 border-orange-200 px-2.5 py-1">
                    Гаальд илгээсэн
                  </Badge>
                )}
                <Badge className="bg-green-50 text-green-700 border-green-200 px-2.5 py-1">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Танигдсан
                </Badge>
              </div>
            </div>
            {isSentToCustoms && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  <strong>Анхаар:</strong> Энэ бүртгэл гаалинд илгээгдсэн
                  байна. Засварласны дараа дахин илгээх шаардлагатай.
                </p>
              </div>
            )}
          </div>

          {/* Form Content - Grid Layout */}
          <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-hidden">
            <div className="grid grid-cols-2 gap-2 h-full">
              {/* Left Column */}
              <div className="flex flex-col gap-2 overflow-hidden">
                {/* Plate Number */}
                <Card className="p-3 flex-shrink-0">
                  <Label
                    htmlFor="edit-plate"
                    className="text-xs font-semibold text-gray-900 mb-2 block"
                  >
                    Улсын дугаар *
                  </Label>
                  <Input
                    id="edit-plate"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    className="h-10 text-sm font-mono font-semibold"
                    placeholder="УБ1234"
                    required
                  />
                  {errors.plate && (
                    <p className="mt-1 text-xs text-red-600">{errors.plate}</p>
                  )}
                </Card>

                {/* Basic Info */}
                <Card className="p-2.5 flex-shrink-0">
                  <div className="flex-1 min-h-0 flex flex-col gap-2">
                    <div>
                      <Label
                        htmlFor="edit-transport-company"
                        className="text-xs font-medium text-gray-700 mb-1 block"
                      >
                        Тээврийн компани *
                      </Label>
                      <FilterableSelect
                        options={transportCompanies.map((company) => ({
                          value: company.id,
                          label: company.name,
                        }))}
                        value={transportCompanyId}
                        onValueChange={(value) => setTransportCompanyId(value)}
                        disabled={isLoadingCompanies}
                        placeholder={
                          isLoadingCompanies
                            ? "Уншиж байна..."
                            : "Тээврийн компани сонгох"
                        }
                        searchPlaceholder="Тээврийн компани хайх..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label
                          htmlFor="edit-origin"
                          className="text-xs font-medium text-gray-700 mb-1 block"
                        >
                          Хаанаас
                        </Label>
                        <Input
                          id="edit-origin"
                          value={origin}
                          onChange={(e) => setOrigin(e.target.value)}
                          className="h-9 text-sm"
                          placeholder="Гарах газар"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="edit-destination"
                          className="text-xs font-medium text-gray-700 mb-1 block"
                        >
                          Хаашаа
                        </Label>
                        <Input
                          id="edit-destination"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          className="h-9 text-sm"
                          placeholder="Очих газар"
                        />
                      </div>
                    </div>
                    <div>
                      <Label
                        htmlFor="edit-cargo"
                        className="text-xs font-medium text-gray-700 mb-1 block"
                      >
                        Бүтээгдэхүүн *
                      </Label>
                      <FilterableSelect
                        options={products.map((product: Product) => ({
                          value: product.value,
                          label: product.label,
                        }))}
                        value={cargoType}
                        onValueChange={setCargoType}
                        disabled={isLoadingProducts}
                        placeholder={
                          isLoadingProducts
                            ? "Уншиж байна..."
                            : "Бүтээгдэхүүн сонгох"
                        }
                        searchPlaceholder="Бүтээгдэхүүн хайх..."
                      />
                      {errors.cargoType && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.cargoType}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label
                        htmlFor="edit-sender"
                        className="text-xs font-medium text-gray-700 mb-1 block"
                      >
                        Илгээч байгууллага
                      </Label>
                      <FilterableSelect
                        options={organizationOptions}
                        value={senderOrganizationId}
                        onValueChange={(value) =>
                          setSenderOrganizationId(value)
                        }
                        disabled={isLoadingOrganizations}
                        placeholder={
                          isLoadingOrganizations
                            ? "Уншиж байна..."
                            : "Илгээч байгууллага сонгох"
                        }
                        searchPlaceholder="Илгээч байгууллага хайх..."
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="edit-receiver"
                        className="text-xs font-medium text-gray-700 mb-1 block"
                      >
                        Хүлээн авагч байгууллага
                      </Label>
                      <FilterableSelect
                        options={organizationOptions}
                        value={receiverOrganizationId}
                        onValueChange={(value) =>
                          setReceiverOrganizationId(value)
                        }
                        disabled={isLoadingOrganizations}
                        placeholder={
                          isLoadingOrganizations
                            ? "Уншиж байна..."
                            : "Хүлээн авагч байгууллага сонгох"
                        }
                        searchPlaceholder="Хүлээн авагч байгууллага хайх..."
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="edit-driver"
                        className="text-xs font-medium text-gray-700 mb-1 block"
                      >
                        Жолооч *
                      </Label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <FilterableSelect
                            options={drivers.map((driver) => ({
                              value: driver.id,
                              label: `${driver.name}${
                                driver.phone ? ` (${driver.phone})` : ""
                              }`,
                            }))}
                            value={driverId}
                            onValueChange={(value) => {
                              const selectedDriver = drivers.find(
                                (d) => d.id === value
                              );
                              setDriverId(value);
                              setDriverName(selectedDriver?.name || "");
                            }}
                            disabled={isLoadingDrivers}
                            placeholder={
                              isLoadingDrivers
                                ? "Уншиж байна..."
                                : "Жолооч сонгох"
                            }
                            searchPlaceholder="Жолооч хайх..."
                          />
                        </div>
                        <DriverManager
                          drivers={drivers}
                          onDriverAdded={handleDriverAdded}
                          onDriverUpdated={handleDriverAdded}
                        />
                      </div>
                      {errors.driverId && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.driverId}
                        </p>
                      )}
                    </div>
                    {direction === "OUT" && (
                      <div>
                        <Label
                          htmlFor="edit-seal"
                          className="text-xs font-medium text-gray-700 mb-1 block"
                        >
                          Лацны дугаар
                        </Label>
                        <Input
                          id="edit-seal"
                          value={sealNumber}
                          onChange={(e) => setSealNumber(e.target.value)}
                          className="h-9 text-sm"
                          placeholder="Лацны дугаар оруулах"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
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
                      <Label
                        htmlFor="edit-has-trailer"
                        className="text-xs font-medium text-gray-700 cursor-pointer"
                      >
                        Чиргүүлтэй
                      </Label>
                      {hasTrailer && (
                        <Input
                          id="edit-trailer-plate"
                          value={trailerPlate}
                          onChange={(e) => setTrailerPlate(e.target.value)}
                          className="h-8 text-xs font-mono flex-1 max-w-[200px]"
                          placeholder="УБ1234"
                        />
                      )}
                    </div>
                    <div>
                      <Label
                        htmlFor="edit-time"
                        className="text-xs font-medium text-gray-700 mb-1 block"
                      >
                        {direction === "IN" ? "Орох цаг *" : "Гарах цаг *"}
                      </Label>
                      <Input
                        id="edit-time"
                        type="datetime-local"
                        value={
                          direction === "IN"
                            ? log.createdAt
                              ? new Date(log.createdAt).toISOString().slice(0, 16)
                              : new Date(log.createdAt)
                                  .toISOString()
                                  .slice(0, 16)
                            : log.createdAt
                              ? new Date(log.createdAt).toISOString().slice(0, 16)
                              : new Date(log.createdAt)
                                  .toISOString()
                                  .slice(0, 16)
                        }
                        onChange={(e) => {
                          // Handle time change if needed
                        }}
                        className="h-9 text-sm"
                        required
                      />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-2 overflow-hidden">
                {/* Camera Section */}
                <div className="h-[200px] shrink-0">
                  <CameraPanel
                    streamUrl={undefined}
                    lastPlate={plate}
                    lastPayload={plate ? { plate, ts: timestamp } : null}
                    status="idle"
                    onRefresh={() => {}}
                  />
                </div>

                {/* Weight Section */}
                <Card className="p-3 border-2 border-green-200 bg-green-50/30 shrink-0 flex flex-col min-h-[200px]">
                  <h3 className="text-xs font-semibold text-gray-900 mb-2">
                    Жингийн мэдээлэл
                  </h3>
                  <div className="flex flex-col gap-2">
                    <div>
                      <Label
                        htmlFor="edit-weight"
                        className="text-xs font-medium text-gray-700 mb-1 block"
                      >
                        {weightLabel} *
                      </Label>
                      <Input
                        id="edit-weight"
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="bg-white font-semibold text-sm cursor-text h-9"
                        placeholder="Жин оруулах (кг)"
                        required
                      />
                      {errors.weight && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.weight}
                        </p>
                      )}
                    </div>
                    {direction === "OUT" && (
                      <div>
                        <Label
                          htmlFor="edit-net-weight"
                          className="text-xs font-medium text-gray-700 mb-1 block"
                        >
                          Цэвэр жин (кг) *
                        </Label>
                        <Input
                          id="edit-net-weight"
                          type="number"
                          value={
                            netWeight !== null && netWeight !== undefined
                              ? Math.abs(Number(netWeight))
                              : ""
                          }
                          readOnly
                          className="bg-gray-50 font-semibold text-sm cursor-not-allowed h-9"
                          placeholder="Цэвэр жин автоматаар тооцоологдоно"
                        />
                        {errors.netWeight && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors.netWeight}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </Card>

                {/* Notes Section */}
                <Card className="p-3 shrink-0 flex flex-col overflow-hidden">
                  <div className="flex flex-col gap-1.5 mb-3">
                    <Label
                      htmlFor="edit-comments"
                      className="text-xs font-medium text-gray-700 mb-0.5 block"
                    >
                      Нэмэлт мэдээлэл
                    </Label>
                    <Textarea
                      id="edit-comments"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="text-xs resize-none"
                      placeholder="Нэмэлт мэдээлэл..."
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      disabled={isSaving || isSending}
                      className="flex-1"
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
                          {log?.sentToCustoms ? "Дахин илгээх" : "Гаалинд илгээх"}
                        </>
                      )}
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSaving || isSending}
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
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
                </Card>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
