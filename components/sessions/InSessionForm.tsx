"use client";

import { DriverManager } from "@/components/drivers/DriverManager";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterableSelect } from "@/components/ui/filterable-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCameraBridgeWebSocket } from "@/hooks/useCameraBridgeWebSocket";
import { useLprPlateAutofill } from "@/hooks/useLprPlateAutofill";
import { useThirdPartyAutofill } from "@/hooks/useThirdPartyAutofill";
import { updateTruckLog } from "@/lib/api";
import type { Product } from "@/lib/products/products";
import type {
  Driver,
  Organization,
  TransportCompany,
  TruckLog,
} from "@/lib/types";
import { ArrowRight, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
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
  cameraAutofill?: ReturnType<typeof useLprPlateAutofill>;
  editLog?: TruckLog | null;
  editLogId?: string | null;
  inTime?: string;
  onInTimeChange?: (time: string) => void;
}

export interface InSessionFormHandle {
  hasUnsavedData: () => boolean;
  triggerSave: () => Promise<boolean>;
  getDestination: () => string;
}

export const InSessionForm = forwardRef<
  InSessionFormHandle,
  InSessionFormProps
>(
  (
    {
      autoFillPlate,
      onPlateChange,
      onHasUnsavedDataChange,
      onSaveRequest,
      streamUrl,
      cameraAutofill: externalCameraAutofill,
      editLog,
      editLogId,
      inTime: externalInTime,
      onInTimeChange,
    },
    ref
  ) => {
    const { toast } = useToast();
    const router = useRouter();
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
    const isAutofillingRef = useRef(false);
    // Use WebSocket for real-time camera updates (preferred)
    // Falls back to polling if WebSocket not available
    const internalCameraAutofillWs = useCameraBridgeWebSocket();
    const internalCameraAutofill = useLprPlateAutofill();

    // FORCE ENABLE WebSocket if it's disabled (user might have disabled it before)
    useEffect(() => {
      if (!internalCameraAutofillWs.isEnabled) {
        console.log("🔧🔧🔧 WebSocket autofill is DISABLED - ENABLING IT NOW");
        internalCameraAutofillWs.toggleEnabled(true);
      }
    }, [internalCameraAutofillWs.isEnabled, internalCameraAutofillWs]);

    // Prefer WebSocket if enabled (even if connecting), otherwise use external or polling
    const cameraAutofill = internalCameraAutofillWs.isEnabled
      ? internalCameraAutofillWs
      : externalCameraAutofill || internalCameraAutofill;

    // Debug logging
    useEffect(() => {
      console.log("📡 Camera autofill status:", {
        using: externalCameraAutofill
          ? "external"
          : internalCameraAutofillWs.isEnabled
          ? "websocket"
          : "polling",
        wsStatus: internalCameraAutofillWs.status,
        wsEnabled: internalCameraAutofillWs.isEnabled,
        wsPlate: internalCameraAutofillWs.plate,
        pollingPlate: internalCameraAutofill.plate,
        currentPlate: cameraAutofill.plate,
        hasPlate: !!cameraAutofill.plate,
      });

      // Log when plate changes
      if (cameraAutofill.plate) {
        console.log("🎯🎯🎯 ========================================");
        console.log("🎯🎯🎯 PLATE READ:", cameraAutofill.plate);
        console.log("🎯🎯🎯 ========================================");
      }
    }, [
      cameraAutofill.plate,
      internalCameraAutofillWs.status,
      internalCameraAutofillWs.isEnabled,
      internalCameraAutofillWs.plate,
      internalCameraAutofill.plate,
      externalCameraAutofill,
    ]);

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
      inTime: externalInTime || new Date().toISOString().slice(0, 16),
      grossWeightKg: null,
      hasTrailer: false,
      trailerNumber: "",
      notes: "",
    });

    // Sync external inTime with form state
    useEffect(() => {
      if (externalInTime) {
        setFormState((prev) => ({ ...prev, inTime: externalInTime }));
      }
    }, [externalInTime]);

    // Populate form when editing
    useEffect(() => {
      if (
        editLog &&
        products.length > 0 &&
        transportCompanies.length > 0 &&
        drivers.length > 0 &&
        organizations.length > 0
      ) {
        // Find matching IDs for dropdowns
        const product = products.find(
          (p) => p.label === editLog.cargoType || p.value === editLog.cargoType
        );
        const transportCompany = transportCompanies.find(
          (tc) =>
            tc.name === editLog.transportType ||
            tc.id === editLog.transportCompanyId
        );
        const driver = drivers.find(
          (d) => d.name === editLog.driverName || d.id === editLog.driverId
        );
        const senderOrg = organizations.find(
          (o) =>
            o.name === editLog.senderOrganization ||
            o.id === editLog.senderOrganizationId
        );
        const receiverOrg = organizations.find(
          (o) =>
            o.name === editLog.receiverOrganization ||
            o.id === editLog.receiverOrganizationId
        );

        // Format date for datetime-local input
        const inTime = editLog.createdAt
          ? new Date(editLog.createdAt).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16);

        // Update external inTime if handler is provided
        if (onInTimeChange) {
          onInTimeChange(inTime);
        }

        setFormState({
          plateNumber: editLog.plate || "",
          driverId: driver?.id || "",
          driverName: editLog.driverName || "",
          productId: product?.id || "",
          transporterCompanyId: transportCompany?.id || "",
          origin: editLog.origin || "",
          destination: editLog.destination || "",
          senderOrganizationId: senderOrg?.id || "",
          receiverOrganizationId: receiverOrg?.id || "",
          inTime: inTime,
          grossWeightKg: editLog.weightKg || null,
          hasTrailer: editLog.hasTrailer || false,
          trailerNumber: editLog.trailerPlate || "",
          notes: editLog.comments || "",
        });
      }
    }, [editLog, products, transportCompanies, drivers, organizations]);

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
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
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
          const errorMessage =
            errorData.error ||
            errorData.message ||
            "Бүтээгдэхүүн нэмэхэд алдаа гарлаа";
          toast({
            title: "Алдаа",
            description: errorMessage,
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
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({ name }),
        });
        if (response.ok) {
          const newCompany = await response.json();
          setTransportCompanies((prev) => [...prev, newCompany]);
          toast({
            title: "Амжилттай",
            description: "Тээврийн компани амжилттай нэмэгдлээ",
          });
          return newCompany.id;
        } else {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));
          const errorMessage =
            errorData.error ||
            errorData.message ||
            "Тээврийн компани нэмэхэд алдаа гарлаа";
          toast({
            title: "Алдаа",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error creating transport company:", error);
        toast({
          title: "Алдаа",
          description: "Тээврийн компани нэмэхэд алдаа гарлаа",
          variant: "destructive",
        });
      }
      return null;
    };

    const handleCreateOrganization = async (name: string) => {
      try {
        const response = await fetch("/api/organizations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({ name }),
        });
        if (response.ok) {
          const newOrg = await response.json();
          setOrganizations((prev) => [...prev, newOrg]);
          toast({
            title: "Амжилттай",
            description: "Байгууллага амжилттай нэмэгдлээ",
          });
          return newOrg.id;
        } else {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));
          const errorMessage =
            errorData.error ||
            errorData.message ||
            "Байгууллага нэмэхэд алдаа гарлаа";
          toast({
            title: "Алдаа",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error creating organization:", error);
        toast({
          title: "Алдаа",
          description: "Байгууллага нэмэхэд алдаа гарлаа",
          variant: "destructive",
        });
      }
      return null;
    };

    // Bind camera autofill to plate input
    useEffect(() => {
      if (plateInputRef) {
        console.log("🔗🔗🔗 ========================================");
        console.log("🔗🔗🔗 BINDING AUTOFILL TO INPUT");
        console.log("🔗🔗🔗 ========================================");
        console.log("🔗 Current plate in hook:", cameraAutofill.plate);
        console.log("🔗 Current form state plate:", formState.plateNumber);
        console.log("🔗 Input element:", plateInputRef);
        console.log("🔗 Input element value:", plateInputRef.value);

        const binding = {
          getValue: () => {
            const value = formState.plateNumber;
            console.log("🔗 getValue called, returning:", value);
            return value;
          },
          setValue: (value: string) => {
            console.log("📝📝📝 ========================================");
            console.log("📝📝📝 AUTOFILL setValue CALLED!");
            console.log("📝📝📝 Setting plate to:", value);
            console.log("📝📝📝 ========================================");
            console.log(
              "📝 Current formState.plateNumber:",
              formState.plateNumber
            );
            console.log("📝 Input element exists:", !!plateInputRef);
            console.log("📝 Input element:", plateInputRef);

            if (!plateInputRef) {
              console.error(
                "❌❌❌ CRITICAL: plateInputRef is NULL! Cannot update input!"
              );
              return;
            }

            // CRITICAL: This is a CONTROLLED component - React controls the value via the `value` prop
            // We MUST update React state, and React will update the DOM on re-render
            console.log("📝 Step 1: Setting autofill flag");
            isAutofillingRef.current = true;

            console.log(
              "📝 Step 2: Updating React state (CONTROLLED COMPONENT)"
            );
            console.log(
              "📝 Current formState.plateNumber:",
              formState.plateNumber
            );
            console.log("📝 New value to set:", value);

            // Update React state - this will trigger a re-render and update the input
            setFormState((prev) => {
              console.log(
                "📝 Inside setFormState - prev.plateNumber:",
                prev.plateNumber,
                "new value:",
                value
              );
              if (prev.plateNumber === value) {
                console.log(
                  "📝 Value already matches, but updating anyway to trigger re-render"
                );
              }
              const newState = { ...prev, plateNumber: value };
              console.log(
                "📝 Returning new state with plateNumber:",
                newState.plateNumber
              );
              return newState;
            });

            // ALSO update DOM directly as immediate visual feedback
            console.log(
              "📝 Step 3: Directly updating DOM for immediate visual feedback"
            );
            plateInputRef.value = value;

            // Use native setter to trigger React's event system
            try {
              const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype,
                "value"
              )?.set;
              if (nativeInputValueSetter) {
                nativeInputValueSetter.call(plateInputRef, value);
                const nativeEvent = new Event("input", {
                  bubbles: true,
                  cancelable: true,
                });
                plateInputRef.dispatchEvent(nativeEvent);
                console.log("📝 Used native setter and dispatched input event");
              }
            } catch (e) {
              console.log("📝 Native setter failed:", e);
            }

            // Trigger onPlateChange callback
            if (onPlateChange) {
              console.log("📝 Step 4: Calling onPlateChange callback");
              onPlateChange(value);
            }

            // Clear autofill flag after a delay
            setTimeout(() => {
              isAutofillingRef.current = false;
            }, 500);

            // Verify after React has had time to re-render
            setTimeout(() => {
              const currentInputValue = plateInputRef.value;
              const currentStateValue = formState.plateNumber;
              console.log(
                "📝 Verification - Input DOM value:",
                currentInputValue
              );
              console.log(
                "📝 Verification - React state value:",
                currentStateValue
              );
              console.log("📝 Verification - Expected value:", value);

              if (currentInputValue === value || currentStateValue === value) {
                console.log("✅✅✅ VERIFIED: Input field updated!");
              } else {
                console.error(
                  "❌❌❌ NOT UPDATED! DOM:",
                  currentInputValue,
                  "State:",
                  currentStateValue,
                  "Expected:",
                  value
                );
                console.error("❌ Attempting emergency update...");
                // Force update one more time
                setFormState((prev) => ({ ...prev, plateNumber: value }));
                plateInputRef.value = value;
              }
            }, 200);

            console.log("📝📝📝 setValue COMPLETE for:", value);
          },
          isFocused: () => {
            const focused = document.activeElement === plateInputRef;
            console.log("🔗 isFocused called, returning:", focused);
            return focused;
          },
        };

        cameraAutofill.bindToInput(binding);
        console.log("🔗 Binding complete");

        // If we already have a plate, try to autofill immediately
        if (cameraAutofill.plate && !formState.plateNumber) {
          console.log(
            "🔗 Plate exists but form is empty, triggering immediate autofill"
          );
          setTimeout(() => {
            if (cameraAutofill.plate) {
              binding.setValue(cameraAutofill.plate);
            }
          }, 200);
        }
      } else {
        console.log("⚠️ plateInputRef is null, cannot bind autofill");
      }
    }, [
      plateInputRef,
      cameraAutofill.plate,
      formState.plateNumber,
      cameraAutofill,
      onPlateChange,
    ]);

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

    // Get destination value
    const getDestination = (): string => {
      return formState.destination.trim();
    };

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        hasUnsavedData,
        getDestination,
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

    // Helper function to get current datetime in datetime-local format
    const getCurrentDateTime = (): string => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const performSave = async (): Promise<boolean> => {
      setIsSaving(true);
      try {
        // Use external inTime if provided, otherwise use form state
        const currentInTime = externalInTime || formState.inTime;

        // If editing, update the existing log
        if (editLogId && editLog) {
          const productName = formState.productId
            ? products.find((p) => p.id === formState.productId)?.label || ""
            : "";
          const transportCompanyName = formState.transporterCompanyId
            ? transportCompanies.find(
                (t) => t.id === formState.transporterCompanyId
              )?.name || ""
            : "";

          let senderOrgName = "";
          let receiverOrgName = "";

          if (formState.senderOrganizationId) {
            const org = organizations.find(
              (o) => o.id === formState.senderOrganizationId
            );
            if (org) senderOrgName = org.name;
          }

          if (formState.receiverOrganizationId) {
            const org = organizations.find(
              (o) => o.id === formState.receiverOrganizationId
            );
            if (org) receiverOrgName = org.name;
          }

          const updateData = {
            plate: formState.plateNumber.trim().toUpperCase(),
            driverId: formState.driverId || undefined,
            driverName: formState.driverName.trim() || undefined,
            cargoType: productName || undefined,
            transportCompanyId: formState.transporterCompanyId || undefined,
            origin: formState.origin.trim() || undefined,
            destination: formState.destination.trim() || undefined,
            senderOrganizationId: formState.senderOrganizationId || undefined,
            senderOrganization: senderOrgName || undefined,
            receiverOrganizationId:
              formState.receiverOrganizationId || undefined,
            receiverOrganization: receiverOrgName || undefined,
            weightKg: formState.grossWeightKg || undefined,
            hasTrailer: formState.hasTrailer || undefined,
            trailerPlate:
              formState.hasTrailer && formState.trailerNumber.trim()
                ? formState.trailerNumber.trim().toUpperCase()
                : undefined,
            comments: formState.notes.trim() || undefined,
          };

          const result = await updateTruckLog(editLogId, updateData);

          if (!result.success) {
            throw new Error(result.error || "Бүртгэл шинэчлэхэд алдаа гарлаа");
          }

          toast({
            title: "Амжилттай",
            description: "Бүртгэл амжилттай шинэчлэгдлээ",
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
            inTime: new Date().toISOString().slice(0, 16),
            grossWeightKg: null,
            hasTrailer: false,
            trailerNumber: "",
            notes: "",
          });

          return true;
        }

        // Otherwise, create a new session
        // Use external inTime if provided, otherwise use current time
        const saveTime = currentInTime || getCurrentDateTime();
        if (onInTimeChange) {
          onInTimeChange(saveTime);
        }

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
          inTime: saveTime,
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
            errorMessage =
              errorData.error || errorData.message || JSON.stringify(errorData);
          } catch (parseError) {
            const text = await response.text();
            console.error("❌ API Error (non-JSON):", text);
            errorMessage = text || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const savedSession = await response.json();

        toast({
          title: "Амжилттай",
          description: "ОРОХ бүртгэл амжилттай хадгалагдлаа",
        });

        // Send to 3rd party app via WebSocket (matching test-websocket.html logic)
        if (savedSession.session && savedSession.session.uniqueCode) {
          try {
            console.log("🚀 Starting send process for IN session...");

            // Step 1: Transform data to 3rd party format (matching test-websocket.html)
            const productName = formState.productId
              ? products.find((p) => p.id === formState.productId)?.label || ""
              : "";
            const transportCompanyName = formState.transporterCompanyId
              ? transportCompanies.find(
                  (t) => t.id === formState.transporterCompanyId
                )?.name || ""
              : "";

            // Get sender and receiver organization names
            let senderOrgName = "";
            let receiverOrgName = "";

            if (formState.senderOrganizationId) {
              try {
                const orgsResponse = await fetch(
                  "/api/organizations?type=sender"
                );
                if (orgsResponse.ok) {
                  const orgs = await orgsResponse.json();
                  const org = orgs.find(
                    (o: any) => o.id === formState.senderOrganizationId
                  );
                  if (org) senderOrgName = org.name;
                }
              } catch (e) {
                // Ignore error
              }
            }

            if (formState.receiverOrganizationId) {
              try {
                const orgsResponse = await fetch(
                  "/api/organizations?type=receiver"
                );
                if (orgsResponse.ok) {
                  const orgs = await orgsResponse.json();
                  const org = orgs.find(
                    (o: any) => o.id === formState.receiverOrganizationId
                  );
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
                LPC:
                  transportCompanyName ||
                  formState.origin.trim() ||
                  senderOrgName,
                NET: 0, // IN session has no net weight
                SLN: "",
                TRL: formState.hasTrailer
                  ? formState.trailerNumber.trim().toUpperCase()
                  : "",
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
            const appBaseUrl =
              typeof window !== "undefined"
                ? window.location.origin
                : "https://gaali.vercel.app";

            const saveResponse = await fetch(
              `${appBaseUrl}/api/third-party/save`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  uniqueCode: savedSession.session.uniqueCode, // Use AKT as unique code
                  data: thirdPartyData,
                }),
              }
            );

            if (!saveResponse.ok) {
              const errorData = await saveResponse.json().catch(() => ({}));
              console.error("❌ ERROR: Failed to save data");
              console.error("❌ Response status:", saveResponse.status);
              console.error("❌ Error data:", errorData);
              throw new Error(
                errorData.error ||
                  `Failed to save data: ${saveResponse.statusText}`
              );
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
            console.log(
              "🔌 Current WebSocket state:",
              ws
                ? `readyState: ${ws.readyState} (OPEN=${WebSocket.OPEN})`
                : "null"
            );

            if (!ws || ws.readyState !== WebSocket.OPEN) {
              console.log(
                "🔌 WebSocket not connected, attempting to connect..."
              );
              try {
                ws = await connectWebSocket();
                console.log("✅ WebSocket connection attempt completed");
                ws = getWebSocket();
                await new Promise((resolve) => setTimeout(resolve, 50));
                ws = getWebSocket();
                if (!ws || ws.readyState !== WebSocket.OPEN) {
                  console.error(
                    "❌ ERROR: WebSocket connection failed or closed immediately"
                  );
                  console.error(
                    "❌ WebSocket states: CONNECTING=0, OPEN=1, CLOSING=2, CLOSED=3"
                  );
                  console.error(
                    "❌ Current state:",
                    ws ? ws.readyState : "null"
                  );
                  console.error(
                    "❌ This usually means the 3rd party app server is not running"
                  );
                  toast({
                    title: "Алдаа",
                    description:
                      "3-р талын програмтай холбогдох боломжгүй байна. Програм ажиллаж байгаа эсэхийг шалгана уу.",
                    variant: "destructive",
                  });
                  return false;
                }
                console.log("✅ WebSocket connection verified and open");
              } catch (error) {
                console.error("❌ ERROR: Failed to connect WebSocket");
                console.error("❌ Error details:", error);
                console.error(
                  "❌ This usually means the 3rd party app server is not running at ws://127.0.0.1:9000/service"
                );
                toast({
                  title: "Алдаа",
                  description:
                    "3-р талын програмтай холбогдох боломжгүй байна. Програм ажиллаж байгаа эсэхийг шалгана уу.",
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
              console.error(
                "❌ ERROR: WebSocket connection is not open before sending"
              );
              toast({
                title: "Алдаа",
                description:
                  "WebSocket холболт тасарсан байна. Дахин оролдоно уу.",
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
                description:
                  "WebSocket холболт тасарсан байна. Дахин оролдоно уу.",
                variant: "destructive",
              });
              return false;
            }

            ws.send(dataUrl);
            console.log("✅ ws.send() completed without throwing error");

            // Step 6: Check connection after a short delay (matching test-websocket.html)
            await new Promise((resolve) => setTimeout(resolve, 100));
            ws = getWebSocket();

            if (!ws || ws.readyState !== WebSocket.OPEN) {
              console.error("❌ ERROR: WebSocket closed after sending!");
              console.error(
                "❌ This usually means the 3rd party app server is not running"
              );
              toast({
                title: "Алдаа",
                description:
                  "3-р талын програмтай холболт тасарсан. Програм ажиллаж байгаа эсэхийг шалгана уу.",
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
            console.error(
              "❌ Error message:",
              sendError instanceof Error ? sendError.message : String(sendError)
            );
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

      // Update inTime to current time before saving
      const currentTime = getCurrentDateTime();
      setFormState((prev) => ({ ...prev, inTime: currentTime }));

      await performSave();
    };

    return (
      <div className="h-full flex flex-col overflow-hidden">
        <form
          onSubmit={handleSubmit}
          className="h-full flex flex-col overflow-hidden"
        >
          {/* Form Content - Single Section Layout */}
          <div className="flex-1 min-h-0 overflow-auto flex justify-center p-4">
            <Card className="p-4 w-full max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
                {/* Standardized FormField Wrapper Pattern:
                    - Label area: fixed height (h-5) with mb-1
                    - Control area: fixed height (h-11 = 44px)
                    - Helper text: optional, fixed height area
                */}

                {/* Plate Number */}
                <div className="flex flex-col">
                  <div className="mb-1.5 flex items-center">
                    <Label
                      htmlFor="plateNumber"
                      className="text-base font-medium text-gray-700"
                    >
                      Улсын дугаар *
                    </Label>
                  </div>
                  {/* Connection Status - Helper Text Area */}
                  {(cameraAutofill.status === "polling" ||
                    cameraAutofill.status === "connected" ||
                    cameraAutofill.status === "connecting" ||
                    (cameraAutofill.status === "error" &&
                      cameraAutofill.error)) && (
                    <div className="mb-1.5">
                      {(cameraAutofill.status === "polling" ||
                        cameraAutofill.status === "connected" ||
                        cameraAutofill.status === "connecting") && (
                        <div className="flex items-center gap-1.5 text-base text-blue-600 whitespace-nowrap">
                          <Camera className="h-5 w-5 animate-pulse shrink-0" />
                          <span className="whitespace-nowrap">
                            {cameraAutofill.status === "connected"
                              ? "Камера холбогдсон"
                              : cameraAutofill.status === "connecting"
                              ? "Камера холбогдож байна..."
                              : "Камера холбогдож байна..."}
                          </span>
                        </div>
                      )}
                      {cameraAutofill.status === "error" &&
                        cameraAutofill.error && (
                          <div className="flex items-center gap-1.5 text-base text-red-600 whitespace-nowrap">
                            <Camera className="h-5 w-5 shrink-0" />
                            <span className="whitespace-nowrap">
                              Камера алдаа: {cameraAutofill.error}
                            </span>
                          </div>
                        )}
                    </div>
                  )}
                  <div className="h-12">
                    <Input
                      ref={setPlateInputRef}
                      id="plateNumber"
                      value={formState.plateNumber}
                      onChange={(e) => {
                        // Don't track typing if we're autofilling (prevents interference)
                        if (!isAutofillingRef.current) {
                          cameraAutofill.trackTyping();
                        }
                        setFormState((prev) => ({
                          ...prev,
                          plateNumber: e.target.value,
                        }));
                        onPlateChange?.(e.target.value);
                      }}
                      onFocus={() => cameraAutofill.trackTyping()}
                      className="h-12 text-lg font-mono font-semibold w-full"
                      placeholder="УБ1234"
                      required
                    />
                  </div>
                </div>

                {/* Weight Input */}
                <div className="flex flex-col">
                  <div className="mb-1.5 flex items-center">
                    <Label
                      htmlFor="grossWeightKg"
                      className="text-base font-medium text-gray-700"
                    >
                      Бүрэн жин (кг) *
                    </Label>
                  </div>
                  <div className="h-12">
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
                      className="h-12 text-lg w-full"
                      placeholder="Жин оруулах (кг)"
                      required
                    />
                  </div>
                </div>

                {/* Trailer Checkbox and Input */}
                <div className="flex flex-col">
                  <div className="mb-1.5 flex items-center">
                    <Label className="text-base font-medium text-gray-700">
                      Чиргүүл
                    </Label>
                  </div>
                  <div className="h-12 flex items-center gap-2">
                    <label className="flex items-center gap-2 shrink-0 cursor-pointer">
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
                      <span className="text-base font-medium text-gray-700 leading-none">
                        Чиргүүлтэй
                      </span>
                    </label>
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
                        className="h-12 text-lg font-mono flex-1"
                        placeholder="УБ1234"
                      />
                    )}
                  </div>
                </div>

                {/* Driver */}
                <div className="flex flex-col">
                  <div className="mb-1.5 flex items-center">
                    <Label
                      htmlFor="driverId"
                      className="text-base font-medium text-gray-700"
                    >
                      Жолооч *
                    </Label>
                  </div>
                  <div className="h-12 flex items-center gap-2">
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
                          isLoadingDrivers ? "Уншиж байна..." : "Жолооч сонгох"
                        }
                        searchPlaceholder="Жолооч хайх..."
                        className="h-12"
                      />
                    </div>
                    <div className="h-12 flex items-center">
                      <DriverManager
                        drivers={drivers}
                        onDriverAdded={handleDriverAdded}
                        onDriverUpdated={handleDriverAdded}
                      />
                    </div>
                  </div>
                </div>

                {/* Transport Company */}
                <div className="flex flex-col">
                  <div className="mb-1.5 flex items-center">
                    <Label
                      htmlFor="transporterCompanyId"
                      className="text-base font-medium text-gray-700"
                    >
                      Тээврийн компани *
                    </Label>
                  </div>
                  <div className="h-12">
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
                      className="h-12"
                    />
                  </div>
                </div>

                {/* Product */}
                <div className="flex flex-col">
                  <div className="mb-1.5 flex items-center">
                    <Label
                      htmlFor="productId"
                      className="text-base font-medium text-gray-700"
                    >
                      Бүтээгдэхүүн *
                    </Label>
                  </div>
                  <div className="h-12">
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
                      className="h-12"
                    />
                  </div>
                </div>

                {/* Origin */}
                <div className="flex flex-col">
                  <div className="mb-1.5 flex items-center">
                    <Label
                      htmlFor="origin"
                      className="text-base font-medium text-gray-700"
                    >
                      Хаанаас
                    </Label>
                  </div>
                  <div className="h-12">
                    <Input
                      id="origin"
                      value={formState.origin}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          origin: e.target.value,
                        }))
                      }
                      className="h-12 text-lg w-full"
                      placeholder="Гарах газар"
                    />
                  </div>
                </div>

                {/* Destination */}
                <div className="flex flex-col">
                  <div className="mb-1.5 flex items-center">
                    <Label
                      htmlFor="destination"
                      className="text-base font-medium text-gray-700"
                    >
                      Хаашаа
                    </Label>
                  </div>
                  <div className="h-12">
                    <Input
                      id="destination"
                      value={formState.destination}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          destination: e.target.value,
                        }))
                      }
                      className="h-12 text-lg w-full"
                      placeholder="Очих газар"
                    />
                  </div>
                </div>

                {/* Sender Organization */}
                <div className="flex flex-col">
                  <div className="mb-1.5 flex items-center">
                    <Label
                      htmlFor="senderOrganizationId"
                      className="text-base font-medium text-gray-700"
                    >
                      Илгээч байгууллага
                    </Label>
                  </div>
                  <div className="h-12">
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
                      className="h-12"
                    />
                  </div>
                </div>

                {/* Receiver Organization */}
                <div className="flex flex-col">
                  <div className="mb-1.5 flex items-center">
                    <Label
                      htmlFor="receiverOrganizationId"
                      className="text-base font-medium text-gray-700"
                    >
                      Хүлээн авагч байгууллага
                    </Label>
                  </div>
                  <div className="h-12">
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
                      className="h-12"
                    />
                  </div>
                </div>

                {/* Notes - Wider, Reduced Height */}
                <div className="md:col-span-2 flex flex-col">
                  <div className="mb-1.5 flex items-center">
                    <Label
                      htmlFor="notes"
                      className="text-base font-medium text-gray-700"
                    >
                      Нэмэлт мэдээлэл
                    </Label>
                  </div>
                  <div className="max-w-[calc(66.666%-0.5rem)]">
                    <Textarea
                      id="notes"
                      value={formState.notes}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      className="text-base resize-y h-20 w-full"
                      placeholder="Нэмэлт мэдээлэл..."
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-gray-200">
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
                  className="h-12 px-5 text-base"
                >
                  Цэвэрлэх
                </Button>
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700 h-11 px-4 text-sm"
                >
                  {isSaving ? "Хадгалж байна..." : "Хадгалах"}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    // Store destination value for out-session auto-fill
                    if (formState.destination.trim()) {
                      localStorage.setItem(
                        "inSessionDestination",
                        formState.destination.trim()
                      );
                    }
                    router.push("/out-session");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 h-11 px-4 text-sm"
                >
                  ГАРАХ бүртгэл
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </Card>
          </div>
        </form>
      </div>
    );
  }
);

InSessionForm.displayName = "InSessionForm";
