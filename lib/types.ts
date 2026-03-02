export type Direction = "IN" | "OUT";
export type TransportType = "truck" | "container" | "tanker" | "flatbed" | "refrigerated" | "other";

export interface Driver {
  id: string;
  name: string;
  phone?: string;
  registrationNumber?: string;
  additionalInfo?: string;
}

export interface TransportCompany {
  id: string;
  name: string;
  companyId?: string;
  contract?: string;
  phone?: string;
}

export type OrganizationType = "sender" | "receiver";

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType; // "sender" (илгээч) or "receiver" (хүлээн авагч)
  companyId?: string;
  contract?: string;
  phone?: string;
}

export interface TruckLog {
  id: string;
  direction: Direction;
  plate: string;
  driverId?: string; // Driver selection
  driverName: string; // Keep for backward compatibility
  cargoType: string; // Product name (label) - for display
  productId?: string; // Product ID (value) - for form selection
  /** Total weight when entering (IN) = truckWeight + trailerWeight. Stored in DB. */
  totalInWeight?: number;
  /** Total weight when exiting (OUT) = truckWeight + trailerWeight. Stored in DB. */
  totalOutWeight?: number;
  /** Net weight (cargo) = totalInWeight - totalOutWeight. Stored in DB. */
  netWeight?: number;
  /** Truck/cab weight (машины жин). totalInWeight/out = truckWeight + trailerWeight. */
  truckWeight?: number;
  /** Trailer weight (чиргүүлийн жин). totalInWeight/out = truckWeight + trailerWeight. */
  trailerWeight?: number;
  /** @deprecated Use totalInWeight/totalOutWeight. Populated when reading for backward compat. */
  weightKg?: number;
  /** @deprecated Use netWeight. Populated when reading for backward compat. */
  netWeightKg?: number;
  comments?: string;
  origin?: string; // Haanaas
  destination?: string; // Haashaa
  senderOrganizationId?: string; // Organization ID
  senderOrganization?: string; // Keep for backward compatibility
  receiverOrganizationId?: string; // Organization ID
  receiverOrganization?: string; // Keep for backward compatibility
  transportCompanyId?: string; // Transport company ID
  transportType?: TransportType;
  sealNumber?: string;
  hasTrailer?: boolean; // Chirguultei checkbox
  trailerPlate?: string; // Trailer plate (shown when hasTrailer is true)
  vehicleRegistrationNumber?: string; // Vehicle registration number
  vehicleRegistrationYear?: string; // Vehicle registration year
  bagQuantity?: string; // Шуудайны тоо хэмжээ орсон/IN (bag quantity at entry)
  bagQuantityOut?: string; // Шуудайны тоо хэмжээ гарсан/OUT (bag quantity at exit)
  rfid?: string; // RFID дугаар
  createdAt: string;
  sentToCustoms: boolean;
}

export interface PlateRecognition {
  plate: string;
  confidence: number;
  timestamp: string;
}

export interface Contract {
  id: string;
  number: string; // Гэрээний дугаар
  company: string; // Компани
  companyId: string; // Компанийн регистер
  companyPhone: string; // Компанийн утасны дугаар
  description?: string; // Тайлбар
  startDate?: string; // Эхлэх огноо
  endDate?: string; // Дуусах огноо
  createdAt: string;
}

export type LocationType = "seller" | "buyer";

export interface Location {
  id: string;
  locationName: string; // Байршил
  companyName: string; // Компанийн нэр
  type: LocationType; // "seller" (борлуулагч) or "buyer" (худалдан авагч)
  createdAt: string;
}
