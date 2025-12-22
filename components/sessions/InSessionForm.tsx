"use client";

import { DriverManager } from "@/components/drivers/DriverManager";
import { InSessionWeightConnector } from "@/components/scale/InSessionWeightConnector";
import { CameraPanel } from "@/components/sessions/CameraPanel";
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
import type { Product } from "@/lib/products/products";
import type { Driver, Organization, TransportCompany } from "@/lib/types";
import { Camera } from "lucide-react";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";

interface InSessionFormState {
  plateNumber: string;
  driverId: string;
  driverName: string;
  productId: string;
  transporterCompanyId: string;
  origin: string;
  destination: string;
  senderOrganizationId: string;
  receiverOrganizationId: string;
  inTime: string;
  grossWeightKg: number | null;
  hasTrailer: boolean;
  trailerNumber: string;
  notes: string;
}

interface InSessionFormProps {
  autoFillPlate?: string | null;
  onPlateChange?: (plate: string) => void;
  onHasUnsavedDataChange?: (hasData: boolean) => void;
  onSaveRequest?: () => Promise<boolean>;
  streamUrl?: string;
  cameraAutofill?: ReturnType<typeof useCameraPlateAutofill>;
}

export interface InSessionFormHandle {
  hasUnsavedData: () => boolean;
  triggerSave: () => Promise<boolean>;
}

export const InSessionForm = forwardRef<
  InSessionFormHandle,
  InSessionFormProps
