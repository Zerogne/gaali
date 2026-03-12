"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FilterableSelect } from "@/components/ui/filterable-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useThirdPartyAutofill } from "@/hooks/useThirdPartyAutofill";
import { useWeightStatus } from "@/hooks/useWeightStatus";
import { useLatestLpr } from "@/hooks/useLatestLpr";
import { useRfidStatus } from "@/hooks/useRfidStatus";
import { updateTruckLog, sendTruckLogToCustoms } from "@/lib/api";
import { printLog } from "@/lib/pdf-export";
import type { Product } from "@/lib/products/products";
import type {
  Driver,
  Organization,
  TransportCompany,
  TruckLog,
  Location,
} from "@/lib/types";
import { ArrowRight, Camera, Printer, Send, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
// Camera real-time video feature removed
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

// Helper function to get current datetime in datetime-local format (local time)
const getCurrentDateTime = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Helper function to convert Date/ISO string to local datetime-local format (without timezone conversion)
const toLocalDateTime = (date: Date | string | null | undefined): string => {
  if (!date) return getCurrentDateTime();
  const d = typeof date === "string" ? new Date(date) : date;
  // Use local time components, not UTC
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

interface OutSessionFormState {
  plateNumber: string;
  rfid: string;
  driverId: string;
  driverName: string;
  productId: string;
  transporterCompanyId: string;
  origin: string;
  destination: string;
  senderOrganizationId: string;
  receiverOrganizationId: string;
  outTime: string;
  inTime: string; // Added from IN form
  outWeightKg: number | null;
  netWeightKg: number | null;
  grossWeightKg: number | null; // Added from IN form (totalWeight)
  carWeight: number | null; // Added from IN form
  trailerWeight: number | null; // Added from IN form
  totalWeight: number | null; // Added from IN form
  sealNumber: string;
  hasTrailer: boolean;
  trailerNumber: string;
  bagQuantity: string;
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
  cameraAutofill?: any; // Not used - kept for prop compatibility (auto-fill disabled in Out Session)
  editLog?: TruckLog | null;
  editLogId?: string | null;
  outTime?: string;
  onOutTimeChange?: (time: string) => void;
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
      cameraAutofill: externalCameraAutofill, // Not used - kept for prop compatibility
      editLog,
      editLogId,
      outTime: externalOutTime,
      onOutTimeChange,
    },
    ref
  ) => {
    const { toast } = useToast();
    const router = useRouter();
    const isAutofillingRef = useRef(false);
    const isRfidAutofillingRef = useRef(false);
    const rfidManuallyEditedRef = useRef(false);
    const { sendFormData } = useThirdPartyAutofill();
    const [isSaving, setIsSaving] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [createDialogType, setCreateDialogType] = useState<"transportCompany" | "product" | "organization" | "driver" | "trailer" | "location" | null>(null);
    const [createDialogInitialValue, setCreateDialogInitialValue] = useState("");
    const [createDialogName, setCreateDialogName] = useState("");
    const [createDialogCompanyId, setCreateDialogCompanyId] = useState("");
    const [createDialogContract, setCreateDialogContract] = useState("");
    const [createDialogPhone, setCreateDialogPhone] = useState("");
    const [createDialogRegistrationNumber, setCreateDialogRegistrationNumber] = useState("");
    const [createDialogAdditionalInfo, setCreateDialogAdditionalInfo] = useState("");
    const [createDialogOwnerName, setCreateDialogOwnerName] = useState("");
    const [createDialogOwnerId, setCreateDialogOwnerId] = useState("");
    const [createDialogLocationName, setCreateDialogLocationName] = useState("");
    const [createDialogLocationType, setCreateDialogLocationType] = useState<"seller" | "buyer" | "">("");
    const [isCreatingInDialog, setIsCreatingInDialog] = useState(false);
    const manuallyClearedRef = useRef(false); // Tracks if user manually edited plate (disables auto-fill for session)
    const [plateInputRef, setPlateInputRef] = useState<HTMLInputElement | null>(
      null
    );
    
    // Plate number auto-fill for Out Session - filters by camera 2 (exit camera)
    // In Session uses camera 1 (entry camera), Out Session uses camera 2 (exit camera)
    const { latest: latestLpr } = useLatestLpr(1000, 2); // Poll every 1 second, filter by camera 2
    const rfidStatus = useRfidStatus({ pollInterval: 1000, enabled: true });

    // Check weight device connection status
    const weightStatus = useWeightStatus({
      enabled: true,
      pollInterval: 10000, // Check every 10 seconds
    });


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
    const [trailers, setTrailers] = useState<Array<{ id: string; plateNumber: string; ownerName: string; ownerId: string; ownerPhone: string }>>([]);
    const [isLoadingTrailers, setIsLoadingTrailers] = useState(true);
    const [locations, setLocations] = useState<Location[]>([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(true);
    const [inWeightKg, setInWeightKg] = useState<number | null>(null);
    const [savedUniqueCode, setSavedUniqueCode] = useState<string | null>(null);
    const [savedSessionId, setSavedSessionId] = useState<string | null>(null);
    const [savedLogId, setSavedLogId] = useState<string | null>(null);
    const [carWeightLocked, setCarWeightLocked] = useState(false); // Added from IN form
    const [hasInSessionData, setHasInSessionData] = useState(false); // Track if data came from IN session

    const [formState, setFormState] = useState<OutSessionFormState>({
      plateNumber: "",
      rfid: "",
      driverId: "",
      driverName: "",
      productId: "",
      transporterCompanyId: "",
      origin: "",
      destination: "",
      senderOrganizationId: "",
      receiverOrganizationId: "",
      outTime: externalOutTime || getCurrentDateTime(),
      inTime: getCurrentDateTime(), // Added from IN form
      outWeightKg: null,
      netWeightKg: null,
      grossWeightKg: null, // Added from IN form
      carWeight: 0, // Added from IN form
      trailerWeight: 0, // Added from IN form
      totalWeight: 0, // Added from IN form
      sealNumber: "",
      hasTrailer: false,
      trailerNumber: "",
      bagQuantity: "",
      notes: "",
      inSessionId: undefined,
    });

    // RFID auto-fill (same pattern as weight: use status latest, do not overwrite manual entry)
    useEffect(() => {
      const value = rfidStatus.status.latestRfid?.trim();
      if (!value) return;
      if (rfidManuallyEditedRef.current) return;

      isRfidAutofillingRef.current = true;
      setFormState((prev) => {
        if (prev.rfid && prev.rfid.trim()) return prev;
        return { ...prev, rfid: value };
      });
      setTimeout(() => {
        isRfidAutofillingRef.current = false;
      }, 0);
    }, [rfidStatus.status.latestRfid]);

    // Sync external outTime with form state
    useEffect(() => {
      if (externalOutTime) {
        setFormState((prev) => ({ ...prev, outTime: externalOutTime }));
      }
    }, [externalOutTime]);

    // Sync inTime (similar to IN form, but for OUT form we also track inTime)
    // InTime can be set from the IN session if linked
    useEffect(() => {
      // If we have an inSessionId, we might want to fetch the inTime from that session
      // For now, just ensure inTime is set to current time if empty
      if (!formState.inTime) {
        setFormState((prev) => ({ ...prev, inTime: getCurrentDateTime() }));
      }
    }, [formState.inTime]);

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

        // Fetch session data to get stored outTime and inTime, or convert createdAt to local time
        let outTime = getCurrentDateTime();
        let inTime = getCurrentDateTime();
        
        const fetchSessionTimes = async () => {
          try {
            // Fetch OUT session for outTime
            const outResponse = await fetch(
              `/api/truck-sessions?direction=OUT&plateNumber=${encodeURIComponent(editLog.plate)}&limit=1`
            );
            if (outResponse.ok) {
              const outData = await outResponse.json();
              if (outData.sessions && outData.sessions.length > 0) {
                const session = outData.sessions[0];
                // Use stored outTime if available, otherwise convert createdAt to local time
                if (session.outTime) {
                  outTime = session.outTime; // Already in datetime-local format
                } else if (session.createdAt) {
                  outTime = toLocalDateTime(session.createdAt);
                } else if (editLog.createdAt) {
                  outTime = toLocalDateTime(editLog.createdAt);
                }
                
                // Get inTime from linked IN session if available
                if (session.inSessionId) {
                  try {
                    const inResponse = await fetch(`/api/truck-sessions?direction=IN&plateNumber=${encodeURIComponent(editLog.plate)}&limit=1`);
                    if (inResponse.ok) {
                      const inData = await inResponse.json();
                      if (inData.sessions && inData.sessions.length > 0) {
                        const inSession = inData.sessions.find((s: any) => s.id === session.inSessionId) || inData.sessions[0];
                        if (inSession.inTime) {
                          inTime = inSession.inTime;
                        } else if (inSession.createdAt) {
                          inTime = toLocalDateTime(inSession.createdAt);
                        }
                      }
                    }
                  } catch (error) {
                    console.error("Error fetching IN session time:", error);
                  }
                }
              } else if (editLog.createdAt) {
                outTime = toLocalDateTime(editLog.createdAt);
                inTime = toLocalDateTime(editLog.createdAt);
              }
            } else if (editLog.createdAt) {
              outTime = toLocalDateTime(editLog.createdAt);
              inTime = toLocalDateTime(editLog.createdAt);
            }
          } catch (error) {
            console.error("Error fetching session times:", error);
            if (editLog.createdAt) {
              outTime = toLocalDateTime(editLog.createdAt);
              inTime = toLocalDateTime(editLog.createdAt);
            }
          }
          
          // Update external outTime if handler is provided
          if (onOutTimeChange) {
            onOutTimeChange(outTime);
          }
          
          // Update form state with correct times
          setFormState((prev) => ({
            ...prev,
            outTime: outTime,
            inTime: inTime,
          }));
        };
        
        // Set form state immediately with available data, times will be updated async
        setFormState({
          plateNumber: editLog.plate || "",
          rfid: editLog.rfid || "",
          driverId: driver?.id || "",
          driverName: editLog.driverName || "",
          productId: product?.id || "",
          transporterCompanyId: transportCompany?.id || "",
          origin: editLog.origin || "",
          destination: editLog.destination || "",
          senderOrganizationId: senderOrg?.id || "",
          receiverOrganizationId: receiverOrg?.id || "",
          outTime: editLog.createdAt ? toLocalDateTime(editLog.createdAt) : getCurrentDateTime(),
          inTime: editLog.createdAt ? toLocalDateTime(editLog.createdAt) : getCurrentDateTime(),
          outWeightKg: editLog.weightKg || null,
          netWeightKg: editLog.netWeightKg || null,
          grossWeightKg: (editLog as any).totalOutWeight ?? editLog.weightKg ?? null,
          carWeight: (editLog as any).truckWeight ?? 0,
          trailerWeight: (editLog as any).trailerWeight ?? 0,
          totalWeight: (editLog as any).totalOutWeight ?? 0,
          sealNumber: editLog.sealNumber || "",
          hasTrailer: editLog.hasTrailer || false,
          trailerNumber: editLog.trailerPlate || "",
          bagQuantity: editLog.bagQuantityOut ?? editLog.bagQuantity ?? "",
          notes: editLog.comments || "",
          inSessionId: undefined,
        });
        
        // Fetch session times asynchronously and update
        fetchSessionTimes();
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

      // Load trailers
      try {
        setIsLoadingTrailers(true);
        const response = await fetch("/api/trailers");
        if (response.ok) {
          const data = await response.json();
          setTrailers(data);
        }
      } catch (error) {
        console.error("Error loading trailers:", error);
      } finally {
        setIsLoadingTrailers(false);
      }

      // Load locations (sellers and buyers)
      try {
        setIsLoadingLocations(true);
        const [sellersResponse, buyersResponse] = await Promise.all([
          fetch("/api/locations?type=seller"),
          fetch("/api/locations?type=buyer")
        ]);
        
        const allLocations: Location[] = [];
        if (sellersResponse.ok) {
          const sellersData = await sellersResponse.json();
          allLocations.push(...sellersData);
        }
        if (buyersResponse.ok) {
          const buyersData = await buyersResponse.json();
          allLocations.push(...buyersData);
        }
        setLocations(allLocations);
      } catch (error) {
        console.error("Error loading locations:", error);
      } finally {
        setIsLoadingLocations(false);
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

    const trailerOptions = useMemo(
      () => trailers.map((t) => ({
        value: t.plateNumber,
        label: `${t.plateNumber}${t.ownerName ? ` - ${t.ownerName}` : ""}`,
      })),
      [trailers]
    );

    const locationOptions = useMemo(() => {
      const legacySeen = new Set<string>()
      const legacy: Array<{ value: string; label: string }> = []
      const specific: Array<{ value: string; label: string }> = []

      for (const location of locations) {
        const locationName = (location.locationName || "").trim()
        const companyName = (location.companyName || "").trim()

        if (locationName && !legacySeen.has(locationName)) {
          legacySeen.add(locationName)
          legacy.push({ value: locationName, label: locationName })
        }

        if (locationName && companyName) {
          const display = `${locationName} - ${companyName}`
          specific.push({ value: display, label: display })
        }
      }

      return [...legacy, ...specific]
    }, [locations]);

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

    const handleCreateTransportCompany = async (name: string, companyId?: string, contract?: string, phone?: string) => {
      try {
        const response = await fetch("/api/transport-companies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, companyId, contract, phone }),
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

    const handleCreateDriver = async (name: string, phone?: string, registrationNumber?: string, additionalInfo?: string) => {
      try {
        const response = await fetch("/api/drivers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone, registrationNumber, additionalInfo }),
        });
        if (response.ok) {
          const newDriver = await response.json();
          setDrivers((prev) => [...prev, newDriver]);
          toast({
            title: "Амжилттай",
            description: "Жолооч амжилттай нэмэгдлээ",
          });
          return newDriver.id;
        } else {
          const errorData = await response.json();
          toast({
            title: "Алдаа",
            description: errorData.error || "Жолооч нэмэхэд алдаа гарлаа",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error creating driver:", error);
        toast({
          title: "Алдаа",
          description: "Жолооч нэмэхэд алдаа гарлаа",
          variant: "destructive",
        });
      }
      return null;
    };

    const handleCreateOrganization = async (name: string, companyId?: string, contract?: string, phone?: string) => {
      try {
        const response = await fetch("/api/organizations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, companyId, contract, phone }),
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

    // Handler for creating locations (added from IN form)
    const handleCreateLocation = async (locationName: string, companyName: string, type: "seller" | "buyer") => {
      try {
        const response = await fetch("/api/locations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({ locationName, companyName, type }),
        });
        if (response.ok) {
          const newLocation = await response.json();
          setLocations((prev) => [...prev, newLocation]);
          toast({
            title: "Амжилттай",
            description: "Байршил амжилттай нэмэгдлээ",
          });
          // Return the most specific option value so it selects correctly
          return `${newLocation.locationName} - ${newLocation.companyName}`;
        } else {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || "Байршил нэмэхэд алдаа гарлаа";
          toast({
            title: "Алдаа",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error creating location:", error);
        toast({
          title: "Алдаа",
          description: "Байршил нэмэхэд алдаа гарлаа",
          variant: "destructive",
        });
      }
      return null;
    };

    // Dialog handlers for creating new entities
    const handleOpenCreateDialog = async (type: "transportCompany" | "product" | "organization" | "driver" | "trailer" | "location", initialValue: string): Promise<string | null> => {
      return new Promise((resolve) => {
        setCreateDialogType(type);
        setCreateDialogInitialValue(initialValue);
        if (type === "location") {
          setCreateDialogLocationName(initialValue);
          setCreateDialogName("");
        } else {
          setCreateDialogName(initialValue);
          setCreateDialogLocationName("");
        }
        setCreateDialogCompanyId("");
        setCreateDialogContract("");
        setCreateDialogPhone("");
        setCreateDialogRegistrationNumber("");
        setCreateDialogAdditionalInfo("");
        setCreateDialogOwnerName("");
        setCreateDialogOwnerId("");
        setCreateDialogLocationType("");
        setCreateDialogOpen(true);
        
        // Store resolve function to call when dialog closes
        (window as any).__createDialogResolve = resolve;
      });
    };

    const handleCreateDialogSubmit = async () => {
      if (!createDialogType) {
        toast({
          title: "Алдаа",
          description: "Төрөл сонгох шаардлагатай",
          variant: "destructive",
        });
        return;
      }

      // For location, check locationName; for others, check name
      if (createDialogType === "location") {
        if (!createDialogLocationName.trim()) {
          toast({
            title: "Алдаа",
            description: "Байршлын нэр оруулах шаардлагатай",
            variant: "destructive",
          });
          return;
        }
        if (!createDialogCompanyId.trim()) {
          toast({
            title: "Алдаа",
            description: "Компанийн нэр оруулах шаардлагатай",
            variant: "destructive",
          });
          return;
        }
        if (!createDialogLocationType) {
          toast({
            title: "Алдаа",
            description: "Төрөл сонгох шаардлагатай",
            variant: "destructive",
          });
          return;
        }
      } else if (!createDialogName.trim()) {
        toast({
          title: "Алдаа",
          description: "Нэр оруулах шаардлагатай",
          variant: "destructive",
        });
        return;
      }

      // Validate required fields for transportCompany and organization
      if (createDialogType === "transportCompany" || createDialogType === "organization") {
        if (!createDialogCompanyId.trim()) {
          toast({
            title: "Алдаа",
            description: "Регистер шаардлагатай",
            variant: "destructive",
          });
          return;
        }
        if (!createDialogContract.trim()) {
          toast({
            title: "Алдаа",
            description: "Гадаад худалдааны гэрээ шаардлагатай",
            variant: "destructive",
          });
          return;
        }
        if (!createDialogPhone.trim()) {
          toast({
            title: "Алдаа",
            description: "Утасны дугаар шаардлагатай",
            variant: "destructive",
          });
          return;
        }
      }

      setIsCreatingInDialog(true);
      try {
        let newId: string | null = null;

        if (createDialogType === "transportCompany") {
          newId = await handleCreateTransportCompany(
            createDialogName.trim(),
            createDialogCompanyId.trim() || undefined,
            createDialogContract.trim() || undefined,
            createDialogPhone.trim() || undefined
          );
        } else if (createDialogType === "product") {
          newId = await handleCreateProduct(createDialogName.trim());
        } else if (createDialogType === "organization") {
          newId = await handleCreateOrganization(
            createDialogName.trim(),
            createDialogCompanyId.trim() || undefined,
            createDialogContract.trim() || undefined,
            createDialogPhone.trim() || undefined
          );
        } else if (createDialogType === "driver") {
          newId = await handleCreateDriver(
            createDialogName.trim(),
            createDialogPhone.trim() || undefined,
            createDialogRegistrationNumber.trim() || undefined,
            createDialogAdditionalInfo.trim() || undefined
          );
        } else if (createDialogType === "location") {
          newId = await handleCreateLocation(
            createDialogLocationName.trim(),
            createDialogCompanyId.trim(),
            createDialogLocationType as "seller" | "buyer"
          );
          // For locations, newId is actually the locationName (used as value in locationOptions)
        }

        if (newId) {
          setCreateDialogOpen(false);
          setCreateDialogType(null);
          setCreateDialogName("");
          setCreateDialogCompanyId("");
          setCreateDialogContract("");
          setCreateDialogPhone("");
          setCreateDialogRegistrationNumber("");
          setCreateDialogAdditionalInfo("");
          setCreateDialogOwnerName("");
          setCreateDialogOwnerId("");
          setCreateDialogLocationName("");
          setCreateDialogLocationType("");
          setCreateDialogInitialValue("");
          // Resolve the promise with the new ID
          if ((window as any).__createDialogResolve) {
            (window as any).__createDialogResolve(newId);
            (window as any).__createDialogResolve = null;
          }
        }
      } catch (error) {
        console.error("Error creating in dialog:", error);
      } finally {
        setIsCreatingInDialog(false);
      }
    };

    const handleCreateDialogCancel = () => {
      setCreateDialogOpen(false);
      setCreateDialogType(null);
      setCreateDialogName("");
      setCreateDialogCompanyId("");
      setCreateDialogContract("");
      setCreateDialogPhone("");
      setCreateDialogRegistrationNumber("");
      setCreateDialogAdditionalInfo("");
      setCreateDialogOwnerName("");
      setCreateDialogOwnerId("");
      setCreateDialogLocationName("");
      setCreateDialogLocationType("");
      setCreateDialogInitialValue("");
      // Resolve with null to indicate cancellation
      if ((window as any).__createDialogResolve) {
        (window as any).__createDialogResolve(null);
        (window as any).__createDialogResolve = null;
      }
    };

    // Auto-fill plate number when LPR data updates (camera 2 - exit camera)
    // Only auto-fills if user hasn't manually edited
    useEffect(() => {
      // Don't auto-fill if user has manually edited the plate in this session
      if (manuallyClearedRef.current) {
        return;
      }
      
      if (latestLpr?.plateNumber) {
        const plateNumber = latestLpr.plateNumber.trim().toUpperCase();
        
        // Don't auto-fill if currently autofilling (prevent loops)
        if (isAutofillingRef.current) {
          return;
        }
        
        setFormState((prev) => {
          // Only auto-fill if:
          // 1. Field is empty, OR
          // 2. Field matches the new plate (allows updates from camera)
          const isEmpty = !prev.plateNumber.trim();
          const shouldAutofill = isEmpty || prev.plateNumber.trim() === plateNumber;
          
          if (shouldAutofill && prev.plateNumber !== plateNumber) {
            isAutofillingRef.current = true;
            setTimeout(() => {
              isAutofillingRef.current = false;
            }, 100);
            
            return {
              ...prev,
              plateNumber: plateNumber,
            };
          }
          
          return prev;
        });
      }
    }, [latestLpr?.plateNumber, latestLpr?.receivedAt, onPlateChange]);
    // (Removed all cameraAutofill.bindToInput and trackTyping calls)

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

    // Auto-fill weight when weight status updates (similar to IN form logic)
    useEffect(() => {
      if (weightStatus.status.latestWeight !== null && weightStatus.status.latestWeight > 0) {
        setFormState((prev) => {
          let updated;
          
          // For OUT form, we can auto-fill carWeight, trailerWeight, or outWeightKg
          // Use same logic as IN form: if carWeight is locked, fill trailerWeight; otherwise fill carWeight
          if (carWeightLocked && (prev.carWeight !== null && prev.carWeight !== undefined && prev.carWeight > 0) && weightStatus.status.latestWeight !== null) {
            // Car weight is locked: auto-fill trailer weight and calculate total
            const newTrailerWeight = weightStatus.status.latestWeight;
            const newTotalWeight = (prev.carWeight || 0) + newTrailerWeight;
            updated = {
              ...prev,
              trailerWeight: newTrailerWeight,
              totalWeight: newTotalWeight,
              grossWeightKg: newTotalWeight,
            };
          } else {
            // Car weight not locked: fill car weight first
            // If trailer weight exists, calculate total; otherwise total = car weight
            const newCarWeight = weightStatus.status.latestWeight;
            const newTotalWeight = (prev.trailerWeight !== null && prev.trailerWeight !== undefined && prev.trailerWeight > 0)
              ? (newCarWeight || 0) + (prev.trailerWeight || 0)
              : newCarWeight;
            
            updated = {
              ...prev,
              carWeight: newCarWeight,
              totalWeight: newTotalWeight,
              grossWeightKg: newTotalWeight,
            };
          }
          
          // Also update outWeightKg for API compatibility
          updated.outWeightKg = updated.totalWeight;
          
          return updated;
        });
      }
    }, [weightStatus.status.latestWeight, carWeightLocked]);

    // Auto-fill all data from IN session when plate number is entered
    useEffect(() => {
      const rawPlate = formState.plateNumber.trim();
      const plateNumber = rawPlate.toUpperCase().replace(/\s/g, "");

      // Only fetch if we have a plate number (at least 2 characters to avoid too many requests)
      if (!plateNumber || plateNumber.length < 2) {
        setHasInSessionData(false);
        setInWeightKg(null);
        return;
      }

      let cancelled = false;
      const abortController = new AbortController();

      const timeoutId = setTimeout(async () => {
        if (cancelled) return;
        try {
          // Find the latest IN session and log for this plate number
          const response = await fetch(
            `/api/truck-sessions/find-in?plateNumber=${encodeURIComponent(
              plateNumber
            )}`,
            { signal: abortController.signal }
          );

          if (!response.ok) {
            setHasInSessionData(false);

            // Handle error responses
            let errorData;
            try {
              errorData = await response.json();
            } catch {
              errorData = { error: `HTTP ${response.status}` };
            }

            // 404 just means there's no IN session for this plate yet; clear derived state if still same plate
            if (response.status === 404 && !cancelled) {
              setFormState((prev) => {
                const current = prev.plateNumber.trim().toUpperCase().replace(/\s/g, "");
                if (current !== plateNumber) return prev;
                return {
                  ...prev,
                  inSessionId: undefined,
                  driverId: "",
                  driverName: "",
                  productId: "",
                  transporterCompanyId: "",
                  origin: "",
                  destination: "",
                  senderOrganizationId: "",
                  receiverOrganizationId: "",
                  sealNumber: "",
                  trailerNumber: prev.hasTrailer ? prev.trailerNumber : "",
                  carWeight: null,
                  trailerWeight: null,
                  totalWeight: null,
                  grossWeightKg: null,
                };
              });
              setInWeightKg(null);
            } else if (response.status !== 404) {
              console.error(
                "❌ Auto-fill: API error:",
                response.status,
                errorData
              );
            }
            return;
          }

          const data = await response.json();
          if (!data.success || !data.session || cancelled) {
            setHasInSessionData(false);
            return;
          }

          const inSession = data.session;
          const inLog = data.log; // Log has all the fields

          // totalInWeight = truckWeight + trailerWeight; fallback to totalInWeight/weightKg
          const tw = (inLog as any)?.truckWeight ?? (inLog as any)?.carWeight;
          const trw = (inLog as any)?.trailerWeight;
          const inTotalWeight =
            tw != null && trw != null
              ? tw + trw
              : (inLog as any)?.totalInWeight ??
                inLog?.weightKg ??
                inSession.grossWeightKg ??
                null;

          // Store IN weight for display
          setInWeightKg(inTotalWeight);
          setHasInSessionData(true);

          // Auto-fill all available data (only if fields are empty or not set)
          setFormState((prev) => {
            const current = prev.plateNumber.trim().toUpperCase().replace(/\s/g, "");
            if (current !== plateNumber) return prev;

            const updates: Partial<OutSessionFormState> = {
              inSessionId: inSession.id,
            };

            const isEmpty = (value: unknown): boolean => {
              if (value === null || value === undefined) return true;
              if (typeof value === "string") return value.trim() === "";
              return false;
            };

            // Auto-fill driver - try log first, then session
            if (isEmpty(prev.driverId)) {
              if (inLog?.driverId) {
                const matchingDriver = drivers.find(
                  (d) => d.id === inLog.driverId
                );
                if (matchingDriver) {
                  updates.driverId = matchingDriver.id;
                  updates.driverName = matchingDriver.name;
                }
              }
              if (!updates.driverId && inSession.driverName) {
                const matchingDriver = drivers.find(
                  (d) => d.name === inSession.driverName
                );
                if (matchingDriver) {
                  updates.driverId = matchingDriver.id;
                  updates.driverName = matchingDriver.name;
                }
              }
            }

            // Auto-fill product - try productId first (most reliable), then cargoType label match, then session product
            if (isEmpty(prev.productId)) {
              if ((inLog as any)?.productId) {
                const matchingProduct = products.find(
                  (p) => p.id === (inLog as any).productId
                );
                if (matchingProduct) {
                  updates.productId = matchingProduct.id;
                }
              }

              if (!updates.productId && inLog?.cargoType) {
                const cargoTypeTrimmed = inLog.cargoType.trim().toLowerCase();
                let matchingProduct = products.find((p) => {
                  const label = p.label?.trim().toLowerCase() || "";
                  const value = p.value?.trim().toLowerCase() || "";
                  return label === cargoTypeTrimmed || value === cargoTypeTrimmed;
                });

                if (!matchingProduct) {
                  matchingProduct = products.find((p) => {
                    const label = p.label?.trim().toLowerCase() || "";
                    const value = p.value?.trim().toLowerCase() || "";
                    return (
                      label.includes(cargoTypeTrimmed) ||
                      cargoTypeTrimmed.includes(label) ||
                      value.includes(cargoTypeTrimmed) ||
                      cargoTypeTrimmed.includes(value)
                    );
                  });
                }

                if (matchingProduct) {
                  updates.productId = matchingProduct.id;
                }
              }

              if (!updates.productId && inSession.product) {
                const sessionProductTrimmed = inSession.product.trim().toLowerCase();
                const matchingProduct = products.find((p) => {
                  const label = p.label?.trim().toLowerCase() || "";
                  const value = p.value?.trim().toLowerCase() || "";
                  return (
                    label === sessionProductTrimmed || value === sessionProductTrimmed
                  );
                });
                if (matchingProduct) {
                  updates.productId = matchingProduct.id;
                }
              }
            }

            // Auto-fill transport company - from log
            if (
              isEmpty(prev.transporterCompanyId) &&
              inLog?.transportCompanyId
            ) {
              updates.transporterCompanyId = inLog.transportCompanyId;
            }

            if (isEmpty(prev.origin) && inLog?.origin) {
              updates.origin = inLog.origin;
            }

            if (isEmpty(prev.destination) && inLog?.destination) {
              updates.destination = inLog.destination;
            }

            if (
              isEmpty(prev.senderOrganizationId) &&
              inLog?.senderOrganizationId
            ) {
              updates.senderOrganizationId = inLog.senderOrganizationId;
            }

            if (
              isEmpty(prev.receiverOrganizationId) &&
              inLog?.receiverOrganizationId
            ) {
              updates.receiverOrganizationId = inLog.receiverOrganizationId;
            }

            if (isEmpty(prev.sealNumber) && inLog?.sealNumber) {
              updates.sealNumber = inLog.sealNumber;
            }

            if (inLog?.hasTrailer !== undefined) {
              if (prev.hasTrailer !== inLog.hasTrailer) {
                updates.hasTrailer = inLog.hasTrailer;
              }
              if (
                inLog.hasTrailer &&
                inLog.trailerPlate &&
                isEmpty(prev.trailerNumber)
              ) {
                updates.trailerNumber = inLog.trailerPlate;
              }
            }

            if (isEmpty(prev.notes) && inLog?.comments) {
              updates.notes = inLog.comments;
            }

            return { ...prev, ...updates };
          });
        } catch (error: unknown) {
          if (error instanceof Error && error.name === "AbortError") return;
          console.error("❌ Auto-fill: Error fetching IN session:", error);
        }
      }, 500); // 500ms debounce

      return () => {
        cancelled = true;
        clearTimeout(timeoutId);
        abortController.abort();
      };
    }, [formState.plateNumber, drivers, products]);

    // Auto-calculate net weight when IN weight and OUT weight are both known
    useEffect(() => {
      const plate = formState.plateNumber.trim();
      const outWeight = formState.totalWeight ?? formState.grossWeightKg ?? null;

      if (!plate || outWeight === null || outWeight === undefined) {
        return;
      }
      if (inWeightKg === null || inWeightKg === undefined) {
        return;
      }

      const netWeight = inWeightKg - outWeight;

      setFormState((prev) => {
        const currentOutWeight = prev.totalWeight ?? prev.grossWeightKg ?? null;
        if (prev.plateNumber.trim() !== plate || currentOutWeight !== outWeight) {
          return prev;
        }
        return {
          ...prev,
          netWeightKg: netWeight,
        };
      });
    }, [formState.plateNumber, formState.totalWeight, formState.grossWeightKg, inWeightKg]);

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
        formState.totalWeight ||
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

      if (!formState.totalWeight || formState.totalWeight <= 0) {
        toast({
          title: "Алдаа",
          description: "Гарах үеийн нийт жин оруулах шаардлагатай",
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
        // Use external outTime if provided, otherwise use form state
        const currentOutTime = externalOutTime || formState.outTime;
        
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

          const hasTrailer = !!formState.trailerNumber.trim();
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
            weightKg: formState.totalWeight || formState.grossWeightKg || undefined,
            netWeightKg:
              formState.netWeightKg !== null &&
              formState.netWeightKg !== undefined
                ? formState.netWeightKg
                : undefined,
            hasTrailer: hasTrailer || undefined,
            trailerPlate: hasTrailer
              ? formState.trailerNumber.trim().toUpperCase()
              : undefined,
            sealNumber: formState.sealNumber.trim() || undefined,
            comments: formState.notes.trim() || undefined,
            bagQuantityOut: formState.bagQuantity.trim() || undefined,
            rfid: formState.rfid.trim() || undefined,
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
          resetForm();
          setFormState({
            plateNumber: "",
            rfid: "",
            driverId: "",
            driverName: "",
            productId: "",
            transporterCompanyId: "",
            origin: "",
            destination: "",
            senderOrganizationId: "",
            receiverOrganizationId: "",
            outTime: new Date().toISOString().slice(0, 16),
            inTime: new Date().toISOString().slice(0, 16), // Added from IN form
            outWeightKg: null,
            netWeightKg: null,
            grossWeightKg: null, // Added from IN form
            carWeight: 0, // Added from IN form
            trailerWeight: 0, // Added from IN form
            totalWeight: 0, // Added from IN form
            sealNumber: "",
            hasTrailer: false,
            trailerNumber: "",
            bagQuantity: "",
            notes: "",
            inSessionId: undefined,
          });

          return true;
        }

        // Otherwise, create a new session
        // Use external outTime if provided, otherwise use current time
        const saveTime = currentOutTime || getCurrentDateTime();
        if (onOutTimeChange) {
          onOutTimeChange(saveTime);
        }

        const hasTrailer = !!formState.trailerNumber.trim();
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
          grossWeightKg: formState.totalWeight || formState.grossWeightKg || undefined,
          totalWeight: formState.totalWeight || undefined, // Also send totalWeight for API
          netWeightKg:
            formState.netWeightKg !== null &&
            formState.netWeightKg !== undefined
              ? formState.netWeightKg
              : undefined,
          carWeight: formState.carWeight || undefined,
          trailerWeight: formState.trailerWeight || undefined,
          inSessionId: formState.inSessionId || undefined,
          outTime: saveTime,
          inTime: formState.inTime || undefined, // Added from IN form
          sealNumber: formState.sealNumber.trim() || undefined,
          hasTrailer: hasTrailer || undefined,
          trailerNumber: hasTrailer ? formState.trailerNumber.trim() : undefined,
          notes: formState.notes.trim() || undefined,
          bagQuantity: formState.bagQuantity.trim() || undefined,
          rfid: formState.rfid.trim() || undefined,
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

        // Store the unique code, session ID, and log ID from the saved session
        if (savedSession.session?.uniqueCode) {
          setSavedUniqueCode(savedSession.session.uniqueCode);
        }
        if (savedSession.session?.id) {
          setSavedSessionId(savedSession.session.id);
        }
        if (savedSession.logId) {
          setSavedLogId(savedSession.logId);
        }

        toast({
          title: "Амжилттай",
          description: "ГАРАХ бүртгэл амжилттай хадгалагдлаа",
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

    const performSendToThirdParty = async (): Promise<boolean> => {
      setIsSending(true);
      try {
        // Get AKT/unique code: prefer linked IN session so IN+OUT share one AKT
        let uniqueCode = savedUniqueCode;

        if (!uniqueCode) {
          // Try to fetch the saved OUT session
          let outSession: any | null = null;

          if (savedSessionId) {
            try {
              const sessionResponse = await fetch(`/api/truck-sessions/${savedSessionId}`);
              if (sessionResponse.ok) {
                const sessionData = await sessionResponse.json();
                outSession = sessionData.session || null;
              }
            } catch {
              // ignore
            }
          }

          // If we still don't have the OUT session, fall back to latest OUT by plate
          if (!outSession) {
            try {
              const sessionsResponse = await fetch(
                `/api/truck-sessions?direction=OUT&plateNumber=${encodeURIComponent(
                  formState.plateNumber.trim()
                )}&limit=1&sort=createdAt`
              );
              if (sessionsResponse.ok) {
                const sessionsData = await sessionsResponse.json();
                outSession = sessionsData.sessions?.[0] || null;
              }
            } catch {
              // ignore
            }
          }

          // If OUT session is found and linked to an IN session, fetch that IN and use its uniqueCode as AKT
          if (outSession?.inSessionId) {
            try {
              const inResponse = await fetch(`/api/truck-sessions/${outSession.inSessionId}`);
              if (inResponse.ok) {
                const inData = await inResponse.json();
                const inSession = inData.session;
                if (inSession?.uniqueCode) {
                  uniqueCode = inSession.uniqueCode;
                }
              }
            } catch {
              // ignore and fall back to OUT uniqueCode
            }
          }

          // Final fallback: use OUT session's own uniqueCode
          if (!uniqueCode && outSession?.uniqueCode) {
            uniqueCode = outSession.uniqueCode;
          }

          if (uniqueCode) {
            setSavedUniqueCode(uniqueCode);
          }
        }

        if (!uniqueCode) {
          toast({
            title: "Алдаа",
            description: "Бүртгэл олдсонгүй. Эхлээд бүртгэлийг хадгална уу.",
            variant: "destructive",
          });
          return false;
        }


        const productName = formState.productId
          ? products.find((p) => p.id === formState.productId)?.label || ""
          : "";
        const transportCompany = formState.transporterCompanyId
          ? transportCompanies.find((t) => t.id === formState.transporterCompanyId)
          : undefined;
        const contractNumber = transportCompany?.contract || "";

        const sendResult = await sendFormData({
          aktNumber: uniqueCode,
          uniqueCode,
          plateNumber: formState.plateNumber.trim().toUpperCase(),
          plate: formState.plateNumber.trim().toUpperCase(),
          driverName: formState.driverName,
          driverId: formState.driverId || "",
          driverPhone: drivers.find((d) => d.id === formState.driverId)?.phone || "",
          driverRegistrationNumber:
            drivers.find((d) => d.id === formState.driverId)?.registrationNumber || "",
          product: productName,
          cargoType: productName,
          contractNumber,
          contract: contractNumber,
          con: contractNumber,
          transportCompanyName: transportCompany?.name || "",
          transporterCompany: transportCompany?.name || "",
          transportCompanyId: formState.transporterCompanyId || "",
          senderOrganizationId: formState.senderOrganizationId || "",
          receiverOrganizationId: formState.receiverOrganizationId || "",
          origin: formState.origin.trim(),
          destination: formState.destination.trim(),
          netWeightKg: formState.netWeightKg || 0,
          totalOutWeight: formState.totalWeight || formState.grossWeightKg || 0,
          totalWeight: formState.totalWeight || formState.grossWeightKg || 0,
          grossWeightKg: formState.grossWeightKg || 0,
          sealNumber: formState.sealNumber.trim(),
          trailerNumber: formState.hasTrailer
            ? formState.trailerNumber.trim().toUpperCase()
            : "",
          trailerPlate: formState.hasTrailer
            ? formState.trailerNumber.trim().toUpperCase()
            : "",
        });

        if (!sendResult.success) {
          toast({
            title: "Алдаа",
            description: sendResult.error || "Төрийн гаальд илгээхэд алдаа гарлаа.",
            variant: "destructive",
          });
          return false;
        }

        // Update sentToCustoms in DB so History table shows correct status
        const logIdToUpdate = editLogId || savedLogId;
        if (logIdToUpdate) {
          try {
            const dbResult = await sendTruckLogToCustoms(logIdToUpdate);
            if (dbResult.success) {
              router.refresh();
            }
          } catch {
            // ignore
          }
        }

        toast({
          title: "Амжилттай",
          description: "Төрийн гаальд илгээгдлээ",
        });
        return true;
      } catch (sendError) {
        console.error("=".repeat(50));
        console.error("❌ ERROR: Exception thrown while sending data");
        console.error("❌ Error:", sendError);
        console.error(
          "❌ Error message:",
          sendError instanceof Error ? sendError.message : String(sendError)
        );
        console.error("=".repeat(50));
        toast({
          title: "Алдаа",
          description:
            sendError instanceof Error
              ? sendError.message
              : "Төрийн гаальд илгээхэд алдаа гарлаа",
          variant: "destructive",
        });
        return false;
      } finally {
        setIsSending(false);
      }
    };

    // Reset form (only clear savedUniqueCode, savedSessionId, savedLogId when starting a new form)
    const resetForm = () => {
      setInWeightKg(null);
      setSavedUniqueCode(null);
      setSavedSessionId(null);
      setSavedLogId(null);
      rfidManuallyEditedRef.current = false;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!formState.totalWeight || formState.totalWeight <= 0) {
        toast({
          title: "Алдаа",
          description: "Гарах үеийн нийт жин оруулах шаардлагатай",
          variant: "destructive",
        });
        return;
      }

      // Use external outTime if provided, otherwise use current time
      const currentTime = externalOutTime || getCurrentDateTime();
      if (onOutTimeChange) {
        onOutTimeChange(currentTime);
      }

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
            <Card className="p-4 pb-8 w-full max-w-6xl min-h-[calc(100vh-4rem)]">
              {/* License Plate Input with Warning */}
              <div>
                <div className="flex gap-2">
                  <div className="w-full md:w-1/2 lg:w-1/3">
                    <div className="bg-white rounded-lg flex items-center justify-center border border-black px-3 py-1 relative h-14" style={{ borderWidth: '3px' }}>
                      <Input
                        ref={setPlateInputRef}
                        id="plateNumber"
                        value={formState.plateNumber}
                        onChange={(e) => {
                          const newValue = e.target.value;

                          // Any manual edit disables camera/LPR autofill for the rest of this session
                          if (!isAutofillingRef.current) {
                            manuallyClearedRef.current = true;
                          }

                          // Update plate number and clear any previous IN-session-derived data
                          setFormState((prev) => ({
                            ...prev,
                            plateNumber: newValue,
                            inSessionId: undefined,
                          }));
                          setHasInSessionData(false);
                          setInWeightKg(null);

                          onPlateChange?.(newValue);
                        }}
                        className="absolute inset-0 w-full h-full font-mono font-bold bg-transparent text-transparent border-0 focus:ring-0 focus-visible:ring-0 text-center caret-black z-10"
                        placeholder=""
                        required
                      />
                      <div className="flex items-center justify-center w-full h-full pointer-events-none gap-1.5">
                        {/* Soyombo Symbol - Mongolian National Emblem */}
                        <img 
                          src="/soyombo.svg" 
                          alt="Soyombo" 
                          className="h-10 w-auto flex-shrink-0"
                          style={{ minWidth: '15px', maxWidth: '20px', maxHeight: '40px' }}
                          onError={(e) => {
                            console.error('[Soyombo] Image failed to load:', '/soyombo.svg');
                          }}
                        />
                        {/* Numbers and Letters in one row */}
                        <div className="flex items-center gap-1.5">
                          <div className="text-5xl font-mono font-bold text-black leading-none">
                            {formState.plateNumber.replace(/[^0-9]/g, '')}
                          </div>
                          <div className="text-5xl font-mono font-bold text-black leading-none">
                            {formState.plateNumber.replace(/[0-9]/g, '').toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 lg:w-1/3">
                    <div className="bg-white rounded-lg flex items-center justify-center border border-black px-3 py-1 relative h-14" style={{ borderWidth: '3px' }}>
                      <Input
                        id="rfid"
                        value={formState.rfid}
                        onChange={(e) => {
                          if (!isRfidAutofillingRef.current) {
                            rfidManuallyEditedRef.current = true;
                          }
                          setFormState((prev) => ({ ...prev, rfid: e.target.value }));
                        }}
                        className="absolute inset-0 w-full h-full font-mono font-bold bg-transparent text-transparent border-0 focus:ring-0 focus-visible:ring-0 text-center caret-black z-10"
                        placeholder=""
                      />
                      <div className="flex items-center justify-center w-full h-full pointer-events-none">
                        {formState.rfid ? (
                          <div className="text-5xl font-mono font-bold text-black leading-none">
                            {formState.rfid}
                          </div>
                        ) : (
                          <div className="text-6xl font-mono font-bold text-gray-400 leading-none">
                            RFID
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Gaali Bridge and warning - below plate + RFID row (same as before, full width) */}
                <div className="flex flex-col gap-1.5 mt-2 w-full md:flex-row md:gap-2">
                  
                  
                </div>
              </div>

              {/* Weight Inputs - Full width, directly under license plate and RFID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 -mt-2 mb-0">
                {/* Car Weight Column - with In Weight (disabled) at bottom */}
                <div className="flex flex-col gap-2">
                  {/* Car Weight */}
                  <div className="flex flex-col">
                    <div className="mb-1 min-h-[1.25rem] flex items-center">
                      <Label
                        htmlFor="carWeight"
                        className="text-base font-medium text-gray-700"
                      >
                        Машины жин (кг) <span className="text-red-500">*</span>
                      </Label>
                    </div>
                    <div className="h-14 flex gap-2">
                      <Input
                        id="carWeight"
                        type="number"
                        value={formState.carWeight ?? 0}
                        onFocus={(e) => {
                          if (!carWeightLocked) {
                            e.target.select();
                          }
                        }}
                        onChange={(e) => {
                          if (carWeightLocked) return; // Prevent changes when locked
                          const value =
                            e.target.value === ""
                              ? 0
                              : parseFloat(e.target.value) || 0;
                          setFormState((prev) => {
                            const newCarWeight = value;
                            const newTotalWeight = (newCarWeight || 0) + (prev.trailerWeight || 0);
                            return {
                              ...prev,
                              carWeight: newCarWeight,
                              totalWeight: newTotalWeight,
                              grossWeightKg: newTotalWeight,
                              outWeightKg: newTotalWeight, // Also update outWeightKg for API compatibility
                            };
                          });
                        }}
                        className="h-14 !text-5xl !md:text-5xl font-mono font-bold !text-green-600 flex-1 bg-white [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                        required
                        disabled={carWeightLocked}
                        readOnly={carWeightLocked}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          setCarWeightLocked((prev) => !prev);
                        }}
                        className="h-14 px-4 whitespace-nowrap"
                        disabled={false}
                      >
                        {carWeightLocked ? "🔓" : "OK"}
                      </Button>
                    </div>
                  </div>

                  {/* In Weight Input - disabled, at bottom */}
                  <div className="flex flex-col">
                    <div className="mb-1 min-h-[1.25rem] flex items-center">
                      <Label
                        htmlFor="inWeightKg"
                        className="text-base font-medium text-gray-700"
                      >
                        Орох жин (кг)
                      </Label>
                    </div>
                    <div className="h-14">
                      <Input
                        id="inWeightKg"
                        type="number"
                        value={inWeightKg ?? ""}
                        readOnly
                        className="h-14 !text-5xl !md:text-5xl font-mono font-bold !text-green-600 w-full bg-white [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                      />
                    </div>
                  </div>
                </div>

                {/* Trailer Weight Column - with Net Weight below */}
                <div className="flex flex-col gap-2">
                  {/* Trailer Weight */}
                  <div className="flex flex-col">
                    <div className="mb-1 min-h-[1.25rem] flex items-center">
                      <Label
                        htmlFor="trailerWeight"
                        className="text-base font-medium text-gray-700"
                      >
                        Чиргүүлийн жин (кг)
                      </Label>
                    </div>
                    <div className="h-14">
                      <Input
                        id="trailerWeight"
                        type="number"
                        value={formState.trailerWeight ?? 0}
                        onFocus={(e) => {
                          e.target.select();
                        }}
                        onChange={(e) => {
                          const value =
                            e.target.value === ""
                              ? 0
                              : parseFloat(e.target.value) || 0;
                          setFormState((prev) => {
                            const newTrailerWeight = value;
                            const newTotalWeight = (prev.carWeight || 0) + (newTrailerWeight || 0);
                            return {
                              ...prev,
                              trailerWeight: newTrailerWeight,
                              totalWeight: newTotalWeight,
                              grossWeightKg: newTotalWeight,
                              outWeightKg: newTotalWeight, // Also update outWeightKg for API compatibility
                            };
                          });
                        }}
                        className="h-14 !text-5xl !md:text-5xl font-mono font-bold !text-green-600 w-full bg-white [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                      />
                    </div>
                  </div>

                  {/* Net Weight Input - directly under Trailer Weight */}
                  <div className="flex flex-col">
                    <div className="mb-1 min-h-[1.25rem] flex items-center">
                        <Label
                          htmlFor="netWeightKg"
                        className="text-base font-medium text-gray-700"
                        >
                          Цэвэр жин (кг) <span className="text-red-500">*</span>
                        </Label>
                    </div>
                    <div className="h-14">
                        <Input
                          id="netWeightKg"
                          type="number"
                          value={
                            formState.netWeightKg !== null
                              ? Math.abs(formState.netWeightKg) // Display absolute value (hide minus sign)
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
                            // Preserve the sign of the original value if it was negative
                            const currentValue = formState.netWeightKg;
                            const newValue =
                              currentValue !== null && currentValue < 0
                                ? -Math.abs(value) // Keep negative if it was negative
                                : Math.abs(value); // Otherwise use positive
                            setFormState((prev) => ({
                              ...prev,
                              netWeightKg: newValue,
                            }));
                          }}
                      className="h-14 !text-5xl !md:text-5xl font-mono font-bold !text-blue-600 w-full bg-white [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                          required
                        />
                      </div>
                  </div>
                </div>

                {/* Total Weight Column - with Seal Number below */}
                <div className="flex flex-col gap-2">
                  {/* Total Weight */}
                  <div className="flex flex-col">
                    <div className="mb-1 min-h-[1.25rem] flex items-center">
                      <Label
                        htmlFor="totalWeight"
                        className="text-base font-medium text-gray-700"
                      >
                        Гарах үеийн нийт жин (кг) <span className="text-red-500">*</span>
                      </Label>
                    </div>
                    <div className="h-14 flex gap-2">
                      <Input
                        id="totalWeight"
                        type="number"
                        value={formState.totalWeight ?? 0}
                        onFocus={(e) => {
                          e.target.select();
                        }}
                        onChange={(e) => {
                          const value =
                            e.target.value === ""
                              ? 0
                              : parseFloat(e.target.value) || 0;
                          setFormState((prev) => ({
                            ...prev,
                            totalWeight: value,
                            grossWeightKg: value,
                            outWeightKg: value, // Also update outWeightKg for API compatibility
                          }));
                        }}
                        className="h-14 !text-5xl !md:text-5xl font-mono font-bold !text-green-600 flex-1 bg-white [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                        required
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          setFormState((prev) => {
                            const value =
                              prev.totalWeight ??
                              prev.grossWeightKg ??
                              prev.outWeightKg ??
                              0;
                            return {
                              ...prev,
                              totalWeight: value,
                              grossWeightKg: value,
                              outWeightKg: value,
                            };
                          });
                        }}
                        className="h-14 px-4 whitespace-nowrap"
                        disabled={false}
                      >
                        OK
                      </Button>
                    </div>
                  </div>

                  {/* Seal Number - directly under Total Weight */}
                  <div className="flex flex-col">
                    <div className="mb-1 min-h-[1.25rem] flex items-center">
                      <Label
                        htmlFor="sealNumber"
                        className="text-base font-medium text-gray-700"
                      >
                        Лацны дугаар
                      </Label>
                    </div>
                    <div className="h-14">
                      <Input
                        id="sealNumber"
                        value={formState.sealNumber}
                        onChange={(e) =>
                          setFormState((prev) => ({
                            ...prev,
                            sealNumber: e.target.value,
                          }))
                        }
                        className="h-14 text-base font-mono font-bold !text-blue-600 w-full bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                {/* Trailer */}
                <div className="flex flex-col">
                  <div className="mb-1 min-h-[1.25rem] flex items-center">
                    <Label className="text-base font-medium text-gray-700">
                      Чиргүүл
                    </Label>
                  </div>
                  <div className="h-12">
                    <FilterableSelect
                      options={trailerOptions}
                      value={formState.trailerNumber}
                      onValueChange={(value) =>
                        setFormState((prev) => ({
                          ...prev,
                          trailerNumber: value,
                          hasTrailer: !!value.trim(),
                        }))
                      }
                      disabled={isLoadingTrailers || hasInSessionData}
                      placeholder={
                        isLoadingTrailers ? "Уншиж байна..." : "Чиргүүл сонгох"
                      }
                      searchPlaceholder="Чиргүүлийн улсын дугаар хайх..."
                      className="h-12 !bg-blue-400 !text-black !border-blue-400 hover:!bg-blue-500 hover:!border-blue-500 [&>span]:!text-black [&>span.text-muted-foreground]:!text-gray-700"
                    />
                  </div>
                </div>

                {/* Driver */}
                <div className="flex flex-col">
                  <div className="mb-1 min-h-[1.25rem] flex items-center">
                    <Label
                      htmlFor="driverId"
                      className="text-base font-medium text-gray-700"
                    >
                      Жолооч <span className="text-red-500">*</span>
                    </Label>
                  </div>
                  <div className="h-12">
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
                      disabled={isLoadingDrivers || hasInSessionData}
                      placeholder={
                        isLoadingDrivers ? "Уншиж байна..." : "Жолооч сонгох"
                      }
                      searchPlaceholder="Жолооч хайх..."
                      onCreateNewDialog={(initialValue) => handleOpenCreateDialog("driver", initialValue)}
                      createNewLabel="+ Нэмэх ..."
                      className="h-12 !bg-blue-400 !text-black !border-blue-400 hover:!bg-blue-500 hover:!border-blue-500 [&>span]:!text-black [&>span.text-muted-foreground]:!text-gray-700"
                      required
                    />
                  </div>
                </div>

                {/* Transport Company */}
                <div className="flex flex-col">
                  <div className="mb-1 min-h-[1.25rem] flex items-center">
                      <Label
                        htmlFor="transporterCompanyId"
                      className="text-base font-medium text-gray-700"
                      >
                        Тээврийн компани <span className="text-red-500">*</span>
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
                        disabled={isLoadingCompanies || hasInSessionData}
                        placeholder={
                          isLoadingCompanies
                            ? "Уншиж байна..."
                            : "Тээврийн компани сонгох"
                        }
                        searchPlaceholder="Тээврийн компани хайх..."
                        onCreateNewDialog={(initialValue) => handleOpenCreateDialog("transportCompany", initialValue)}
                        createNewLabel="+ Нэмэх ..."
                      className="h-12 !bg-blue-400 !text-black !border-blue-400 hover:!bg-blue-500 hover:!border-blue-500 [&>span]:!text-black [&>span.text-muted-foreground]:!text-gray-700"
                        required
                      />
                    </div>
                </div>

                {/* Product */}
                <div className="flex flex-col">
                  <div className="mb-1 min-h-[1.25rem] flex items-center">
                    <Label
                      htmlFor="productId"
                      className="text-base font-medium text-gray-700"
                    >
                      Бүтээгдэхүүн <span className="text-red-500">*</span>
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
                      disabled={isLoadingProducts || hasInSessionData}
                      placeholder={
                        isLoadingProducts
                          ? "Уншиж байна..."
                          : "Бүтээгдэхүүн сонгох"
                      }
                      searchPlaceholder="Бүтээгдэхүүн хайх..."
                      onCreateNewDialog={(initialValue) => handleOpenCreateDialog("product", initialValue)}
                      createNewLabel="+ Нэмэх ..."
                      className="h-12 !bg-blue-400 !text-black !border-blue-400 hover:!bg-blue-500 hover:!border-blue-500 [&>span]:!text-black [&>span.text-muted-foreground]:!text-gray-700"
                      required
                    />
                  </div>
                </div>

                {/* Origin */}
                <div className="flex flex-col">
                  <div className="mb-1 min-h-[1.25rem] flex items-center">
                      <Label
                        htmlFor="origin"
                      className="text-base font-medium text-gray-700"
                      >
                        Хаанаас
                      </Label>
                  </div>
                  <div className="h-12">
                      <FilterableSelect
                        options={locationOptions}
                        value={formState.origin}
                        onValueChange={(value) =>
                          setFormState((prev) => ({
                            ...prev,
                            origin: value,
                          }))
                        }
                        disabled={isLoadingLocations || hasInSessionData}
                        placeholder={isLoadingLocations ? "Уншиж байна..." : "Байршил сонгох"}
                        searchPlaceholder="Байршил хайх..."
                        onCreateNewDialog={(initialValue) => handleOpenCreateDialog("location", initialValue)}
                        createNewLabel="+ Нэмэх ..."
                        className="h-12 text-base w-full !bg-blue-400 !text-black !border-blue-400 hover:!bg-blue-500 hover:!border-blue-500 [&>span]:!text-black [&>span.text-muted-foreground]:!text-gray-700"
                      />
                    </div>
                </div>

                {/* Destination */}
                <div className="flex flex-col">
                  <div className="mb-1 min-h-[1.25rem] flex items-center">
                      <Label
                        htmlFor="destination"
                      className="text-base font-medium text-gray-700"
                      >
                        Хаашаа
                      </Label>
                  </div>
                  <div className="h-12">
                      <FilterableSelect
                        options={locationOptions}
                        value={formState.destination}
                        onValueChange={(value) =>
                          setFormState((prev) => ({
                            ...prev,
                            destination: value,
                          }))
                        }
                        disabled={isLoadingLocations || hasInSessionData}
                        placeholder={isLoadingLocations ? "Уншиж байна..." : "Байршил сонгох"}
                        searchPlaceholder="Байршил хайх..."
                        onCreateNewDialog={(initialValue) => handleOpenCreateDialog("location", initialValue)}
                        createNewLabel="+ Нэмэх ..."
                        className="h-12 text-base w-full !bg-blue-400 !text-black !border-blue-400 hover:!bg-blue-500 hover:!border-blue-500 [&>span]:!text-black [&>span.text-muted-foreground]:!text-gray-700"
                      />
                    </div>
                    </div>

                {/* Sender Organization */}
                <div className="flex flex-col">
                  <div className="mb-1 min-h-[1.25rem] flex items-center">
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
                        disabled={isLoadingOrganizations || hasInSessionData}
                        placeholder={
                          isLoadingOrganizations
                            ? "Уншиж байна..."
                            : "Илгээч байгууллага сонгох"
                        }
                        searchPlaceholder="Илгээч байгууллага хайх..."
                        onCreateNewDialog={(initialValue) => handleOpenCreateDialog("organization", initialValue)}
                        createNewLabel="+ Нэмэх ..."
                      className="h-12 !bg-blue-400 !text-black !border-blue-400 hover:!bg-blue-500 hover:!border-blue-500 [&>span]:!text-black [&>span.text-muted-foreground]:!text-gray-700"
                      />
                    </div>
                </div>

                {/* Receiver Organization */}
                <div className="flex flex-col">
                  <div className="mb-1 min-h-[1.25rem] flex items-center">
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
                        disabled={isLoadingOrganizations || hasInSessionData}
                        placeholder={
                          isLoadingOrganizations
                            ? "Уншиж байна..."
                            : "Хүлээн авагч байгууллага сонгох"
                        }
                        searchPlaceholder="Хүлээн авагч байгууллага хайх..."
                        onCreateNewDialog={(initialValue) => handleOpenCreateDialog("organization", initialValue)}
                        createNewLabel="+ Нэмэх ..."
                      className="h-12 !bg-blue-400 !text-black !border-blue-400 hover:!bg-blue-500 hover:!border-blue-500 [&>span]:!text-black [&>span.text-muted-foreground]:!text-gray-700"
                      />
                    </div>
              </div>

                {/* Шуудайны тоо хэмжээ - before Notes */}
                <div className="flex flex-col">
                  <div className="mb-1 min-h-[1.25rem] flex items-center width-full">
                    <Label
                      htmlFor="bagQuantity"
                      className="text-base font-medium text-gray-700"
                    >
                      Шуудайны тоо хэмжээ
                    </Label>
                  </div>
                  <div className="h-12">
                    <Input
                      id="bagQuantity"
                      type="text"
                      value={formState.bagQuantity}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          bagQuantity: e.target.value,
                        }))
                      }
                      className="h-12 text-base w-full bg-white text-gray-900 border-gray-300"
                      placeholder=""
                    />
                  </div>
                </div>

                {/* Notes - Next to Receiver Organization */}
                <div className="flex flex-col">
                  <div className="mb-1 min-h-[1.25rem] flex items-center width-full">
                    <Label
                      htmlFor="notes"
                      className="text-base font-medium text-gray-700"
                    >
                      Нэмэлт мэдээлэл
                    </Label>
                  </div>
                  <div className="h-12">
                    <Textarea
                      id="notes"
                      value={formState.notes}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      disabled={hasInSessionData}
                      // Textarea has a default `min-h-16` in the shared component, so we must override it here.
                      className="text-base resize-none h-12 min-h-0 w-full !bg-blue-400 !text-black !border-blue-400 placeholder:!text-gray-600"
                      placeholder="Нэмэлт мэдээлэл..."
                    />
                  </div>
                </div>

                {/* In Time - Added from IN form */}
                <div className="flex flex-col">
                  <div className="mb-1 min-h-[1.25rem] flex items-center">
                    <Label
                      htmlFor="inTime"
                      className="text-base font-medium text-gray-700"
                    >
                      Орох цаг
                    </Label>
                  </div>
                  <div className="h-12">
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
                      className="h-12 text-base w-full"
                    />
                  </div>
                </div>

                {/* Out Time */}
                

                {/* Warning message under receiver organization - full width row */}
                <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-2">
                  <div className="bg-green-50 border border-green-300 rounded p-2 w-full">
                    <p className="text-green-600 text-sm leading-tight">
                      <span className="text-lg font-bold">*</span> Улаан одоор тэмдэглэгдсэн нүдний мэдээлэл Гаалын мэдээллийн санд өгөгдөл болон дамжуулагдах тул анхааралтай бөглөнө үү.
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-300 rounded p-2 flex-1">
                    <p className="text-green-600 text-sm leading-tight">
                      Гараас өгөгдөл оруулах дохиололд Гаалийн газраас зөвшөөрөгдөөгүй тул анхаарна уу!
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-200">
                    <Button
                      type="submit"
                      onClick={handleSubmit}
                      disabled={
                        !formState.totalWeight ||
                        !formState.netWeightKg ||
                        isSaving
                      }
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 h-14 px-6 text-base"
                    >
                      {isSaving ? "Хадгалж байна..." : "Хадгалах"}
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

                          // Use the saved unique code if available, otherwise try to fetch it
                          let uniqueCode: string | null = savedUniqueCode;
                          
                          if (!uniqueCode) {
                            try {
                              const sessionsResponse = await fetch(
                                `/api/truck-sessions?direction=OUT&plateNumber=${encodeURIComponent(
                                  formState.plateNumber.trim()
                                )}&limit=1&sort=createdAt`
                              );
                              if (sessionsResponse.ok) {
                                const sessionsData =
                                  await sessionsResponse.json();
                                // Get the most recent session (first one since sorted)
                                const outSession = sessionsData.sessions?.[0];
                                if (outSession?.uniqueCode) {
                                  uniqueCode = outSession.uniqueCode;
                                }
                              }
                            } catch {
                              // ignore
                            }
                          }

                          const totalOut = formState.totalWeight ?? formState.grossWeightKg;
                          const logData: TruckLog = {
                            id: editLog?.id ?? formState.inSessionId ?? `temp-${Date.now()}`,
                            direction: "OUT",
                            plate: formState.plateNumber.trim().toUpperCase(),
                            driverId: formState.driverId || undefined,
                            driverName: formState.driverName || "",
                            cargoType: productName || "",
                            totalOutWeight: totalOut ?? undefined,
                            weightKg: totalOut ?? undefined,
                            netWeight: formState.netWeightKg ?? undefined,
                            netWeightKg: formState.netWeightKg ?? undefined,
                            truckWeight: formState.carWeight ?? undefined,
                            trailerWeight: formState.trailerWeight ?? undefined,
                            totalInWeight: formState.carWeight != null && formState.trailerWeight != null
                              ? (formState.carWeight || 0) + (formState.trailerWeight || 0)
                              : undefined,
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
                            bagQuantity: editLog?.bagQuantity || undefined,
                            bagQuantityOut: formState.bagQuantity.trim() || undefined,
                            createdAt: formState.outTime
                              ? new Date(formState.outTime).toISOString()
                              : new Date().toISOString(),
                            sentToCustoms: false,
                          };

                          // Open print dialog (no PDF download)
                          await printLog(logData, uniqueCode);

                          toast({
                            title: "Хэвлэх цонх нээгдлээ",
                            description: "Хэвлэх цонхоос хэвлэх эсвэл PDF хадгалах боломжтой",
                          });
                        } catch (error) {
                          console.error("Error opening print:", error);
                          toast({
                            title: "Алдаа",
                            description: "Хэвлэх цонх нээхэд алдаа гарлаа. Поп-ап зөвшөөрөгдсөн эсэхийг шалгана уу.",
                            variant: "destructive",
                          });
                        }
                      }}
                      disabled={
                        !formState.plateNumber.trim() ||
                        !formState.totalWeight ||
                        !formState.netWeightKg || formState.netWeightKg === 0
                      }
                  className="h-14 px-6 text-base"
                      title="Хэвлэх цонх нээх"
                    >
                      <Printer className="w-4 h-4 mr-1" />
                      Хэвлэх
                    </Button>
                    {editLog && !editLog.sentToCustoms && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                          if (!editLogId) return;
                          setIsSending(true);
                          try {
                            const result = await sendTruckLogToCustoms(editLogId);
                            if (result.success) {
                              toast({
                                title: "Амжилттай",
                                description: "Гаальд илгээсэн.",
                              });
                              // Refresh the page or update the log
                              router.refresh();
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
                            setIsSending(false);
                          }
                        }}
                        disabled={isSaving || isSending}
                        className="bg-green-500 text-white border-green-600 hover:bg-green-600 disabled:bg-green-300 disabled:text-white h-11 px-4 text-sm"
                      >
                        {isSending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Илгээж байна...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Гаальд илгээх
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      type="button"
                      onClick={async () => {
                        await performSendToThirdParty();
                      }}
                      disabled={
                        !formState.plateNumber.trim() ||
                        !formState.totalWeight ||
                        !formState.netWeightKg ||
                        formState.netWeightKg === 0 ||
                        isSending ||
                        isSaving
                      }
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 h-14 px-6 text-base"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Илгээж байна...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Илгээх
                        </>
                      )}
                    </Button>
                    
                  </div>
                </Card>
          </div>
        </form>

        {/* Create Entity Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={(open) => {
          if (!open) {
            handleCreateDialogCancel();
          }
        }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {createDialogType === "transportCompany" && "Шинэ тээврийн компани нэмэх"}
                {createDialogType === "product" && "Шинэ бүтээгдэхүүн нэмэх"}
                {createDialogType === "organization" && "Шинэ тээврийн байгууллага нэмэх"}
                {createDialogType === "driver" && "Шинэ жолооч нэмэх"}
                {createDialogType === "location" && "Шинэ байршил нэмэх"}
              </DialogTitle>
              <DialogDescription>
                {createDialogType === "transportCompany" && "Тээврийн компанийн мэдээлэл оруулна уу"}
                {createDialogType === "product" && "Бүтээгдэхүүний нэрийг оруулна уу"}
                {createDialogType === "organization" && "Тээврийн байгууллагын мэдээлэл оруулна уу"}
                {createDialogType === "driver" && "Жолоочийн мэдээлэл оруулна уу"}
                {createDialogType === "location" && "Байршлын мэдээлэл оруулна уу"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Name field - always shown */}
              <div>
                <Label htmlFor="create-dialog-name">
                  {createDialogType === "transportCompany" && "Тээврийн компанийн нэр"}
                  {createDialogType === "product" && "Бүтээгдэхүүний нэр"}
                  {createDialogType === "organization" && "Тээврийн байгууллагын нэр"}
                  {createDialogType === "driver" && "Жолоочийн нэр"}
                  {createDialogType === "location" && "Байршлын нэр"}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="create-dialog-name"
                  value={createDialogType === "location" ? createDialogLocationName : createDialogName}
                  onChange={(e) => {
                    if (createDialogType === "location") {
                      setCreateDialogLocationName(e.target.value);
                    } else {
                      setCreateDialogName(e.target.value);
                    }
                  }}
                  placeholder={
                    createDialogType === "transportCompany" ? "Тээврийн компанийн нэр оруулах"
                    : createDialogType === "product" ? "Бүтээгдэхүүний нэр оруулах"
                    : createDialogType === "organization" ? "Тээврийн байгууллагын нэр оруулах"
                    : createDialogType === "driver" ? "Жолоочийн нэр оруулах"
                    : "Байршлын нэр оруулах"
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && 
                        ((createDialogType === "product" && createDialogName.trim()) || 
                         (createDialogType === "driver" && createDialogName.trim()))) {
                      handleCreateDialogSubmit();
                    }
                  }}
                  autoFocus
                />
              </div>

              {/* Company ID, Contract, and Phone - for transportCompany and organization */}
              {(createDialogType === "transportCompany" || createDialogType === "organization") && (
                <>
                  <div>
                    <Label htmlFor="create-dialog-company-id">
                      Регистер <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="create-dialog-company-id"
                      value={createDialogCompanyId}
                      onChange={(e) => setCreateDialogCompanyId(e.target.value)}
                      placeholder="Регистрийн дугаар оруулах"
                    />
                  </div>
                  <div>
                    <Label htmlFor="create-dialog-contract">
                      Гадаад худалдааны гэрээ <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="create-dialog-contract"
                      value={createDialogContract}
                      onChange={(e) => setCreateDialogContract(e.target.value)}
                      placeholder="Гадаад худалдааны гэрээний дугаар оруулах"
                    />
                  </div>
                  <div>
                    <Label htmlFor="create-dialog-phone">
                      Утасны дугаар <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="create-dialog-phone"
                      type="tel"
                      value={createDialogPhone}
                      onChange={(e) => setCreateDialogPhone(e.target.value)}
                      placeholder="Утасны дугаар оруулах"
                    />
                  </div>
                </>
              )}

              {/* Driver specific fields */}
              {createDialogType === "driver" && (
                <>
                  <div>
                    <Label htmlFor="create-dialog-phone">
                      Утасны дугаар
                    </Label>
                    <Input
                      id="create-dialog-phone"
                      type="tel"
                      value={createDialogPhone}
                      onChange={(e) => setCreateDialogPhone(e.target.value)}
                      placeholder="Утасны дугаар оруулах"
                    />
                  </div>
                  <div>
                    <Label htmlFor="create-dialog-registration">
                      Регистерийн дугаар
                    </Label>
                    <Input
                      id="create-dialog-registration"
                      value={createDialogRegistrationNumber}
                      onChange={(e) => setCreateDialogRegistrationNumber(e.target.value)}
                      placeholder="Регистерийн дугаар оруулах"
                    />
                  </div>
                  <div>
                    <Label htmlFor="create-dialog-additional">
                      Нэмэлт мэдээлэл
                    </Label>
                    <Input
                      id="create-dialog-additional"
                      value={createDialogAdditionalInfo}
                      onChange={(e) => setCreateDialogAdditionalInfo(e.target.value)}
                      placeholder="Нэмэлт мэдээлэл оруулах"
                    />
                  </div>
                </>
              )}

              {/* Location specific fields */}
              {createDialogType === "location" && (
                <>
                  <div>
                    <Label htmlFor="create-dialog-location-company">
                      Компанийн нэр <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="create-dialog-location-company"
                      value={createDialogCompanyId}
                      onChange={(e) => setCreateDialogCompanyId(e.target.value)}
                      placeholder="Компанийн нэр оруулах"
                    />
                  </div>
                  <div>
                    <Label htmlFor="create-dialog-location-type">
                      Төрөл <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="create-dialog-location-type"
                      value={createDialogLocationType}
                      onChange={(e) => setCreateDialogLocationType(e.target.value as "seller" | "buyer" | "")}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Сонгох...</option>
                      <option value="seller">худалдагч</option>
                      <option value="buyer">худалдан авагч</option>
                    </select>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleCreateDialogCancel}
                disabled={isCreatingInDialog}
              >
                Цуцлах
              </Button>
              <Button
                onClick={handleCreateDialogSubmit}
                disabled={
                  isCreatingInDialog || 
                  (createDialogType !== "location" && !createDialogName.trim()) ||
                  (createDialogType === "location" && !createDialogLocationName.trim()) ||
                  ((createDialogType === "transportCompany" || createDialogType === "organization") && (
                    !createDialogCompanyId.trim() ||
                    !createDialogContract.trim() ||
                    !createDialogPhone.trim()
                  )) ||
                  (createDialogType === "location" && (
                    !createDialogCompanyId.trim() ||
                    !createDialogLocationType
                  ))
                }
                className="gap-2"
              >
                {isCreatingInDialog ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Нэмж байна...
                  </>
                ) : (
                  "Нэмэх"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
);

OutSessionForm.displayName = "OutSessionForm";
