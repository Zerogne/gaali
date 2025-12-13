"use client";

import { DriverManager } from "@/components/drivers/DriverManager";
import { InSessionWeightConnector } from "@/components/scale/InSessionWeightConnector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterableSelect } from "@/components/ui/filterable-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCameraPlateAutofill } from "@/hooks/useCameraPlateAutofill";
import { useThirdPartyAutofill } from "@/hooks/useThirdPartyAutofill";
import type { TruckSession } from "@/lib/truckSessions";
import type {
  Driver,
  Organization,
  Product,
  TransportCompany,
} from "@/lib/types";
import { ArrowRight, Camera } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface OutSessionFormState {
  plateNumber: string;
  driverId: string;
  driverName: string;
  productId: string;
  transporterCompanyId: string;
  origin: string;
  destination: string;
  senderOrganizationId: string;
  receiverOrganizationId: string;
  outTime: string;
  outWeightKg: number | null;
  netWeightKg: number | null;
  sealNumber: string;
  hasTrailer: boolean;
  trailerNumber: string;
  notes: string;
  inSessionId?: string;
}

interface OutSessionFormProps {
  autoFillPlate?: string | null;
  onPlateChange?: (plate: string) => void;
}

export function OutSessionForm({
  autoFillPlate,
  onPlateChange,
}: OutSessionFormProps) {
  const { toast } = useToast();
  const {
    sendFormData,
    isSending: isSendingToThirdParty,
    isConnected,
  } = useThirdPartyAutofill();
  const [isSaving, setIsSaving] = useState(false);
  const [plateInputRef, setPlateInputRef] = useState<HTMLInputElement | null>(
    null
  );
  const cameraAutofill = useCameraPlateAutofill();

  // Data loading states
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

  const [formState, setFormState] = useState<OutSessionFormState>({
    plateNumber: "",
    driverId: "",
    driverName: "",
    productId: "",
    transporterCompanyId: "",
    origin: "",
    destination: "",
    senderOrganizationId: "",
    receiverOrganizationId: "",
    outTime: new Date().toISOString().slice(0, 16),
    outWeightKg: null,
    netWeightKg: null,
    sealNumber: "",
    hasTrailer: false,
    trailerNumber: "",
    notes: "",
    inSessionId: undefined,
  });

  const [inSession, setInSession] = useState<TruckSession | null>(null);
  const [isLoadingInSession, setIsLoadingInSession] = useState(false);
  const [inSessionError, setInSessionError] = useState<string | null>(null);

  // Load all dropdown data
  const loadData = async () => {
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

    // Load organizations
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
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle driver added/updated
  const handleDriverAdded = async () => {
    await loadData();
  };

  // Memoize options
  const productOptions = useMemo(
    () => products.map((p) => ({ value: p.id, label: p.label })),
    [products]
  );

  const transportCompanyOptions = useMemo(
    () => transportCompanies.map((c) => ({ value: c.id, label: c.name })),
    [transportCompanies]
  );

  const driverOptions = useMemo(
    () =>
      drivers.map((d) => ({
        value: d.id,
        label: `${d.name}${d.phone ? ` (${d.phone})` : ""}`,
      })),
    [drivers]
  );

  const organizationOptions = useMemo(
    () => organizations.map((o) => ({ value: o.id, label: o.name })),
    [organizations]
  );

  // Handle creating new items
  const handleCreateProduct = async (label: string) => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      if (response.ok) {
        const newProduct = await response.json();
        setProducts((prev) => [...prev, newProduct]);
        toast({
          title: "Амжилттай",
          description: "Бүтээгдэхүүн нэмэгдлээ",
        });
        return newProduct.id;
      } else {
        const errorData = await response.json();
        toast({
          title: "Алдаа",
          description: errorData.error || "Бүтээгдэхүүн нэмэхэд алдаа гарлаа",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Алдаа",
        description: "Бүтээгдэхүүн нэмэхэд алдаа гарлаа",
        variant: "destructive",
      });
    }
    return null;
  };

  const handleCreateTransportCompany = async (name: string) => {
    try {
      const response = await fetch("/api/transport-companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (response.ok) {
        const newCompany = await response.json();
        setTransportCompanies((prev) => [...prev, newCompany]);
        return newCompany.id;
      }
    } catch (error) {
      console.error("Error creating transport company:", error);
    }
    return null;
  };

  const handleCreateOrganization = async (name: string) => {
    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (response.ok) {
        const newOrg = await response.json();
        setOrganizations((prev) => [...prev, newOrg]);
        return newOrg.id;
      }
    } catch (error) {
      console.error("Error creating organization:", error);
    }
    return null;
  };

  // Bind camera autofill to plate input
  useEffect(() => {
    if (plateInputRef) {
      cameraAutofill.bindToInput({
        getValue: () => formState.plateNumber,
        setValue: (value: string) => {
          setFormState((prev) => ({ ...prev, plateNumber: value }));
        },
        isFocused: () => document.activeElement === plateInputRef,
      });
    }
  }, [plateInputRef, cameraAutofill, formState.plateNumber]);

  // Auto-fill plate from camera
  useEffect(() => {
    if (autoFillPlate && !formState.plateNumber) {
      setFormState((prev) => ({ ...prev, plateNumber: autoFillPlate }));
      onPlateChange?.(autoFillPlate);
    }
  }, [autoFillPlate, formState.plateNumber, onPlateChange]);

  // Find matching IN session when plate number changes
  useEffect(() => {
    const findInSession = async () => {
      if (!formState.plateNumber.trim()) {
        setInSession(null);
        setInSessionError(null);
        setFormState((prev) => ({
          ...prev,
          inSessionId: undefined,
          netWeightKg: null,
        }));
        return;
      }

      setIsLoadingInSession(true);
      setInSessionError(null);

      try {
        const response = await fetch(
          `/api/truck-sessions/find-in?plateNumber=${encodeURIComponent(
            formState.plateNumber.trim()
          )}`
        );

        if (response.status === 404) {
          setInSession(null);
          setInSessionError("Энэ улсын дугаартай ОРОХ бүртгэл олдсонгүй");
          setFormState((prev) => ({
            ...prev,
            inSessionId: undefined,
            netWeightKg: null,
          }));
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch IN session");
        }

        const result = await response.json();
        const inSessionData = result.session as TruckSession;

        if (inSessionData) {
          setInSession(inSessionData);
          setFormState((prev) => ({
            ...prev,
            inSessionId: inSessionData.id,
          }));
          // Recalculate net weight if out weight is already set
          if (formState.outWeightKg && inSessionData.grossWeightKg) {
            const netWeight =
              formState.outWeightKg - inSessionData.grossWeightKg;
            setFormState((prev) => ({
              ...prev,
              netWeightKg: netWeight > 0 ? netWeight : null,
            }));
          }
        } else {
          setInSession(null);
          setInSessionError("Энэ улсын дугаартай ОРОХ бүртгэл олдсонгүй");
          setFormState((prev) => ({
            ...prev,
            inSessionId: undefined,
            netWeightKg: null,
          }));
        }
      } catch (error) {
        console.error("Error finding IN session:", error);
        setInSessionError("ОРОХ бүртгэл хайхад алдаа гарлаа");
        setInSession(null);
      } finally {
        setIsLoadingInSession(false);
      }
    };

    const timeoutId = setTimeout(findInSession, 500);
    return () => clearTimeout(timeoutId);
  }, [formState.plateNumber]);

  // Calculate net weight when outWeightKg or inSession changes
  useEffect(() => {
    if (formState.outWeightKg && inSession?.grossWeightKg) {
      const netWeight = formState.outWeightKg - inSession.grossWeightKg;
      setFormState((prev) => ({
        ...prev,
        netWeightKg: netWeight > 0 ? netWeight : null,
      }));
    } else {
      setFormState((prev) => ({ ...prev, netWeightKg: null }));
    }
  }, [formState.outWeightKg, inSession]);

  const handleWeightDetected = (weightKg: number) => {
    setFormState((prev) => ({
      ...prev,
      outWeightKg: weightKg,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.outWeightKg) {
      toast({
        title: "Алдаа",
        description: "Гарах жин оруулах шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    if (!inSession) {
      toast({
        title: "Алдаа",
        description: "ОРОХ бүртгэл олох шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    if (!formState.netWeightKg) {
      toast({
        title: "Алдаа",
        description: "Цэвэр жин тооцоолох шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const requestData = {
        direction: "OUT",
        plateNumber: formState.plateNumber.trim().toUpperCase(),
        driverId: formState.driverId || undefined,
        driverName: formState.driverName.trim() || undefined,
        productId: formState.productId || undefined,
        transporterCompanyId: formState.transporterCompanyId || undefined,
        origin: formState.origin.trim() || undefined,
        destination: formState.destination.trim() || undefined,
        senderOrganizationId: formState.senderOrganizationId || undefined,
        receiverOrganizationId: formState.receiverOrganizationId || undefined,
        grossWeightKg: formState.outWeightKg,
        netWeightKg: formState.netWeightKg ? formState.netWeightKg : undefined,
        inSessionId: formState.inSessionId ? formState.inSessionId : undefined,
        outTime: formState.outTime ? formState.outTime : undefined,
        sealNumber: formState.sealNumber.trim() || undefined,
        hasTrailer: formState.hasTrailer || undefined,
        trailerNumber: formState.trailerNumber.trim() || undefined,
        notes: formState.notes.trim() || undefined,
      };

      const response = await fetch("/api/truck-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save session");
      }

      toast({
        title: "Амжилттай",
        description: "ГАРАХ бүртгэл амжилттай хадгалагдлаа",
      });

      // Reset form
      setFormState({
        plateNumber: "",
        driverId: "",
        driverName: "",
        productId: "",
        transporterCompanyId: "",
        origin: "",
        destination: "",
        senderOrganizationId: "",
        receiverOrganizationId: "",
        outTime: new Date().toISOString().slice(0, 16),
        outWeightKg: null,
        netWeightKg: null,
        sealNumber: "",
        hasTrailer: false,
        trailerNumber: "",
        notes: "",
        inSessionId: undefined,
      });
      setInSession(null);
      setInSessionError(null);
    } catch (error) {
      console.error("Error saving session:", error);
      toast({
        title: "Алдаа",
        description:
          error instanceof Error
            ? error.message
            : "Бүртгэл хадгалахад алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <form
        onSubmit={handleSubmit}
        className="h-full flex flex-col overflow-hidden"
      >
        {/* Form Content - No Scroll, Grid Layout */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="grid grid-cols-2 gap-2 h-full">
            {/* Left Column */}
            <div className="flex flex-col gap-2 overflow-hidden">
              {/* Plate Number */}
              <Card className="p-3 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <Label
                    htmlFor="plateNumber"
                    className="text-xs font-semibold text-gray-900"
                  >
                    Улсын дугаар *
                  </Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={cameraAutofill.isEnabled}
                      onCheckedChange={cameraAutofill.toggleEnabled}
                    />
                    <span className="text-xs text-gray-600">Камера</span>
                  </div>
                </div>
                <Input
                  ref={setPlateInputRef}
                  id="plateNumber"
                  value={formState.plateNumber}
                  onChange={(e) => {
                    cameraAutofill.trackTyping();
                    setFormState((prev) => ({
                      ...prev,
                      plateNumber: e.target.value,
                    }));
                    onPlateChange?.(e.target.value);
                  }}
                  onFocus={() => cameraAutofill.trackTyping()}
                  className="h-8 text-xs font-mono font-semibold"
                  placeholder="ABC1234"
                  required
                />
                {cameraAutofill.status === "polling" && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-600">
                    <Camera className="h-3 w-3 animate-pulse" />
                    <span>Камера холбогдож байна...</span>
                  </div>
                )}
                {cameraAutofill.plate && cameraAutofill.lastSeenAt && (
                  <p className="text-xs text-gray-500 mt-1.5">
                    Сүүлд:{" "}
                    <span className="font-mono font-semibold text-blue-600">
                      {cameraAutofill.plate}
                    </span>
                  </p>
                )}
                {isLoadingInSession && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-600">
                    <div className="h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    <span>ОРОХ бүртгэл хайж байна...</span>
                  </div>
                )}
                {inSession && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-xs text-green-800 font-semibold">
                      ✓ ОРОХ: {inSession.grossWeightKg?.toLocaleString()} кг
                    </p>
                  </div>
                )}
                {inSessionError && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                    <p className="text-xs text-red-700 font-medium">
                      {inSessionError}
                    </p>
                  </div>
                )}
              </Card>

              {/* Basic Info */}
              <Card className="p-2.5 flex-shrink-0">
                <div className="flex flex-col gap-1.5">
                  <div>
                    <Label
                      htmlFor="transporterCompanyId"
                      className="text-xs font-medium text-gray-700 mb-0.5 block"
                    >
                      Тээврийн компани
                    </Label>
                    <FilterableSelect
                      options={transportCompanyOptions}
                      value={formState.transporterCompanyId}
                      onValueChange={(value) => {
                        setFormState((prev) => ({
                          ...prev,
                          transporterCompanyId: value,
                        }));
                      }}
                      disabled={isLoadingCompanies}
                      placeholder={
                        isLoadingCompanies
                          ? "Уншиж байна..."
                          : "Тээврийн компани сонгох"
                      }
                      searchPlaceholder="Тээврийн компани хайх..."
                      onCreateNew={handleCreateTransportCompany}
                      createNewLabel="+ Нэмэх ..."
                    />
                  </div>
                  <div className="flex items-end gap-1.5">
                    <div className="flex-1">
                      <Label
                        htmlFor="origin"
                        className="text-xs font-medium text-gray-700 mb-0.5 block"
                      >
                        Хаанаас
                      </Label>
                      <Input
                        id="origin"
                        value={formState.origin}
                        onChange={(e) =>
                          setFormState((prev) => ({
                            ...prev,
                            origin: e.target.value,
                          }))
                        }
                        className="h-8 text-xs"
                        placeholder="Гарах газар"
                      />
                    </div>
                    <div className="flex-shrink-0 pb-0.5">
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <Label
                        htmlFor="destination"
                        className="text-xs font-medium text-gray-700 mb-0.5 block"
                      >
                        Хаашаа
                      </Label>
                      <Input
                        id="destination"
                        value={formState.destination}
                        onChange={(e) =>
                          setFormState((prev) => ({
                            ...prev,
                            destination: e.target.value,
                          }))
                        }
                        className="h-8 text-xs"
                        placeholder="Очих газар"
                      />
                    </div>
                  </div>
                  <div>
                    <Label
                      htmlFor="productId"
                      className="text-xs font-medium text-gray-700 mb-0.5 block"
                    >
                      Бүтээгдэхүүн
                    </Label>
                    <FilterableSelect
                      options={productOptions}
                      value={formState.productId}
                      onValueChange={(value) => {
                        setFormState((prev) => ({ ...prev, productId: value }));
                      }}
                      disabled={isLoadingProducts}
                      placeholder={
                        isLoadingProducts
                          ? "Уншиж байна..."
                          : "Бүтээгдэхүүн сонгох"
                      }
                      searchPlaceholder="Бүтээгдэхүүн хайх..."
                      onCreateNew={handleCreateProduct}
                      createNewLabel="+ Нэмэх ..."
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="senderOrganizationId"
                      className="text-xs font-medium text-gray-700 mb-0.5 block"
                    >
                      Илгээч байгууллага
                    </Label>
                    <FilterableSelect
                      options={organizationOptions}
                      value={formState.senderOrganizationId}
                      onValueChange={(value) => {
                        setFormState((prev) => ({
                          ...prev,
                          senderOrganizationId: value,
                        }));
                      }}
                      disabled={isLoadingOrganizations}
                      placeholder={
                        isLoadingOrganizations
                          ? "Уншиж байна..."
                          : "Илгээч байгууллага сонгох"
                      }
                      searchPlaceholder="Илгээч байгууллага хайх..."
                      onCreateNew={handleCreateOrganization}
                      createNewLabel="+ Нэмэх ..."
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="receiverOrganizationId"
                      className="text-xs font-medium text-gray-700 mb-0.5 block"
                    >
                      Хүлээн авагч байгууллага
                    </Label>
                    <FilterableSelect
                      options={organizationOptions}
                      value={formState.receiverOrganizationId}
                      onValueChange={(value) => {
                        setFormState((prev) => ({
                          ...prev,
                          receiverOrganizationId: value,
                        }));
                      }}
                      disabled={isLoadingOrganizations}
                      placeholder={
                        isLoadingOrganizations
                          ? "Уншиж байна..."
                          : "Хүлээн авагч байгууллага сонгох"
                      }
                      searchPlaceholder="Хүлээн авагч байгууллага хайх..."
                      onCreateNew={handleCreateOrganization}
                      createNewLabel="+ Нэмэх ..."
                    />
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <Label
                        htmlFor="driverId"
                        className="text-xs font-medium text-gray-700"
                      >
                        Жолооч
                      </Label>
                      <div className="flex items-center gap-2">
                        <DriverManager
                          drivers={drivers}
                          onDriverAdded={handleDriverAdded}
                          onDriverUpdated={handleDriverAdded}
                        />
                      </div>
                    </div>
                    <FilterableSelect
                      options={driverOptions}
                      value={formState.driverId}
                      onValueChange={(value) => {
                        const selectedDriver = drivers.find(
                          (d) => d.id === value
                        );
                        setFormState((prev) => ({
                          ...prev,
                          driverId: value,
                          driverName: selectedDriver?.name || "",
                        }));
                      }}
                      disabled={isLoadingDrivers}
                      placeholder={
                        isLoadingDrivers ? "Уншиж байна..." : "Жолооч сонгох"
                      }
                      searchPlaceholder="Жолооч хайх..."
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="sealNumber"
                      className="text-xs font-medium text-gray-700 mb-0.5 block"
                    >
                      Лацны дугаар
                    </Label>
                    <Input
                      id="sealNumber"
                      value={formState.sealNumber}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          sealNumber: e.target.value,
                        }))
                      }
                      className="h-8 text-xs"
                      placeholder="Лацны дугаар оруулах"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Checkbox
                        id="hasTrailer"
                        checked={formState.hasTrailer}
                        onCheckedChange={(checked) => {
                          const isChecked = checked === true;
                          setFormState((prev) => ({
                            ...prev,
                            hasTrailer: isChecked,
                            trailerNumber:
                              isChecked && !prev.trailerNumber
                                ? prev.plateNumber
                                : prev.trailerNumber,
                          }));
                        }}
                      />
                      <Label
                        htmlFor="hasTrailer"
                        className="text-xs font-medium text-gray-700 cursor-pointer"
                      >
                        Чиргүүлтэй
                      </Label>
                    </div>
                    {formState.hasTrailer && (
                      <div>
                        <Label
                          htmlFor="trailerNumber"
                          className="text-xs font-medium text-gray-700 mb-0.5 block"
                        >
                          Чиргүүлийн улсын дугаар
                        </Label>
                        <Input
                          id="trailerNumber"
                          value={formState.trailerNumber}
                          onChange={(e) =>
                            setFormState((prev) => ({
                              ...prev,
                              trailerNumber: e.target.value,
                            }))
                          }
                          className="h-8 text-xs font-mono"
                          placeholder="Улсын дугаар"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="outTime"
                      className="text-xs font-medium text-gray-700 mb-0.5 block"
                    >
                      Гарах цаг *
                    </Label>
                    <Input
                      id="outTime"
                      type="datetime-local"
                      value={formState.outTime}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          outTime: e.target.value,
                        }))
                      }
                      className="h-8 text-xs"
                      required
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-2 overflow-hidden">
              {/* Weight Section */}
              <Card className="p-2 border-2 border-green-200 bg-green-50/30 flex-1 min-h-0 flex flex-col">
                <h3 className="text-xs font-semibold text-gray-900 mb-1.5">
                  Жингийн мэдээлэл
                </h3>
                <div className="flex-1 min-h-0 flex flex-col gap-1.5">
                  <InSessionWeightConnector
                    onWeightDetected={handleWeightDetected}
                  />
                  <div>
                    <Label
                      htmlFor="outWeightKg"
                      className="text-xs font-medium text-gray-700 mb-0.5 block"
                    >
                      Гарах жин (кг) *
                    </Label>
                    <Input
                      id="outWeightKg"
                      type="number"
                      value={formState.outWeightKg ?? ""}
                      onChange={(e) => {
                        const value =
                          e.target.value === ""
                            ? null
                            : parseFloat(e.target.value);
                        setFormState((prev) => ({
                          ...prev,
                          outWeightKg: value,
                        }));
                      }}
                      className="bg-white font-semibold text-xs cursor-text h-8"
                      placeholder="Жин оруулах (кг)"
                      required
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="netWeightKg"
                      className="text-xs font-medium text-gray-700 mb-0.5 block"
                    >
                      Цэвэр жин (кг){" "}
                      <span className="text-xs font-normal text-gray-500">
                        (автоматаар)
                      </span>
                    </Label>
                    <Input
                      id="netWeightKg"
                      type="number"
                      value={formState.netWeightKg ?? ""}
                      readOnly
                      className="bg-white font-semibold text-xs cursor-not-allowed h-8"
                      placeholder={
                        !inSession
                          ? "ОРОХ бүртгэл олох хэрэгтэй"
                          : !formState.outWeightKg
                          ? "Гарах жин оруулах хэрэгтэй"
                          : "Цэвэр жин автоматаар тооцоологдоно"
                      }
                    />
                    {formState.netWeightKg && (
                      <div className="mt-2 p-2 bg-white rounded border border-green-200">
                        <p className="text-xs text-gray-700">
                          {formState.outWeightKg} - {inSession?.grossWeightKg} ={" "}
                          <span className="font-bold text-green-700">
                            {formState.netWeightKg}
                          </span>{" "}
                          кг
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Notes */}
              <Card className="p-2.5 flex-1 min-h-0 flex flex-col">
                <div className="flex flex-col gap-1.5 flex-1 min-h-0">
                  <div className="flex-1 min-h-0 flex flex-col">
                    <Label
                      htmlFor="notes"
                      className="text-xs font-medium text-gray-700 mb-0.5 block"
                    >
                      Нэмэлт мэдээлэл
                    </Label>
                    <Textarea
                      id="notes"
                      value={formState.notes}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      className="text-xs resize-none flex-1 min-h-0"
                      placeholder="Нэмэлт мэдээлэл..."
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormState({
                        plateNumber: "",
                        driverId: "",
                        driverName: "",
                        productId: "",
                        transporterCompanyId: "",
                        origin: "",
                        destination: "",
                        senderOrganizationId: "",
                        receiverOrganizationId: "",
                        outTime: new Date().toISOString().slice(0, 16),
                        outWeightKg: null,
                        netWeightKg: null,
                        sealNumber: "",
                        hasTrailer: false,
                        trailerNumber: "",
                        notes: "",
                        inSessionId: undefined,
                      });
                      setInSession(null);
                      setInSessionError(null);
                    }}
                    className="h-9 px-4 text-xs"
                  >
                    Цэвэрлэх
                  </Button>
                  <Button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={!inSession || !formState.netWeightKg || isSaving}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 h-9 px-4 text-xs flex-1"
                  >
                    {isSaving ? "Хадгалж байна..." : "Хадгалах"}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
