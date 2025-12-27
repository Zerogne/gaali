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
import { exportLogToPDF } from "@/lib/pdf-export";
import type { Product } from "@/lib/products/products";
import type {
  Driver,
  Organization,
  TransportCompany,
  TruckLog,
} from "@/lib/types";
import { ArrowRight, Camera, Printer } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

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
  autoFillOrigin?: string | null;
  onPlateChange?: (plate: string) => void;
  onHasUnsavedDataChange?: (hasData: boolean) => void;
  onSaveRequest?: () => Promise<boolean>;
  streamUrl?: string;
  cameraAutofill?: ReturnType<typeof useLprPlateAutofill>;
  editLog?: TruckLog | null;
  editLogId?: string | null;
}

export interface OutSessionFormHandle {
  hasUnsavedData: () => boolean;
  triggerSave: () => Promise<boolean>;
  getDestination: () => string;
}

export const OutSessionForm = forwardRef<
  OutSessionFormHandle,
  OutSessionFormProps
>(
  (
    {
      autoFillPlate,
      autoFillOrigin,
      onPlateChange,
      onHasUnsavedDataChange,
      onSaveRequest,
      streamUrl,
      cameraAutofill: externalCameraAutofill,
      editLog,
      editLogId,
    },
    ref
  ) => {
    const { toast } = useToast();
    const router = useRouter();
    const isAutofillingRef = useRef(false);
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
    // Use WebSocket for real-time camera updates (preferred)
    // Falls back to polling if WebSocket not available
    const internalCameraAutofillWs = useCameraBridgeWebSocket();
    const internalCameraAutofill = useLprPlateAutofill();
    // Prefer WebSocket if enabled (even if connecting), otherwise use external or polling
    const cameraAutofill = internalCameraAutofillWs.isEnabled
      ? internalCameraAutofillWs
      : externalCameraAutofill || internalCameraAutofill;

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
        const outTime = editLog.createdAt
          ? new Date(editLog.createdAt).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16);

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
          outTime: outTime,
          outWeightKg: editLog.weightKg || null,
          netWeightKg: editLog.netWeightKg || null,
          sealNumber: editLog.sealNumber || "",
          hasTrailer: editLog.hasTrailer || false,
          trailerNumber: editLog.trailerPlate || "",
          notes: editLog.comments || "",
          inSessionId: undefined,
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
        console.log(
          "🔗 [OUT] Binding autofill to input, plate:",
          cameraAutofill.plate
        );
        cameraAutofill.bindToInput({
          getValue: () => formState.plateNumber,
          setValue: (value: string) => {
            console.log("📝 [OUT] Autofill setValue called with:", value);
            setFormState((prev) => ({ ...prev, plateNumber: value }));
          },
          isFocused: () => document.activeElement === plateInputRef,
        });
      } else {
        console.log("⚠️ [OUT] plateInputRef is null, cannot bind autofill");
      }
    }, [plateInputRef, cameraAutofill]);

    // Auto-fill plate from camera
    useEffect(() => {
      if (autoFillPlate && !formState.plateNumber) {
        setFormState((prev) => ({ ...prev, plateNumber: autoFillPlate }));
        onPlateChange?.(autoFillPlate);
      }
    }, [autoFillPlate, formState.plateNumber, onPlateChange]);

    // Auto-fill origin from in-session destination
    useEffect(() => {
      if (autoFillOrigin && !formState.origin) {
        setFormState((prev) => ({ ...prev, origin: autoFillOrigin }));
      }
    }, [autoFillOrigin, formState.origin]);

    const handleWeightDetected = (weightKg: number) => {
      setFormState((prev) => ({
        ...prev,
        outWeightKg: weightKg,
      }));
    };

    // Auto-fill all data from IN session when plate number is entered
    useEffect(() => {
      // Only fetch if we have a plate number (at least 2 characters to avoid too many requests)
      const plateNumber = formState.plateNumber.trim();
      if (!plateNumber || plateNumber.length < 2) {
        return;
      }

      console.log(
        "🔍 Auto-fill: Plate number entered:",
        formState.plateNumber.trim()
      );

      // Don't auto-fill if user is currently typing (debounce)
      const timeoutId = setTimeout(async () => {
        try {
          const plateNumber = formState.plateNumber.trim();
          console.log(
            "🔍 Auto-fill: Fetching IN session for plate:",
            plateNumber
          );

          // Find the latest IN session and log for this plate number
          const response = await fetch(
            `/api/truck-sessions/find-in?plateNumber=${encodeURIComponent(
              plateNumber
            )}`
          );

          console.log("🔍 Auto-fill: Response status:", response.status);

          if (response.ok) {
            const data = await response.json();
            console.log("🔍 Auto-fill: Response data:", data);

            if (data.success && data.session) {
              const inSession = data.session;
              const inLog = data.log; // Log has all the fields

              console.log("✅ Auto-fill: Found IN session:", inSession.id);
              console.log("✅ Auto-fill: Found IN log:", inLog ? "Yes" : "No");
              console.log(
                "✅ Auto-fill: IN session plate:",
                inSession.plateNumber
              );
              console.log(
                "✅ Auto-fill: IN session weight:",
                inSession.grossWeightKg
              );
              console.log(
                "✅ Auto-fill: IN log data:",
                inLog ? JSON.stringify(inLog, null, 2) : "No log"
              );

              // Auto-fill all available data (only if fields are empty or not set)
              setFormState((prev) => {
                const updates: Partial<OutSessionFormState> = {
                  inSessionId: inSession.id,
                };

                // Helper to check if field is empty
                const isEmpty = (value: any) =>
                  !value || (typeof value === "string" && value.trim() === "");

                // Auto-fill driver - try log first, then session
                if (isEmpty(prev.driverId)) {
                  if (inLog?.driverId) {
                    const matchingDriver = drivers.find(
                      (d) => d.id === inLog.driverId
                    );
                    if (matchingDriver) {
                      updates.driverId = matchingDriver.id;
                      updates.driverName = matchingDriver.name;
                      console.log(
                        "✅ Auto-fill: Filled driver (from log):",
                        matchingDriver.name
                      );
                    }
                  }
                  if (!updates.driverId && inSession.driverName) {
                    // Fallback to driver name matching from session
                    const matchingDriver = drivers.find(
                      (d) => d.name === inSession.driverName
                    );
                    if (matchingDriver) {
                      updates.driverId = matchingDriver.id;
                      updates.driverName = matchingDriver.name;
                      console.log(
                        "✅ Auto-fill: Filled driver (from session):",
                        matchingDriver.name
                      );
                    }
                  }
                }

                // Auto-fill product - try log first, then session
                if (isEmpty(prev.productId)) {
                  if (inLog?.cargoType) {
                    const matchingProduct = products.find(
                      (p) => p.label === inLog.cargoType
                    );
                    if (matchingProduct) {
                      updates.productId = matchingProduct.id;
                      console.log(
                        "✅ Auto-fill: Filled product (from log):",
                        matchingProduct.label
                      );
                    }
                  }
                  if (!updates.productId && inSession.product) {
                    const matchingProduct = products.find(
                      (p) => p.label === inSession.product
                    );
                    if (matchingProduct) {
                      updates.productId = matchingProduct.id;
                      console.log(
                        "✅ Auto-fill: Filled product (from session):",
                        matchingProduct.label
                      );
                    }
                  }
                }

                // Auto-fill transport company - from log
                if (
                  isEmpty(prev.transporterCompanyId) &&
                  inLog?.transportCompanyId
                ) {
                  updates.transporterCompanyId = inLog.transportCompanyId;
                  console.log(
                    "✅ Auto-fill: Filled transport company:",
                    inLog.transportCompanyId
                  );
                }

                // Auto-fill origin - from log
                if (isEmpty(prev.origin) && inLog?.origin) {
                  updates.origin = inLog.origin;
                  console.log("✅ Auto-fill: Filled origin:", inLog.origin);
                }

                // Auto-fill destination - from log
                if (isEmpty(prev.destination) && inLog?.destination) {
                  updates.destination = inLog.destination;
                  console.log(
                    "✅ Auto-fill: Filled destination:",
                    inLog.destination
                  );
                }

                // Auto-fill sender organization - from log
                if (
                  isEmpty(prev.senderOrganizationId) &&
                  inLog?.senderOrganizationId
                ) {
                  updates.senderOrganizationId = inLog.senderOrganizationId;
                  console.log(
                    "✅ Auto-fill: Filled sender organization:",
                    inLog.senderOrganizationId
                  );
                }

                // Auto-fill receiver organization - from log
                if (
                  isEmpty(prev.receiverOrganizationId) &&
                  inLog?.receiverOrganizationId
                ) {
                  updates.receiverOrganizationId = inLog.receiverOrganizationId;
                  console.log(
                    "✅ Auto-fill: Filled receiver organization:",
                    inLog.receiverOrganizationId
                  );
                }

                // Auto-fill seal number - from log
                if (isEmpty(prev.sealNumber) && inLog?.sealNumber) {
                  updates.sealNumber = inLog.sealNumber;
                  console.log(
                    "✅ Auto-fill: Filled seal number:",
                    inLog.sealNumber
                  );
                }

                // Auto-fill trailer info - from log
                if (inLog?.hasTrailer !== undefined) {
                  if (prev.hasTrailer !== inLog.hasTrailer) {
                    updates.hasTrailer = inLog.hasTrailer;
                    console.log(
                      "✅ Auto-fill: Filled hasTrailer:",
                      inLog.hasTrailer
                    );
                  }
                  if (
                    inLog.hasTrailer &&
                    inLog.trailerPlate &&
                    isEmpty(prev.trailerNumber)
                  ) {
                    updates.trailerNumber = inLog.trailerPlate;
                    console.log(
                      "✅ Auto-fill: Filled trailer number:",
                      inLog.trailerPlate
                    );
                  }
                }

                // Auto-fill notes - from log
                if (isEmpty(prev.notes) && inLog?.comments) {
                  updates.notes = inLog.comments;
                  console.log("✅ Auto-fill: Filled notes:", inLog.comments);
                }

                console.log("✅ Auto-fill: Updates to apply:", updates);
                console.log(
                  "✅ Auto-fill: Total fields to update:",
                  Object.keys(updates).length
                );
                return { ...prev, ...updates };
              });
            } else {
              console.log("⚠️ Auto-fill: Response OK but no session in data");
            }
          } else {
            // Handle error responses
            let errorData;
            try {
              errorData = await response.json();
            } catch {
              errorData = { error: `HTTP ${response.status}` };
            }

            if (response.status === 404) {
              console.log(
                "⚠️ Auto-fill: 404 - No IN session found for plate:",
                plateNumber
              );
              console.log(
                "⚠️ Auto-fill: Error message:",
                errorData.error || "Not found"
              );
              // This is normal - just means there's no IN session for this plate yet
            } else {
              console.error(
                "❌ Auto-fill: API error:",
                response.status,
                errorData
              );
            }
          }
        } catch (error) {
          console.error("❌ Auto-fill: Error fetching IN session:", error);
        }
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }, [formState.plateNumber, drivers, products]);

    // Auto-calculate net weight when plate number and out weight are filled
    useEffect(() => {
      const calculateNetWeight = async () => {
        // Only calculate if we have plate number and out weight is set (can be 0)
        if (
          !formState.plateNumber.trim() ||
          formState.outWeightKg === null ||
          formState.outWeightKg === undefined
        ) {
          return;
        }

        try {
          // Find the latest IN session for this plate number
          const response = await fetch(
            `/api/truck-sessions/find-in?plateNumber=${encodeURIComponent(
              formState.plateNumber.trim()
            )}`
          );

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.session) {
              const inSession = data.session;

              // Calculate net weight: IN weight - OUT weight
              // Positive = cargo unloaded, Negative = cargo loaded
              const inWeight = inSession.grossWeightKg || 0;
              const outWeight = formState.outWeightKg || 0;
              const netWeight = inWeight - outWeight;

              // Show the actual calculated value (can be negative if cargo was loaded)
              // Negative values indicate cargo was loaded (OUT > IN)
              // Positive values indicate cargo was unloaded (IN > OUT)

              // Update form state with calculated net weight
              setFormState((prev) => ({
                ...prev,
                inSessionId: inSession.id,
                netWeightKg: netWeight,
              }));

              console.log("📊 Net weight calculation:", {
                inWeight,
                outWeight,
                netWeight,
                meaning:
                  netWeight > 0
                    ? "Cargo unloaded"
                    : netWeight < 0
                    ? "Cargo loaded"
                    : "No change",
              });
            }
          }
        } catch (error) {
          console.error("Error calculating net weight:", error);
          // Don't show error - just silently fail
        }
      };

      calculateNetWeight();
    }, [formState.plateNumber, formState.outWeightKg]);

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
        formState.outWeightKg ||
        formState.netWeightKg ||
        formState.sealNumber.trim() ||
        formState.hasTrailer ||
        formState.trailerNumber.trim() ||
        formState.notes.trim() ||
        formState.inSessionId
      );
    };

    // Notify parent when unsaved data changes
    useEffect(() => {
      onHasUnsavedDataChange?.(hasUnsavedData());
    }, [formState, onHasUnsavedDataChange]); // eslint-disable-line react-hooks/exhaustive-deps

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

          if (!formState.outWeightKg) {
            toast({
              title: "Алдаа",
              description: "Гарах жин оруулах шаардлагатай",
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
            weightKg: formState.outWeightKg || undefined,
            netWeightKg:
              formState.netWeightKg !== null &&
              formState.netWeightKg !== undefined
                ? formState.netWeightKg
                : undefined,
            hasTrailer: formState.hasTrailer || undefined,
            trailerPlate:
              formState.hasTrailer && formState.trailerNumber.trim()
                ? formState.trailerNumber.trim().toUpperCase()
                : undefined,
            sealNumber: formState.sealNumber.trim() || undefined,
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
            outTime: new Date().toISOString().slice(0, 16),
            outWeightKg: null,
            netWeightKg: null,
            sealNumber: "",
            hasTrailer: false,
            trailerNumber: "",
            notes: "",
            inSessionId: undefined,
          });

          return true;
        }

        // Otherwise, create a new session
        // Update outTime to current time before saving
        const currentTime = getCurrentDateTime();
        setFormState((prev) => ({ ...prev, outTime: currentTime }));

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
          netWeightKg:
            formState.netWeightKg !== null &&
            formState.netWeightKg !== undefined
              ? formState.netWeightKg
              : undefined,
          inSessionId: formState.inSessionId
            ? formState.inSessionId
            : undefined,
          outTime: currentTime,
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
          description: "ГАРАХ бүртгэл амжилттай хадгалагдлаа",
        });

        // Send to 3rd party app via WebSocket (matching test-websocket.html logic)
        if (savedSession.session && savedSession.session.uniqueCode) {
          try {
            console.log("🚀 Starting send process for OUT session...");

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
                NET: formState.netWeightKg || 0,
                SLN: formState.sealNumber.trim(),
                TRL: formState.hasTrailer
                  ? formState.trailerNumber.trim().toUpperCase()
                  : "",
                UPC: formState.destination.trim() || receiverOrgName,
                VNO: formState.plateNumber.trim().toUpperCase(),
                WGT: formState.outWeightKg || 0,
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
          outTime: new Date().toISOString().slice(0, 16),
          outWeightKg: null,
          netWeightKg: null,
          sealNumber: "",
          hasTrailer: false,
          trailerNumber: "",
          notes: "",
          inSessionId: undefined,
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

      if (!formState.outWeightKg) {
        toast({
          title: "Алдаа",
          description: "Гарах жин оруулах шаардлагатай",
          variant: "destructive",
        });
        return;
      }

      // Update outTime to current time before saving
      const currentTime = getCurrentDateTime();
      setFormState((prev) => ({ ...prev, outTime: currentTime }));

      await performSave();
    };

    return (
      <div className="h-full flex flex-col overflow-hidden">
        <form
          onSubmit={handleSubmit}
          className="h-full flex flex-col overflow-hidden p-3"
        >
          {/* Form Content - No Scroll, Grid Layout */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <div className="grid grid-cols-2 gap-1.5 h-full">
              {/* Left Column */}
              <div className="flex flex-col gap-2 overflow-hidden min-h-0">
                {/* Basic Info */}
                <Card className="p-2 flex-1 min-h-0 flex flex-col">
                  <div className="flex flex-col gap-1.5 flex-1 min-h-0">
                    {/* Plate Number - First Input */}
                    <div>
                      <Label
                        htmlFor="plateNumber"
                        className="text-xs font-medium text-gray-700 mb-1 block"
                      >
                        Улсын дугаар *
                      </Label>
                      {/* Connection Status - Above Input */}
                      {(cameraAutofill.status === "polling" ||
                        cameraAutofill.status === "connected" ||
                        cameraAutofill.status === "connecting") && (
                        <div className="flex items-center gap-1.5 text-xs text-blue-600 mb-1 whitespace-nowrap">
                          <Camera className="h-3 w-3 animate-pulse shrink-0" />
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
                          <div className="flex items-center gap-1.5 text-xs text-red-600 mb-1 whitespace-nowrap">
                            <Camera className="h-3 w-3 shrink-0" />
                            <span className="whitespace-nowrap">
                              Камера алдаа: {cameraAutofill.error}
                            </span>
                          </div>
                        )}
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
                        className="h-9 text-sm font-mono font-semibold w-full"
                        placeholder="УБ1234"
                        required
                      />
                    </div>
                    {/* Trailer Checkbox */}
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
                          className="h-9 text-xs font-mono w-full"
                          placeholder="УБ1234"
                        />
                      )}
                    </div>
                    {/* Weight Input */}
                    <div>
                      <Label
                        htmlFor="outWeightKg"
                        className="text-xs font-medium text-gray-700 mb-1 block"
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
                        className="h-9 text-sm w-full"
                        placeholder="Жин оруулах (кг)"
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="netWeightKg"
                        className="text-xs font-medium text-gray-700 mb-1 block"
                      >
                        Цэвэр жин (кг) *
                      </Label>
                      <Input
                        id="netWeightKg"
                        type="number"
                        value={
                          formState.netWeightKg !== null
                            ? Math.abs(formState.netWeightKg)
                            : ""
                        }
                        onChange={(e) => {
                          if (e.target.value === "") {
                            setFormState((prev) => ({
                              ...prev,
                              netWeightKg: null,
                            }));
                            return;
                          }
                          const value = parseFloat(e.target.value) || 0;
                          const currentValue = formState.netWeightKg;
                          const newValue =
                            currentValue !== null && currentValue < 0
                              ? -Math.abs(value)
                              : Math.abs(value);
                          setFormState((prev) => ({
                            ...prev,
                            netWeightKg: newValue,
                          }));
                        }}
                        className="h-9 text-sm w-full"
                        placeholder="Цэвэр жин (кг)"
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
                            className="h-9"
                          />
                        </div>
                        <DriverManager
                          drivers={drivers}
                          onDriverAdded={handleDriverAdded}
                          onDriverUpdated={handleDriverAdded}
                        />
                      </div>
                    </div>
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
                        className="h-9"
                      />
                    </div>
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
                        className="h-9 text-sm w-full"
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
                        className="h-9 text-sm w-full"
                        placeholder="Очих газар"
                      />
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
                        className="h-9"
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
                        className="h-9"
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
                        className="h-9"
                      />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-2 overflow-hidden min-h-0">
                {/* Seal Number */}
                <Card className="p-2.5 shrink-0">
                  <div>
                    <Label
                      htmlFor="sealNumber"
                      className="text-xs font-medium text-gray-700 mb-1 block"
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
                      className="h-9 text-sm w-full"
                      placeholder="Лацны дугаар оруулах"
                    />
                  </div>
                </Card>
                {/* Exit Time */}
                <Card className="p-2.5 shrink-0">
                  <div>
                    <Label
                      htmlFor="outTime"
                      className="text-xs font-medium text-gray-700 mb-1 block"
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
                      onFocus={(e) => {
                        const currentTime = getCurrentDateTime();
                        setFormState((prev) => ({
                          ...prev,
                          outTime: currentTime,
                        }));
                        e.target.value = currentTime;
                      }}
                      className="h-9 text-sm w-full"
                      required
                    />
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
                          outTime: new Date().toISOString().slice(0, 16),
                          outWeightKg: null,
                          netWeightKg: null,
                          sealNumber: "",
                          hasTrailer: false,
                          trailerNumber: "",
                          notes: "",
                          inSessionId: undefined,
                        });
                      }}
                      className="h-9 px-4 text-xs"
                    >
                      Цэвэрлэх
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        try {
                          // Convert form state to TruckLog format for PDF export
                          const productName = formState.productId
                            ? products.find((p) => p.id === formState.productId)
                                ?.label || ""
                            : "";

                          // Try to fetch the OUT session's unique code if it exists
                          let uniqueCode: string | null = null;
                          try {
                            const sessionsResponse = await fetch(
                              `/api/truck-sessions?direction=OUT&plateNumber=${encodeURIComponent(
                                formState.plateNumber.trim()
                              )}&limit=10`
                            );
                            if (sessionsResponse.ok) {
                              const sessionsData =
                                await sessionsResponse.json();
                              // Find the session that matches the out time (if available)
                              const outTime = formState.outTime
                                ? new Date(formState.outTime)
                                : new Date();
                              const outSession =
                                sessionsData.sessions?.find((s: any) => {
                                  const sessionDate = new Date(s.createdAt);
                                  return (
                                    Math.abs(
                                      sessionDate.getTime() - outTime.getTime()
                                    ) < 3600000
                                  );
                                }) || sessionsData.sessions?.[0];

                              if (outSession?.uniqueCode) {
                                uniqueCode = outSession.uniqueCode;
                                console.log(
                                  "✅ Print: Found OUT session unique code:",
                                  uniqueCode
                                );
                              }
                            }
                          } catch (e) {
                            console.warn(
                              "Could not fetch OUT session unique code:",
                              e
                            );
                          }

                          // If no OUT session found, generate a new unique code for the OUT session
                          if (!uniqueCode) {
                            try {
                              const generateResponse = await fetch(
                                "/api/truck-sessions/generate-code"
                              );
                              if (generateResponse.ok) {
                                const generateData =
                                  await generateResponse.json();
                                uniqueCode = generateData.uniqueCode;
                                console.log(
                                  "✅ Print: Generated new unique code for OUT session:",
                                  uniqueCode
                                );
                              }
                            } catch (e) {
                              console.warn(
                                "Could not generate unique code:",
                                e
                              );
                            }
                          }

                          const logData: TruckLog = {
                            id: formState.inSessionId || `temp-${Date.now()}`,
                            direction: "OUT",
                            plate: formState.plateNumber.trim().toUpperCase(),
                            driverId: formState.driverId || undefined,
                            driverName: formState.driverName || "",
                            cargoType: productName || "",
                            weightKg: formState.outWeightKg || undefined,
                            netWeightKg: formState.netWeightKg || undefined,
                            comments: formState.notes || undefined,
                            origin: formState.origin || undefined,
                            destination: formState.destination || undefined,
                            senderOrganizationId:
                              formState.senderOrganizationId || undefined,
                            receiverOrganizationId:
                              formState.receiverOrganizationId || undefined,
                            transportCompanyId:
                              formState.transporterCompanyId || undefined,
                            sealNumber: formState.sealNumber || undefined,
                            hasTrailer: formState.hasTrailer || undefined,
                            trailerPlate: formState.trailerNumber || undefined,
                            createdAt: formState.outTime
                              ? new Date(formState.outTime).toISOString()
                              : new Date().toISOString(),
                            sentToCustoms: false,
                          };

                          // Pass the unique code directly to the export function
                          await exportLogToPDF(logData, uniqueCode);

                          toast({
                            title: "Амжилттай",
                            description: "PDF файл татагдлаа",
                          });
                        } catch (error) {
                          console.error("Error exporting PDF:", error);
                          toast({
                            title: "Алдаа",
                            description: "PDF файл татахад алдаа гарлаа",
                            variant: "destructive",
                          });
                        }
                      }}
                      disabled={
                        !formState.plateNumber.trim() ||
                        !formState.outWeightKg ||
                        !formState.netWeightKg
                      }
                      className="h-9 px-4 text-xs"
                      title="PDF файл татах"
                    >
                      <Printer className="w-4 h-4 mr-1" />
                      Хэвлэх
                    </Button>
                    <Button
                      type="submit"
                      onClick={handleSubmit}
                      disabled={
                        !formState.outWeightKg ||
                        !formState.netWeightKg ||
                        isSaving
                      }
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 h-9 px-4 text-xs flex-1"
                    >
                      {isSaving ? "Хадгалж байна..." : "Хадгалах"}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => router.push("/in-session")}
                      className="bg-blue-600 hover:bg-blue-700 h-9 px-4 text-xs"
                    >
                      ОРОХ бүртгэл
                      <ArrowRight className="h-3 w-3 ml-2" />
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

OutSessionForm.displayName = "OutSessionForm";
