export type Direction = "IN" | "OUT";

export interface TruckLog {
  id: string;
  direction: Direction;
  plate: string;
  driverName: string;
  cargoType: string;
  weightKg?: number;
  comments?: string;
  vehicleRegistrationNumber?: string; // Teevriin heregsliin ulsiind dugaar
  vehicleRegistrationYear?: string; // Teevriin heregsliin jin
  origin?: string; // Haanaas
  destination?: string; // Haashaa
  senderOrganization?: string; // ilgeegch baiguullaga
  receiverOrganization?: string; // huleen avagch baiguullaga
  createdAt: string;
  sentToCustoms: boolean;
}

export interface PlateRecognition {
  plate: string;
  confidence: number;
  timestamp: string;
}
