export type Direction = "IN" | "OUT";
export type TransportType = "truck" | "container" | "tanker" | "flatbed" | "refrigerated" | "other";

export interface Driver {
  id: string;
  name: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  registrationNumber?: string; // Тээврийн хэрэгслийн улсын дугаар
  registrationYear?: string; // Тээврийн хэрэгслийн жил
}

export interface TransportCompany {
  id: string;
  name: string;
}

export type OrganizationType = "sender" | "receiver";

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType; // "sender" (илгээч) or "receiver" (хүлээн авагч)
}

export interface TruckLog {
  id: string;
  direction: Direction;
  plate: string;
  driverId?: string; // Driver selection
  driverName: string; // Keep for backward compatibility
  cargoType: string;
  weightKg?: number;
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
  createdAt: string;
  sentToCustoms: boolean;
}

export interface PlateRecognition {
  plate: string;
  confidence: number;
  timestamp: string;
}
