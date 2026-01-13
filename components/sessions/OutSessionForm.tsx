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
import { updateTruckLog, sendTruckLogToCustoms } from "@/lib/api";
import { exportLogToPDF } from "@/lib/pdf-export";
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
    const {
      getWebSocket,
      connectWebSocket,
      isSending: isSendingToThirdParty,
      isConnected,
    } = useThirdPartyAutofill();
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

    // Check weight device connection status
    const weightStatus = useWeightStatus({
      enabled: true,
      pollInterval: 10000, // Check every 10 seconds
    });

    // Log weight connection status
    useEffect(() => {
      if (weightStatus.status.connected) {
        console.log("⚖️ Weight Device: ✅ CONNECTED", {
          siteId: weightStatus.status.siteId,
          latestWeight: weightStatus.status.latestWeight,
          unit: weightStatus.status.unit,
          recentActivity: weightStatus.status.recentActivity,
          totalRecords: weightStatus.status.totalRecords,
        });
      } else if (weightStatus.status.totalRecords > 0) {
        console.log("⚖️ Weight Device: ⚠️ INACTIVE (no recent data)", {
          siteId: weightStatus.status.siteId,
          totalRecords: weightStatus.status.totalRecords,
          lastReceivedAt: weightStatus.status.lastReceivedAt,
        });
      } else {
        console.log("⚖️ Weight Device: ❌ NOT CONNECTED (no data received)");
      }
    }, [weightStatus.status.connected, weightStatus.status.totalRecords, weightStatus.status.recentActivity]);

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
    const [carWeightLocked, setCarWeightLocked] = useState(false); // Added from IN form

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
      outTime: externalOutTime || new Date().toISOString().slice(0, 16),
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
      notes: "",
      inSessionId: undefined,
    });

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
        setFormState((prev) => ({ ...prev, inTime: new Date().toISOString().slice(0, 16) }));
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

        // Format date for datetime-local input
        const outTime = editLog.createdAt 
          ? new Date(editLog.createdAt).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16);

        // Update external outTime if handler is provided
        if (onOutTimeChange) {
          onOutTimeChange(outTime);
        }

        // Format inTime from editLog (if available from related IN session)
        const inTime = editLog.createdAt ? new Date(editLog.createdAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16);

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
          inTime: inTime, // Added from IN form
          outWeightKg: editLog.weightKg || null,
          netWeightKg: editLog.netWeightKg || null,
          grossWeightKg: editLog.weightKg || null, // Added from IN form
          carWeight: (editLog as any).carWeight || 0, // Added from IN form
          trailerWeight: (editLog as any).trailerWeight || 0, // Added from IN form
          totalWeight: editLog.weightKg || 0, // Added from IN form
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

    const locationOptions = useMemo(
      () => locations.map((location) => ({
        value: location.locationName,
        label: `${location.locationName} - ${location.companyName}`,
      })),
      [locations]
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
          // Return locationName because locationOptions uses locationName as value
          return newLocation.locationName;
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
      // #region agent log - Debug weight auto-fill
      console.log(`[DEBUG-WEIGHT] useEffect triggered: latestWeight=${weightStatus.status.latestWeight}, connected=${weightStatus.status.connected}, siteId=${weightStatus.status.siteId}`);
      // #endregion
      
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
          
          // Also update outWeightKg if it's empty (for OUT form)
          if (!prev.outWeightKg) {
            updated.outWeightKg = weightStatus.status.latestWeight;
          }
          
          return updated;
        });
      } else {
        // #region agent log - Debug why not updating
        console.log(`[DEBUG-WEIGHT] NOT updating: latestWeight=${weightStatus.status.latestWeight}, condition check failed`);
        // #endregion
      }
    }, [weightStatus.status.latestWeight, carWeightLocked]);

    // Auto-fill all data from IN session when plate number is entered
    useEffect(() => {
      // Only fetch if we have a plate number (at least 2 characters to avoid too many requests)
      const plateNumber = formState.plateNumber.trim();
      if (!plateNumber || plateNumber.length < 2) {
        return;
      }

      // Don't auto-fill if user is currently typing (debounce)
      let isMounted = true;
      const abortController = new AbortController();
      
      const timeoutId = setTimeout(async () => {
        try {
          const currentPlateNumber = formState.plateNumber.trim();
          // Double-check plate number hasn't changed during debounce
          if (!isMounted || currentPlateNumber !== plateNumber) {
            return;
          }

          // Find the latest IN session and log for this plate number
          const response = await fetch(
            `/api/truck-sessions/find-in?plateNumber=${encodeURIComponent(
              currentPlateNumber
            )}`,
            { signal: abortController.signal }
          );

          if (response.ok) {
            const data = await response.json();

            if (data.success && data.session && isMounted) {
              const inSession = data.session;
              const inLog = data.log; // Log has all the fields

              // Store IN weight for display (use totalWeight from log, fallback to grossWeightKg from session)
              setInWeightKg(inLog?.weightKg || inSession.grossWeightKg || null);

              // Auto-fill all available data (only if fields are empty or not set)
              setFormState((prev) => {
                // Verify we're still processing the same plate number
                if (prev.plateNumber.trim() !== currentPlateNumber) {
                  return prev;
                }

                const updates: Partial<OutSessionFormState> = {
                  inSessionId: inSession.id,
                };

                // Helper to check if field is empty
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
      // Only calculate if we have plate number and out weight is set (can be 0)
      const plateNumber = formState.plateNumber.trim();
      const outWeight = formState.outWeightKg;
      
      if (!plateNumber || outWeight === null || outWeight === undefined) {
        return;
      }

      let isMounted = true;
      const abortController = new AbortController();

      const calculateNetWeight = async () => {
        try {
          // Find the latest IN session for this plate number
          const response = await fetch(
            `/api/truck-sessions/find-in?plateNumber=${encodeURIComponent(plateNumber)}`,
            { signal: abortController.signal }
          );

          if (response.ok && isMounted) {
            const data = await response.json();
            if (data.success && data.session && isMounted) {
              const inSession = data.session;
              const inLog = data.log; // Log has all the fields including weightKg (totalWeight)

              // Verify plate number and weight haven't changed
              if (!isMounted || formState.plateNumber.trim() !== plateNumber || formState.outWeightKg !== outWeight) {
                return;
              }

              // Calculate net weight: IN weight - OUT weight
              // Positive = cargo unloaded, Negative = cargo loaded
              // Use totalWeight from log (weightKg), fallback to grossWeightKg from session
              const inWeight = inLog?.weightKg || inSession.grossWeightKg || 0;
              const outWeightValue = outWeight || 0;
              const netWeight = inWeight - outWeightValue;

              // Update form state with calculated net weight
              setFormState((prev) => {
                // Double-check values haven't changed
                if (!isMounted || prev.plateNumber.trim() !== plateNumber || prev.outWeightKg !== outWeight) {
                  return prev;
                }
                return {
                  ...prev,
                  inSessionId: inSession.id,
                  netWeightKg: netWeight,
                };
              });

              // Store IN weight for display (use totalWeight from log, fallback to grossWeightKg from session)
              if (isMounted) {
                setInWeightKg(inLog?.weightKg || inSession.grossWeightKg || null);
              }
            }
          }
        } catch (error) {
          // Only log errors if not aborted and in development
          if (!abortController.signal.aborted && isMounted && process.env.NODE_ENV === "development") {
            console.error("Error calculating net weight:", error);
          }
        }
      };

      calculateNetWeight();

      return () => {
        isMounted = false;
        abortController.abort();
      };
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
            weightKg: formState.outWeightKg || undefined,
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
          setInWeightKg(null);
          setSavedUniqueCode(null);
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
          grossWeightKg: formState.outWeightKg,
          netWeightKg:
            formState.netWeightKg !== null &&
            formState.netWeightKg !== undefined
              ? formState.netWeightKg
              : undefined,
          carWeight: formState.carWeight || undefined, // Added from IN form
          trailerWeight: formState.trailerWeight || undefined, // Added from IN form
          inSessionId: formState.inSessionId
            ? formState.inSessionId
            : undefined,
          outTime: saveTime,
          inTime: formState.inTime || undefined, // Added from IN form
          sealNumber: formState.sealNumber.trim() || undefined,
          hasTrailer: hasTrailer || undefined,
          trailerNumber: hasTrailer ? formState.trailerNumber.trim() : undefined,
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

        // Store the unique code from the saved session
        if (savedSession.session?.uniqueCode) {
          setSavedUniqueCode(savedSession.session.uniqueCode);
        }

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
                // Core fields (original format)
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
                
                // New fields (updated API format)
                PRM: "", // Premium/Permit number
                CT2: "", // Container 2
                CT3: "", // Container 3
                CT4: "", // Container 4
                TID: "", // Transaction ID
                
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
        setSavedUniqueCode(null);
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
            <Card className="p-4 pb-8 w-full max-w-6xl min-h-[calc(100vh+6rem)] flex flex-col">
              {/* License Plate Input with Warning */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <div className="w-full md:w-1/2 lg:w-1/3">
                    <div className="bg-white rounded-lg flex items-center justify-center border border-black px-3 py-1 relative h-14" style={{ borderWidth: '0.5px' }}>
                      <Input
                        ref={setPlateInputRef}
                        id="plateNumber"
                        value={formState.plateNumber}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          
                          // Any manual edit disables auto-fill for the rest of this session
                          if (!isAutofillingRef.current) {
                            manuallyClearedRef.current = true;
                          }
                          
                          setFormState((prev) => ({
                            ...prev,
                            plateNumber: newValue,
                          }));
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
                          <div className="text-4xl font-mono font-bold text-black leading-none">
                            {formState.plateNumber.replace(/[^0-9]/g, '')}
                          </div>
                          <div className="text-4xl font-mono font-bold text-black leading-none">
                            {formState.plateNumber.replace(/[0-9]/g, '').toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-2/3 flex flex-col gap-1.5">
                    <div className="bg-blue-50 border border-blue-200 rounded p-2 flex items-center w-full">
                      <p className="text-gray-700 text-xs leading-relaxed">
                        Камер ачааллахын тулд дэлгэцэн дээр байрлах <span className="text-[#0073c4]">Gaali Camera Bridge</span> программыг ажиллуулж байж дүрс гарах тул уг программыг эхлээд асаасан байх шаардлагатай.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weight Inputs - Full width section like IN form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 -mt-2 mb-4">
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
                          };
                        });
                      }}
                      className="h-14 !text-5xl !md:text-5xl font-mono font-bold !text-green-600 w-full bg-white [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                    />
                  </div>
                </div>

                {/* Total Weight */}
                <div className="flex flex-col">
                  <div className="mb-1 min-h-[1.25rem] flex items-center">
                    <Label
                      htmlFor="totalWeight"
                      className="text-base font-medium text-gray-700"
                    >
                      Орох үеийн нийт жин (кг) <span className="text-red-500">*</span>
                    </Label>
                  </div>
                  <div className="h-14">
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
                        }));
                      }}
                      className="h-14 !text-5xl !md:text-5xl font-mono font-bold !text-green-600 w-full bg-white [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 auto-rows-min">
                {/* Out Weight Input - Same width as other inputs */}
                <div className="flex flex-col">
                  <div className="mb-1 min-h-[1.25rem] flex items-center">
                    <Label
                      htmlFor="outWeightKg"
                      className="text-base font-medium text-gray-700"
                    >
                      Гарах жин (кг) <span className="text-red-500">*</span>
                    </Label>
                  </div>
                  <div className="h-12">
                    <Input
                      id="outWeightKg"
                      type="number"
                      value={formState.outWeightKg ?? ""}
                      onChange={(e) => {
                        const value =
                          e.target.value === ""
                            ? null
                            : parseFloat(e.target.value);
                        // #region agent log - Debug manual weight input
                        console.log(`[DEBUG-WEIGHT] Manual input: value=${value}, formState.outWeightKg=${formState.outWeightKg}`);
                        // #endregion
                        setFormState((prev) => ({
                          ...prev,
                          outWeightKg: value,
                        }));
                      }}
                      className="h-12 text-base w-full bg-green-600 text-white placeholder:text-white [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                      placeholder="Жин оруулах (кг)"
                      required
                    />
                  </div>
                </div>
                


                {/* In Weight Input */}
                <div className="flex flex-col min-w-0">
                  <div className="mb-1 min-h-[1.25rem] flex items-center">
                    <Label
                      htmlFor="inWeightKg"
                      className="text-base font-medium text-gray-700"
                    >
                      Орох жин (кг)
                    </Label>
                  </div>
                  <div className="h-12 min-w-0 max-w-full overflow-hidden">
                    <Input
                      id="inWeightKg"
                      type="number"
                      value={inWeightKg ?? ""}
                      readOnly
                      className="h-12 text-base w-full max-w-full bg-green-600 text-white placeholder:text-white [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] box-border"
                      placeholder="Орох жин (кг)"
                    />
                  </div>
                </div>

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
                      disabled={isLoadingTrailers}
                      placeholder={
                        isLoadingTrailers ? "Уншиж байна..." : "Чиргүүл сонгох"
                      }
                      searchPlaceholder="Чиргүүлийн улсын дугаар хайх..."
                      className="h-12 !bg-blue-400 !text-white !border-blue-400 hover:!bg-blue-500 hover:!border-blue-500 [&>span]:!text-white [&>span.text-muted-foreground]:!text-white/90"
                    />
                  </div>
                </div>

                {/* Net Weight Input */}
                <div className="flex flex-col">
                  <div className="mb-1 min-h-[1.25rem] flex items-center">
                      <Label
                        htmlFor="netWeightKg"
                      className="text-base font-medium text-gray-700"
                      >
                        Цэвэр жин (кг) <span className="text-red-500">*</span>
                      </Label>
                  </div>
                  <div className="h-12">
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
                      className="h-12 text-base w-full bg-green-600 text-white placeholder:text-white [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                        placeholder="Цэвэр жин (кг)"
                        required
                      />
                    </div>
                </div>

                {/* Seal Number */}
                <div className="flex flex-col">
                  <div className="mb-1 min-h-[1.25rem] flex items-center">
                    <Label
                      htmlFor="sealNumber"
                      className="text-base font-medium text-gray-700"
                    >
                      Лацны дугаар
                    </Label>
                  </div>
                  <div className="h-12">
                    <Input
                      id="sealNumber"
                      value={formState.sealNumber}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          sealNumber: e.target.value,
                        }))
                      }
                      className="h-12 text-base w-full"
                      placeholder="Лацны дугаар оруулах"
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
                      disabled={isLoadingDrivers}
                      placeholder={
                        isLoadingDrivers ? "Уншиж байна..." : "Жолооч сонгох"
                      }
                      searchPlaceholder="Жолооч хайх..."
                      onCreateNewDialog={(initialValue) => handleOpenCreateDialog("driver", initialValue)}
                      createNewLabel="+ Нэмэх ..."
                      className="h-12"
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
                        disabled={isLoadingCompanies}
                        placeholder={
                          isLoadingCompanies
                            ? "Уншиж байна..."
                            : "Тээврийн компани сонгох"
                        }
                        searchPlaceholder="Тээврийн компани хайх..."
                        onCreateNewDialog={(initialValue) => handleOpenCreateDialog("transportCompany", initialValue)}
                        createNewLabel="+ Нэмэх ..."
                      className="h-12"
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
                      disabled={isLoadingProducts}
                      placeholder={
                        isLoadingProducts
                          ? "Уншиж байна..."
                          : "Бүтээгдэхүүн сонгох"
                      }
                      searchPlaceholder="Бүтээгдэхүүн хайх..."
                      onCreateNewDialog={(initialValue) => handleOpenCreateDialog("product", initialValue)}
                      createNewLabel="+ Нэмэх ..."
                      className="h-12"
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
                        disabled={isLoadingLocations}
                        placeholder={isLoadingLocations ? "Уншиж байна..." : "Байршил сонгох"}
                        searchPlaceholder="Байршил хайх..."
                        onCreateNewDialog={(initialValue) => handleOpenCreateDialog("location", initialValue)}
                        createNewLabel="+ Нэмэх ..."
                        className="h-12 text-base w-full"
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
                        disabled={isLoadingLocations}
                        placeholder={isLoadingLocations ? "Уншиж байна..." : "Байршил сонгох"}
                        searchPlaceholder="Байршил хайх..."
                        onCreateNewDialog={(initialValue) => handleOpenCreateDialog("location", initialValue)}
                        createNewLabel="+ Нэмэх ..."
                        className="h-12 text-base w-full"
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
                        disabled={isLoadingOrganizations}
                        placeholder={
                          isLoadingOrganizations
                            ? "Уншиж байна..."
                            : "Илгээч байгууллага сонгох"
                        }
                        searchPlaceholder="Илгээч байгууллага хайх..."
                        onCreateNewDialog={(initialValue) => handleOpenCreateDialog("organization", initialValue)}
                        createNewLabel="+ Нэмэх ..."
                      className="h-12"
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
                        disabled={isLoadingOrganizations}
                        placeholder={
                          isLoadingOrganizations
                            ? "Уншиж байна..."
                            : "Хүлээн авагч байгууллага сонгох"
                        }
                        searchPlaceholder="Хүлээн авагч байгууллага хайх..."
                        onCreateNewDialog={(initialValue) => handleOpenCreateDialog("organization", initialValue)}
                        createNewLabel="+ Нэмэх ..."
                      className="h-12"
                      />
                    </div>
              </div>

                {/* Notes - Wider, Reduced Height */}
                <div className="md:col-span-2 flex flex-col">
                  <div className="mb-1 min-h-[1.25rem] flex items-center">
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
                      // Textarea has a default `min-h-16` in the shared component, so we must override it here.
                      className="text-base resize-none h-12 min-h-0 w-full"
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
                <div className="flex flex-col">
                  <div className="mb-1 min-h-[1.25rem] flex items-center">
                    <Label
                      htmlFor="outTime"
                      className="text-base font-medium text-gray-700"
                    >
                      Гарах цаг
                    </Label>
                  </div>
                  <div className="h-12">
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
                      className="h-12 text-base w-full"
                    />
                  </div>
                </div>

                {/* Warning message under receiver organization - full width row */}
                <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-2">
                  <div className="bg-red-50 border border-red-300 rounded p-2 w-full">
                    <p className="text-red-600 text-sm leading-tight">
                      <span className="text-lg font-bold">*</span> Улаан одоор тэмдэглэгдсэн нүдний мэдээлэл Гаалын мэдээллийн санд өгөгдөл болон дамжуулагдах тул анхааралтай бөглөнө үү.
                    </p>
                  </div>
                  <div className="bg-red-50 border border-red-300 rounded p-2 w-full">
                    <p className="text-red-600 text-sm leading-tight">
                      Гараас өгөгдөл оруулах дохиололд Гаалийн газраас зөвшөөрөгдөөгүй тул анхаарна уу!
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 mt-auto pt-3 border-t border-gray-200">
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
                            } catch (e) {
                              console.warn(
                                "Could not fetch OUT session unique code:",
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
                  className="h-12 px-5 text-base"
                      title="PDF файл татах"
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
                                description: "Мэдээлэл Монголын гаальд амжилттай илгээгдлээ",
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
                      type="submit"
                      onClick={handleSubmit}
                      disabled={
                        !formState.outWeightKg ||
                        !formState.netWeightKg ||
                        isSaving
                      }
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 h-14 px-6 text-base"
                    >
                      {isSaving ? "Хадгалж байна..." : "Хадгалах"}
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