>(
  (
    { autoFillPlate, onPlateChange, onHasUnsavedDataChange, onSaveRequest, streamUrl, cameraAutofill: externalCameraAutofill },
    ref
  ) => {
    const { toast } = useToast();
    const {
      getWebSocket,
      connectWebSocket,
      isSending: isSendingToThirdParty,
      isConnected,
    } = useThirdPartyAutofill();
    const [isSaving, setIsSaving] = useState(false);
    const [plateInputRef, setPlateInputRef] = useState<HTMLInputElement | null>(
      null
    );
    const internalCameraAutofill = useCameraPlateAutofill();
    const cameraAutofill = externalCameraAutofill || internalCameraAutofill;

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
    const [isDriverDialogOpen, setIsDriverDialogOpen] = useState(false);

  const [formState, setFormState] = useState<InSessionFormState>({
    plateNumber: "",
    driverId: "",
    driverName: "",
    productId: "",
    transporterCompanyId: "",
    origin: "",
    destination: "",
    senderOrganizationId: "",
    receiverOrganizationId: "",
    inTime: new Date().toISOString().slice(0, 16),
    grossWeightKg: null,
    hasTrailer: false,
      trailerNumber: "",
    notes: "",
    });

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
      () =>
        products
          .map((p) => ({
            value: p.id,
            label: p.label || p.value || String(p.id),
          }))
          .filter((opt) => opt.label != null && opt.label !== ""),
    [products]
    );

    const transportCompanyOptions = useMemo(
      () =>
        transportCompanies
          .filter((c) => c.name != null && c.name !== "")
          .map((c) => ({ value: c.id, label: c.name })),
    [transportCompanies]
    );

    const driverOptions = useMemo(
      () =>
        drivers
          .filter((d) => d.name != null && d.name !== "")
          .map((d) => ({
      value: d.id, 
            label: `${d.name}${d.phone ? ` (${d.phone})` : ""}`,
    })), 
    [drivers]
    );

    const organizationOptions = useMemo(
      () =>
        organizations
          .filter((o) => o.name != null && o.name !== "")
          .map((o) => ({ value: o.id, label: o.name })),
    [organizations]
    );

  // Handle creating new items
  const handleCreateProduct = async (name: string) => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label: name }),
        });
      if (response.ok) {
          const newProduct = await response.json();
          setProducts((prev) => [...prev, newProduct]);
          toast({
            title: "Амжилттай",
            description: "Бүтээгдэхүүн амжилттай нэмэгдлээ",
          });
          return newProduct.id;
        } else {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));
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

  const handleWeightDetected = (weightKg: number) => {
    setFormState((prev) => ({
      ...prev,
      grossWeightKg: weightKg,
      }));
    };

    // Check if form has unsaved data
    const hasUnsavedData = (): boolean => {
      return !!(
        formState.plateNumber.trim() ||
        formState.driverId ||
        formState.productId ||
        formState.transporterCompanyId ||
        formState.origin.trim() ||
        formState.destination.trim() ||
        formState.senderOrganizationId ||
        formState.receiverOrganizationId ||
        formState.grossWeightKg ||
        formState.hasTrailer ||
        formState.trailerNumber.trim() ||
        formState.notes.trim()
      );
    };

    // Notify parent when unsaved data changes
    useEffect(() => {
      onHasUnsavedDataChange?.(hasUnsavedData());
    }, [formState, onHasUnsavedDataChange]);

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        hasUnsavedData,
        triggerSave: async () => {
          if (!hasUnsavedData()) {
            return true;
          }

    if (!formState.grossWeightKg) {
      toast({
        title: "Алдаа",
        description: "Бүрэн жин оруулах шаардлагатай",
        variant: "destructive",
            });
            return false;
    }

          return await performSave();
        },
      }),
      [formState, toast]
    );

    const performSave = async (): Promise<boolean> => {
      setIsSaving(true);
    try {
      const requestData = {
        direction: "IN",
        plateNumber: formState.plateNumber.trim().toUpperCase(),
        driverId: formState.driverId || undefined,
        driverName: formState.driverName.trim() || undefined,
        productId: formState.productId || undefined,
        transporterCompanyId: formState.transporterCompanyId || undefined,
        origin: formState.origin.trim() || undefined,
        destination: formState.destination.trim() || undefined,
        senderOrganizationId: formState.senderOrganizationId || undefined,
        receiverOrganizationId: formState.receiverOrganizationId || undefined,
        grossWeightKg: formState.grossWeightKg,
        inTime: formState.inTime ? formState.inTime : undefined,
        hasTrailer: formState.hasTrailer || undefined,
          trailerNumber:
            formState.hasTrailer && formState.trailerNumber.trim()
              ? formState.trailerNumber.trim().toUpperCase()
              : undefined,
        notes: formState.notes.trim() || undefined,
        };

      const response = await fetch("/api/truck-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
        });

      if (!response.ok) {
          let errorMessage = "Failed to save session";
          try {
            const errorData = await response.json();
            console.error("❌ API Error:", errorData);
            errorMessage = errorData.error || errorData.message || JSON.stringify(errorData);
          } catch (parseError) {
            const text = await response.text();
            console.error("❌ API Error (non-JSON):", text);
            errorMessage = text || errorMessage;
          }
          throw new Error(errorMessage);
      }

      const savedSession = await response.json()

      toast({
        title: "Амжилттай",
        description: "ОРОХ бүртгэл амжилттай хадгалагдлаа",
        });

      // Send to 3rd party app via WebSocket (matching test-websocket.html logic)
      if (savedSession.session && savedSession.session.uniqueCode) {
        try {
          console.log("🚀 Starting send process for IN session...");
          
          // Step 1: Transform data to 3rd party format (matching test-websocket.html)
          const productName = formState.productId ? products.find(p => p.id === formState.productId)?.label || "" : "";
          const transportCompanyName = formState.transporterCompanyId ? transportCompanies.find(t => t.id === formState.transporterCompanyId)?.name || "" : "";
          
          // Get sender and receiver organization names
          let senderOrgName = "";
          let receiverOrgName = "";
          
          if (formState.senderOrganizationId) {
            try {
              const orgsResponse = await fetch("/api/organizations?type=sender");
              if (orgsResponse.ok) {
                const orgs = await orgsResponse.json();
                const org = orgs.find((o: any) => o.id === formState.senderOrganizationId);
                if (org) senderOrgName = org.name;
              }
            } catch (e) {
              // Ignore error
            }
          }
          
          if (formState.receiverOrganizationId) {
            try {
              const orgsResponse = await fetch("/api/organizations?type=receiver");
              if (orgsResponse.ok) {
                const orgs = await orgsResponse.json();
                const org = orgs.find((o: any) => o.id === formState.receiverOrganizationId);
                if (org) receiverOrgName = org.name;
              }
            } catch (e) {
              // Ignore error
            }
          }
          
          const thirdPartyData = [
            {
              AKT: savedSession.session.uniqueCode,
              CAR: productName,
              CMN: "",
              CON: "",
              CT1: "",
              DRN: formState.driverName.trim(),
              LPC: transportCompanyName || formState.origin.trim() || senderOrgName,
              NET: 0, // IN session has no net weight
              SLN: "",
              TRL: formState.hasTrailer ? formState.trailerNumber.trim().toUpperCase() : "",
              UPC: formState.destination.trim() || receiverOrgName,
              VNO: formState.plateNumber.trim().toUpperCase(),
              WGT: formState.grossWeightKg || 0,
              // Additional fields for sender/receiver company and driver ID
              senderCompany: senderOrgName,
              receiverCompany: receiverOrgName,
              driverId: formState.driverId || "",
            },
          ];

          // Step 2: Save data to file-like storage (matching test-websocket.html)
          console.log("💾 Step 1: Saving data to storage...");
          const appBaseUrl = typeof window !== "undefined" 
            ? window.location.origin 
            : "https://gaali.vercel.app";
          
          const saveResponse = await fetch(`${appBaseUrl}/api/third-party/save`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              uniqueCode: savedSession.session.uniqueCode, // Use AKT as unique code
              data: thirdPartyData,
            }),
          });

          if (!saveResponse.ok) {
            const errorData = await saveResponse.json().catch(() => ({}));
            console.error("❌ ERROR: Failed to save data");
            console.error("❌ Response status:", saveResponse.status);
            console.error("❌ Error data:", errorData);
            throw new Error(errorData.error || `Failed to save data: ${saveResponse.statusText}`);
          }

          const saveResult = await saveResponse.json();
          const uniqueCode = saveResult.code;
          const dataBaseUrl = `${appBaseUrl}/api/third-party/data`;
          const dataUrl = `${dataBaseUrl}/${uniqueCode}`;
          
          console.log("✅ Step 1: Data saved successfully");
          console.log("🔑 Unique Code (AKT):", uniqueCode);
          console.log("📁 Data URL:", dataUrl);

          // Step 3: Check WebSocket connection (matching test-websocket.html logic)
          console.log("🔌 Step 2: Checking WebSocket connection...");
          let ws = getWebSocket();
          console.log("🔌 Current WebSocket state:", ws ? `readyState: ${ws.readyState} (OPEN=${WebSocket.OPEN})` : "null");
          
          if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.log("🔌 WebSocket not connected, attempting to connect...");
            try {
              ws = await connectWebSocket();
              console.log("✅ WebSocket connection attempt completed");
              ws = getWebSocket();
              await new Promise(resolve => setTimeout(resolve, 50));
              ws = getWebSocket();
              if (!ws || ws.readyState !== WebSocket.OPEN) {
                console.error("❌ ERROR: WebSocket connection failed or closed immediately");
                console.error("❌ WebSocket states: CONNECTING=0, OPEN=1, CLOSING=2, CLOSED=3");
                console.error("❌ Current state:", ws ? ws.readyState : "null");
                console.error("❌ This usually means the 3rd party app server is not running");
                toast({
                  title: "Алдаа",
                  description: "3-р талын програмтай холбогдох боломжгүй байна. Програм ажиллаж байгаа эсэхийг шалгана уу.",
                  variant: "destructive",
                });
                return false;
              }
              console.log("✅ WebSocket connection verified and open");
            } catch (error) {
              console.error("❌ ERROR: Failed to connect WebSocket");
              console.error("❌ Error details:", error);
              console.error("❌ This usually means the 3rd party app server is not running at ws://127.0.0.1:9000/service");
              toast({
                title: "Алдаа",
                description: "3-р талын програмтай холбогдох боломжгүй байна. Програм ажиллаж байгаа эсэхийг шалгана уу.",
                variant: "destructive",
              });
              return false;
            }
          } else {
            console.log("✅ WebSocket already connected");
          }

          // Step 4: Verify connection one more time (matching test-websocket.html)
          ws = getWebSocket();
          if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error("❌ ERROR: WebSocket connection is not open before sending");
            toast({
              title: "Алдаа",
              description: "WebSocket холболт тасарсан байна. Дахин оролдоно уу.",
              variant: "destructive",
            });
            return false;
          }

          // Step 5: Send the full URL via WebSocket (matching test-websocket.html)
          console.log("📤 Step 3: Sending data to 3rd party app...");
          console.log("📤 URL to send:", dataUrl);
          console.log("📤 Unique Code (AKT):", uniqueCode);
          
          if (ws.readyState !== WebSocket.OPEN) {
            console.error("❌ ERROR: WebSocket closed right before send!");
            toast({
              title: "Алдаа",
              description: "WebSocket холболт тасарсан байна. Дахин оролдоно уу.",
              variant: "destructive",
            });
            return false;
          }

          ws.send(dataUrl);
          console.log("✅ ws.send() completed without throwing error");

          // Step 6: Check connection after a short delay (matching test-websocket.html)
          await new Promise(resolve => setTimeout(resolve, 100));
          ws = getWebSocket();
          
          if (!ws || ws.readyState !== WebSocket.OPEN) {
            console.error("❌ ERROR: WebSocket closed after sending!");
            console.error("❌ This usually means the 3rd party app server is not running");
            toast({
              title: "Алдаа",
              description: "3-р талын програмтай холболт тасарсан. Програм ажиллаж байгаа эсэхийг шалгана уу.",
              variant: "destructive",
            });
            return false;
          }

          console.log("=".repeat(50));
          console.log("✅ SUCCESS: Data sent to 3rd party app");
          console.log("✅ URL sent:", dataUrl);
          console.log("✅ Unique Code (AKT):", uniqueCode);
          console.log("=".repeat(50));
          
          toast({
            title: "Амжилттай",
            description: "3-р талын програм руу илгээгдлээ",
          });
        } catch (sendError) {
          console.error("=".repeat(50));
          console.error("❌ ERROR: Exception thrown while sending data");
          console.error("❌ Error:", sendError);
          console.error("❌ Error message:", sendError instanceof Error ? sendError.message : String(sendError));
          console.error("=".repeat(50));
          // Don't show error toast - session is already saved
          return false;
        }
      }

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
        inTime: new Date().toISOString().slice(0, 16),
        grossWeightKg: null,
        hasTrailer: false,
          trailerNumber: "",
        notes: "",
        });

        return true;
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
        return false;
    } finally {
        setIsSaving(false);
    }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!formState.grossWeightKg) {
        toast({
          title: "Алдаа",
          description: "Бүрэн жин оруулах шаардлагатай",
          variant: "destructive",
        });
        return;
      }

      await performSave();
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
                  className="h-10 text-sm font-mono font-semibold"
                    placeholder="УБ1234"
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
              </Card>

              {/* Basic Info */}
              <Card className="p-2.5 flex-shrink-0">
                <div className="flex-1 min-h-0 flex flex-col gap-2">
                  <div>
                      <Label
                        htmlFor="transporterCompanyId"
                        className="text-xs font-medium text-gray-700 mb-1 block"
                      >
                      Тээврийн компани *
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
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                        <Label
                          htmlFor="origin"
                          className="text-xs font-medium text-gray-700 mb-1 block"
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
                        className="h-9 text-sm"
                        placeholder="Гарах газар"
                      />
                    </div>
                    <div>
                        <Label
                          htmlFor="destination"
                          className="text-xs font-medium text-gray-700 mb-1 block"
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
                        className="h-9 text-sm"
                        placeholder="Очих газар"
                      />
                    </div>
                  </div>
                  <div>
                      <Label
                        htmlFor="productId"
                        className="text-xs font-medium text-gray-700 mb-1 block"
                      >
                      Бүтээгдэхүүн *
                    </Label>
                    <FilterableSelect
                      options={productOptions}
                      value={formState.productId}
                      onValueChange={(value) => {
                          setFormState((prev) => ({
                            ...prev,
                            productId: value,
                          }));
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
                        className="text-xs font-medium text-gray-700 mb-1 block"
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
                        className="text-xs font-medium text-gray-700 mb-1 block"
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
                  <div>
                      <Label
                        htmlFor="driverId"
                        className="text-xs font-medium text-gray-700 mb-1 block"
                      >
                        Жолооч *
                      </Label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
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
                  </div>
                  <div className="flex items-center gap-2">
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
                      {formState.hasTrailer && (
                        <Input
                          id="trailerNumber"
                          value={formState.trailerNumber}
                          onChange={(e) =>
                            setFormState((prev) => ({
                              ...prev,
                              trailerNumber: e.target.value,
                            }))
                          }
                          className="h-8 text-xs font-mono flex-1 max-w-[200px]"
                          placeholder="УБ1234"
                        />
                      )}
                  </div>
                  <div>
                      <Label
                        htmlFor="inTime"
                        className="text-xs font-medium text-gray-700 mb-1 block"
                      >
                      Орох цаг *
                    </Label>
                    <Input
                      id="inTime"
                      type="datetime-local"
                      value={formState.inTime}
                      onChange={(e) =>
                          setFormState((prev) => ({
                            ...prev,
                            inTime: e.target.value,
                          }))
                      }
                      className="h-9 text-sm"
                      required
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-2 overflow-hidden">
              {/* Camera Section - On top of scale info */}
              <div className="h-[200px] shrink-0">
                <CameraPanel
                  streamUrl={streamUrl}
                  lastPlate={cameraAutofill.plate}
                  lastPayload={cameraAutofill.rawPayload}
                  status={cameraAutofill.status}
                  onRefresh={() => {
                    cameraAutofill.refresh();
                  }}
                />
              </div>

              {/* Weight Section - Reduced height */}
              <Card className="p-3 border-2 border-green-200 bg-green-50/30 shrink-0 flex flex-col">
                  <h3 className="text-xs font-semibold text-gray-900 mb-2">
                    Жингийн мэдээлэл
                  </h3>
                <div className="flex flex-col gap-2">
                    <InSessionWeightConnector
                      onWeightDetected={handleWeightDetected}
                    />
                  <div>
                      <Label
                        htmlFor="grossWeightKg"
                        className="text-xs font-medium text-gray-700 mb-1 block"
                      >
                      Бүрэн жин (кг) *
                    </Label>
                    <Input
                      id="grossWeightKg"
                      type="number"
                      value={formState.grossWeightKg ?? ""}
                        onChange={(e) => {
                          const value =
                            e.target.value === ""
                              ? null
                              : parseFloat(e.target.value);
                          setFormState((prev) => ({
                            ...prev,
                            grossWeightKg: value,
                          }));
                        }}
                        className="bg-white font-semibold text-sm cursor-text h-9"
                        placeholder="Жин оруулах (кг)"
                      required
                    />
                  </div>
                </div>
              </Card>

              {/* Notes - Reduced height */}
              <Card className="p-3 shrink-0 flex flex-col overflow-hidden">
                  <div className="flex flex-col gap-1.5 mb-3">
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
                        className="text-xs resize-none"
                  placeholder="Нэмэлт мэдээлэл..."
                  rows={3}
                />
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200 shrink-0">
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
                          inTime: new Date().toISOString().slice(0, 16),
                          grossWeightKg: null,
                          hasTrailer: false,
                          trailerNumber: "",
                          notes: "",
                        });
                      }}
                      className="h-9 px-4 text-xs"
                    >
                      Цэвэрлэх
                    </Button>
                    <Button
                      type="submit"
                      onClick={handleSubmit}
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-700 h-9 px-4 text-xs flex-1"
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
);

InSessionForm.displayName = "InSessionForm";
