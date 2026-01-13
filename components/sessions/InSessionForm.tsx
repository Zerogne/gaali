"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FilterableSelect } from "@/components/ui/filterable-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLprPlateAutofill } from "@/hooks/useLprPlateAutofill";
import { useConnectorSSE } from "@/hooks/useConnectorSSE";
import { useThirdPartyAutofill } from "@/hooks/useThirdPartyAutofill";
import { useWeightStatus } from "@/hooks/useWeightStatus";
import { useLatestLpr } from "@/hooks/useLatestLpr";
import { updateTruckLog, sendTruckLogToCustoms } from "@/lib/api";
import type { Product } from "@/lib/products/products";
import type {
  Driver,
  Organization,
  TransportCompany,
  TruckLog,
  Location,
} from "@/lib/types";
import { Camera, Send, Loader2 } from "lucide-react";
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
  carWeight: number | null;
  trailerWeight: number | null;
  totalWeight: number | null;
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
    const [plateInputRef, setPlateInputRef] = useState<HTMLInputElement | null>(
      null
    );
    const isAutofillingRef = useRef(false);
    const manuallyClearedRef = useRef(false); // Tracks if user manually edited plate (disables auto-fill for session)
    
    // Get connector URL from localStorage or environment variable
    const [connectorUrl] = useState(() => {
      if (typeof window === "undefined") {
        return process.env.NEXT_PUBLIC_CONNECTOR_SSE_URL || "http://localhost:3000/events";
      }
      try {
        const saved = localStorage.getItem("cameraSettings");
        if (saved) {
          const settings = JSON.parse(saved);
          if (settings.connectorUrl) {
            return settings.connectorUrl;
          }
        }
      } catch (e) {
        // Ignore localStorage errors
      }
      return process.env.NEXT_PUBLIC_CONNECTOR_SSE_URL || "http://localhost:3000/events";
    });
    
    // Use SSE for real-time camera updates from Windows connector
    // Falls back to polling if SSE not available
    // Only enable if connector URL is explicitly set (not default localhost)
    const shouldEnableConnector = connectorUrl && 
      !connectorUrl.includes("localhost:3000") && 
      !connectorUrl.includes("127.0.0.1:3000");
    
    const connectorSSE = useConnectorSSE({
      connectorUrl,
      enabled: shouldEnableConnector, // Disable if using default localhost
    });
    const internalCameraAutofill = useLprPlateAutofill();

    // Prefer SSE if connected, otherwise use external autofill or polling
    const cameraAutofill = 
      connectorSSE.status === "connected" ? connectorSSE
      : externalCameraAutofill || internalCameraAutofill;

    // Direct plate number auto-fill (similar to weight) - updates whenever new data arrives
    const { latest: latestLpr } = useLatestLpr(1000); // Poll every 1 second

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
    const [isDriverDialogOpen, setIsDriverDialogOpen] = useState(false);
    const [savedUniqueCode, setSavedUniqueCode] = useState<string | null>(null);
    const [carWeightLocked, setCarWeightLocked] = useState(false);

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
      carWeight: 0,
      trailerWeight: 0,
      totalWeight: 0,
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
          carWeight: 0,
          trailerWeight: 0,
          totalWeight: editLog.weightKg || null,
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

      // Load trailers
      try {
        setIsLoadingTrailers(true);
        const response = await fetch("/api/trailers");
        if (response.ok) {
          const data = await response.json();
          setTrailers(data);
        } else {
          // Silently fail when loading - don't show error toast
          // The dropdown will just be empty, which is acceptable
          console.error("Error loading trailers:", response.status, response.statusText);
        }
      } catch (error) {
        // Silently fail when loading - don't show error toast
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
        } else {
          console.error("Error loading seller locations:", sellersResponse.status, sellersResponse.statusText);
        }
        if (buyersResponse.ok) {
          const buyersData = await buyersResponse.json();
          allLocations.push(...buyersData);
        } else {
          console.error("Error loading buyer locations:", buyersResponse.status, buyersResponse.statusText);
        }
        setLocations(allLocations);
      } catch (error) {
        // Silently fail when loading - don't show error toast
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

    const handleCreateTransportCompany = async (name: string, companyId?: string, contract?: string, phone?: string) => {
      try {
        const response = await fetch("/api/transport-companies", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({ name, companyId, contract, phone }),
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

    const handleCreateDriver = async (name: string, phone?: string, registrationNumber?: string, additionalInfo?: string) => {
      try {
        const response = await fetch("/api/drivers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
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
          const errorData = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));
          const errorMessage =
            errorData.error ||
            errorData.message ||
            "Жолооч нэмэхэд алдаа гарлаа";
          toast({
            title: "Алдаа",
            description: errorMessage,
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
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({ name, companyId, contract, phone }),
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

    // Handler for creating trailers
    const handleCreateTrailer = async (plateNumber: string, ownerName: string, ownerId: string, ownerPhone: string) => {
      try {
        const response = await fetch("/api/trailers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({ plateNumber, ownerName, ownerId, ownerPhone }),
        });
        if (response.ok) {
          const newTrailer = await response.json();
          setTrailers((prev) => [...prev, newTrailer]);
          toast({
            title: "Амжилттай",
            description: "Чиргүүл амжилттай нэмэгдлээ",
          });
          // Return plateNumber because trailerOptions uses plateNumber as value
          return newTrailer.plateNumber;
        } else {
          const errorData = await response.json().catch(() => ({}));
          // Check if it's a MongoDB connection error
          const errorMessage = errorData.error || "";
          const isMongoError = errorMessage.includes("MongoNetworkError") || 
                              errorMessage.includes("SSL") || 
                              errorMessage.includes("tlsv1") ||
                              response.status === 500;
          
          const userFriendlyMessage = isMongoError 
            ? "Мэдээллийн сантай холбогдох үед алдаа гарлаа. Дахин оролдоно уу."
            : (errorData.error || "Чиргүүл нэмэхэд алдаа гарлаа");
          
          toast({
            title: "Алдаа",
            description: userFriendlyMessage,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error creating trailer:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isNetworkError = errorMessage.includes("NetworkError") || 
                              errorMessage.includes("fetch") ||
                              errorMessage.includes("Failed to fetch");
        
        const userFriendlyMessage = isNetworkError
          ? "Сүлжээний алдаа гарлаа. Интернэт холболтоо шалгаад дахин оролдоно уу."
          : "Чиргүүл нэмэхэд алдаа гарлаа";
        
        toast({
          title: "Алдаа",
          description: userFriendlyMessage,
          variant: "destructive",
        });
      }
      return null;
    };

    // Handler for creating locations
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
          // Check if it's a MongoDB connection error
          const errorMessage = errorData.error || "";
          const isMongoError = errorMessage.includes("MongoNetworkError") || 
                              errorMessage.includes("SSL") || 
                              errorMessage.includes("tlsv1") ||
                              response.status === 500;
          
          const userFriendlyMessage = isMongoError 
            ? "Мэдээллийн сантай холбогдох үед алдаа гарлаа. Дахин оролдоно уу."
            : (errorData.error || "Байршил нэмэхэд алдаа гарлаа");
          
          toast({
            title: "Алдаа",
            description: userFriendlyMessage,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error creating location:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isNetworkError = errorMessage.includes("NetworkError") || 
                              errorMessage.includes("fetch") ||
                              errorMessage.includes("Failed to fetch");
        
        const userFriendlyMessage = isNetworkError
          ? "Сүлжээний алдаа гарлаа. Интернэт холболтоо шалгаад дахин оролдоно уу."
          : "Байршил нэмэхэд алдаа гарлаа";
        
        toast({
          title: "Алдаа",
          description: userFriendlyMessage,
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

      // Validate required fields for trailer
      if (createDialogType === "trailer") {
        if (!createDialogOwnerName.trim()) {
          toast({
            title: "Алдаа",
            description: "Эзэмшигчийн нэр шаардлагатай",
            variant: "destructive",
          });
          return;
        }
        if (!createDialogOwnerId.trim()) {
          toast({
            title: "Алдаа",
            description: "Эзэмшигчийн регистер шаардлагатай",
            variant: "destructive",
          });
          return;
        }
        if (!createDialogPhone.trim()) {
          toast({
            title: "Алдаа",
            description: "Эзэмшигчийн утасны дугаар шаардлагатай",
            variant: "destructive",
          });
          return;
        }
      }

      // Validate required fields for location
      if (createDialogType === "location") {
        if (!createDialogLocationName.trim()) {
          toast({
            title: "Алдаа",
            description: "Байршлын нэр шаардлагатай",
            variant: "destructive",
          });
          return;
        }
        if (!createDialogCompanyId.trim()) {
          toast({
            title: "Алдаа",
            description: "Компанийн нэр шаардлагатай",
            variant: "destructive",
          });
          return;
        }
        if (!createDialogLocationType || (createDialogLocationType !== "seller" && createDialogLocationType !== "buyer")) {
          toast({
            title: "Алдаа",
            description: "Төрөл сонгох шаардлагатай",
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
        } else if (createDialogType === "trailer") {
          newId = await handleCreateTrailer(
            createDialogName.trim(),
            createDialogOwnerName.trim(),
            createDialogOwnerId.trim(),
            createDialogPhone.trim()
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

            // Don't auto-fill if user has manually edited in this session
            if (manuallyClearedRef.current) {
              console.log("📝 Auto-fill blocked - user manually edited plate");
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
        totalWeight: weightKg,
        grossWeightKg: weightKg,
      }));
    };

    // Auto-fill weight when weight status updates
    useEffect(() => {
      if (weightStatus.status.latestWeight !== null && weightStatus.status.latestWeight > 0) {
        setFormState((prev) => {
          let updated;
          
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
          
          return updated;
        });
      }
    }, [weightStatus.status.latestWeight, carWeightLocked]);

    // Auto-fill plate number when LPR data updates (only if user hasn't manually edited)
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
            
            const updated = {
              ...prev,
              plateNumber: plateNumber,
            };
            
            // Notify parent of plate change
            onPlateChange?.(plateNumber);
            
            return updated;
          }
          
          return prev;
        });
      }
    }, [latestLpr?.plateNumber, latestLpr?.receivedAt, onPlateChange]);

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
            weightKg: formState.totalWeight || undefined,
            hasTrailer: hasTrailer || undefined,
            trailerPlate: hasTrailer
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
            inTime: new Date().toISOString().slice(0, 16),
            grossWeightKg: null,
          carWeight: 0,
          trailerWeight: 0,
          totalWeight: 0,
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
          grossWeightKg: formState.totalWeight,
          carWeight: formState.carWeight || undefined,
          trailerWeight: formState.trailerWeight || undefined,
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

        // Store the unique code from the saved session
        if (savedSession.session?.uniqueCode) {
          setSavedUniqueCode(savedSession.session.uniqueCode);
        }

        // Verify log was created by checking server response
        console.log("✅ Session saved:", savedSession.session?.id);
        console.log("✅ Session unique code:", savedSession.session?.uniqueCode);
        
        // Check if there's a warning about log creation
        if (savedSession.warning) {
          console.warn("⚠️ Warning from server:", savedSession.warning);
          toast({
            title: "Анхааруулга",
            description: "Бүртгэл хадгалагдсан боловч түүхэнд харагдахгүй байж магадгүй",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Амжилттай",
            description: "ОРОХ бүртгэл амжилттай хадгалагдлаа",
          });
        }

        // 3rd party sending removed for In Session
        if (false && savedSession.session && savedSession.session.uniqueCode) {
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
                NET: 0, // IN session has no net weight
                SLN: "",
                TRL: formState.hasTrailer
                  ? formState.trailerNumber.trim().toUpperCase()
                  : "",
                UPC: formState.destination.trim() || receiverOrgName,
                VNO: formState.plateNumber.trim().toUpperCase(),
                WGT: formState.grossWeightKg || 0,
                
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
            const getWsState = (socket: WebSocket | null): string => 
              socket !== null ? `readyState: ${socket.readyState} (OPEN=${WebSocket.OPEN})` : "null";
            const isWsConnected = (socket: WebSocket | null): socket is WebSocket => 
              socket !== null && socket.readyState === WebSocket.OPEN;
            
            let ws = getWebSocket();
            console.log("🔌 Current WebSocket state:", getWsState(ws));

            if (!isWsConnected(ws)) {
              console.log(
                "🔌 WebSocket not connected, attempting to connect..."
              );
              try {
                ws = await connectWebSocket();
                console.log("✅ WebSocket connection attempt completed");
                ws = getWebSocket();
                await new Promise((resolve) => setTimeout(resolve, 50));
                ws = getWebSocket();
                if (!isWsConnected(ws)) {
                  console.error(
                    "❌ ERROR: WebSocket connection failed or closed immediately"
                  );
                  console.error(
                    "❌ WebSocket states: CONNECTING=0, OPEN=1, CLOSING=2, CLOSED=3"
                  );
                  console.error("❌ Current state:", getWsState(ws));
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
            if (!isWsConnected(ws)) {
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

            // TypeScript guard: ws is guaranteed to be non-null after the check above
            const wsForSend = ws!;
            if (wsForSend.readyState !== WebSocket.OPEN) {
              console.error("❌ ERROR: WebSocket closed right before send!");
              toast({
                title: "Алдаа",
                description:
                  "WebSocket холболт тасарсан байна. Дахин оролдоно уу.",
                variant: "destructive",
              });
              return false;
            }

            // wsForSend is guaranteed to be non-null and open after the checks above
            wsForSend.send(dataUrl);
            console.log("✅ ws.send() completed without throwing error");

            // Step 6: Check connection after a short delay (matching test-websocket.html)
            await new Promise((resolve) => setTimeout(resolve, 100));
            const wsAfterSend = getWebSocket();
            const isWsOpen = (socket: WebSocket | null): socket is WebSocket => 
              socket !== null && socket.readyState === WebSocket.OPEN;

            if (!isWsOpen(wsAfterSend)) {
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
          } catch (sendError: unknown) {
            console.error("=".repeat(50));
            console.error("❌ ERROR: Exception thrown while sending data");
            console.error("❌ Error:", sendError);
            const getErrorMessage = (err: unknown): string => {
              if (err instanceof Error) {
                return err.message;
              }
              if (typeof err === 'string') {
                return err;
              }
              return String(err ?? 'Unknown error');
            };
            const errorMessage = getErrorMessage(sendError);
            console.error("❌ Error message:", errorMessage);
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
          inTime: new Date().toISOString().slice(0, 16),
          grossWeightKg: null,
          carWeight: null,
          trailerWeight: null,
          totalWeight: null,
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
                          
                          // Any manual edit disables auto-fill for the rest of this session
                          if (!isAutofillingRef.current) {
                            manuallyClearedRef.current = true;
                            cameraAutofill.trackTyping();
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
                  <div className="w-2/3 flex flex-col gap-1.5">
                    <div className="bg-blue-50 border border-blue-200 rounded p-2 flex items-center w-full">
                      <p className="text-gray-700 text-xs leading-relaxed">
                        Машины дугаар, жинг оруулахын тулд <span className="text-[#0073c4]">Gaali Bridge</span> программыг ажиллуулсан байх шаардлагатай.
                      </p>
                    </div>
                    <div className="bg-red-50 border border-red-300 rounded p-2 w-full">
                      <p className="text-red-600 text-sm leading-tight">
                        Гараас өгөгдөл оруулах дохиололд Гаалийн газраас зөвшөөрөгдөөгүй тул анхаарна уу!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weight Inputs - Full width, directly under license plate and warning */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 -mt-2">
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                {/* Standardized FormField Wrapper Pattern:
                    - Label area: fixed height (h-5) with mb-1
                    - Control area: fixed height (h-11 = 44px)
                    - Helper text: optional, fixed height area
                */}


                {/* Trailer - Now on next row */}
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
                      onCreateNewDialog={(initialValue) => handleOpenCreateDialog("trailer", initialValue)}
                      createNewLabel="+ Нэмэх ..."
                      className="h-12 !bg-blue-400 !text-white !border-blue-400 hover:!bg-blue-500 hover:!border-blue-500 [&>span]:!text-white [&>span.text-muted-foreground]:!text-white/90"
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
                          : "Сонгох"
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
                          : "Сонгох"
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
                          : "Сонгох"
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
                          : "Сонгох"
                      }
                        searchPlaceholder="Хүлээн авагч байгууллага хайх..."
                        onCreateNewDialog={(initialValue) => handleOpenCreateDialog("organization", initialValue)}
                        createNewLabel="+ Нэмэх ..."
                      className="h-12"
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
                      // Textarea has a default `min-h-16` in the shared component, so we must override it here.
                      className="text-base resize-none h-12 min-h-0 w-full"
                      placeholder="Нэмэлт мэдээлэл..."
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
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-200">
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
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700 h-14 px-6 text-base"
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
                {createDialogType === "trailer" && "Шинэ чиргүүл нэмэх"}
                {createDialogType === "location" && "Шинэ байршил нэмэх"}
              </DialogTitle>
              <DialogDescription>
                {createDialogType === "transportCompany" && "Тээврийн компанийн мэдээлэл оруулна уу"}
                {createDialogType === "product" && "Бүтээгдэхүүний нэрийг оруулна уу"}
                {createDialogType === "organization" && "Тээврийн байгууллагын мэдээлэл оруулна уу"}
                {createDialogType === "driver" && "Жолоочийн мэдээлэл оруулна уу"}
                {createDialogType === "trailer" && "Чиргүүлийн мэдээлэл оруулна уу"}
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
                  {createDialogType === "trailer" && "Чиргүүлийн улсын дугаар"}
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
                    : createDialogType === "trailer" ? "Чиргүүлийн улсын дугаар оруулах"
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

              {/* Trailer specific fields */}
              {createDialogType === "trailer" && (
                <>
                  <div>
                    <Label htmlFor="create-dialog-owner-name">
                      Эзэмшигчийн нэр <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="create-dialog-owner-name"
                      value={createDialogOwnerName}
                      onChange={(e) => setCreateDialogOwnerName(e.target.value)}
                      placeholder="Эзэмшигчийн нэр оруулах"
                    />
                  </div>
                  <div>
                    <Label htmlFor="create-dialog-owner-id">
                      Эзэмшигчийн регистер <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="create-dialog-owner-id"
                      value={createDialogOwnerId}
                      onChange={(e) => setCreateDialogOwnerId(e.target.value)}
                      placeholder="Эзэмшигчийн регистрийн дугаар оруулах"
                    />
                  </div>
                  <div>
                    <Label htmlFor="create-dialog-owner-phone">
                      Эзэмшигчийн утасны дугаар <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="create-dialog-owner-phone"
                      type="tel"
                      value={createDialogPhone}
                      onChange={(e) => setCreateDialogPhone(e.target.value)}
                      placeholder="Эзэмшигчийн утасны дугаар оруулах"
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
                  (createDialogType === "trailer" && (
                    !createDialogOwnerName.trim() ||
                    !createDialogOwnerId.trim() ||
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

InSessionForm.displayName = "InSessionForm";
