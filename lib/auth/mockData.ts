export interface Company {
  id: string;
  name: string;
  description: string;
  logoInitials: string;
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  companyId: string;
}

export const companies: Company[] = [
  {
    id: "altan-logistics",
    name: "Altan Logistics LLC",
    description: "Border checkpoint #3",
    logoInitials: "AL",
  },
  {
    id: "steppe-mining",
    name: "Steppe Mining Co.",
    description: "Mining operations hub",
    logoInitials: "SM",
  },
  {
    id: "blueroad-transport",
    name: "BlueRoad Transport",
    description: "Main transport terminal",
    logoInitials: "BR",
  },
  {
    id: "frontier-customs",
    name: "Frontier Customs Partner",
    description: "Customs processing center",
    logoInitials: "FC",
  },
];

export const workers: Worker[] = [
  // Altan Logistics workers
  {
    id: "worker-altan-1",
    name: "Баярмаа Ганбат",
    role: "Gate Operator",
    avatarColor: "bg-blue-500",
    companyId: "altan-logistics",
  },
  {
    id: "worker-altan-2",
    name: "Энхбат Дорж",
    role: "Supervisor",
    avatarColor: "bg-green-500",
    companyId: "altan-logistics",
  },
  {
    id: "worker-altan-3",
    name: "Цэцэгмаа Бат",
    role: "Data Entry",
    avatarColor: "bg-purple-500",
    companyId: "altan-logistics",
  },
  // Steppe Mining workers
  {
    id: "worker-steppe-1",
    name: "Батбаяр Мөнх",
    role: "Gate Operator",
    avatarColor: "bg-orange-500",
    companyId: "steppe-mining",
  },
  {
    id: "worker-steppe-2",
    name: "Сараа Очир",
    role: "Supervisor",
    avatarColor: "bg-red-500",
    companyId: "steppe-mining",
  },
  {
    id: "worker-steppe-3",
    name: "Ганбат Наран",
    role: "Security Officer",
    avatarColor: "bg-indigo-500",
    companyId: "steppe-mining",
  },
  // BlueRoad Transport workers
  {
    id: "worker-blueroad-1",
    name: "Дорж Бат",
    role: "Gate Operator",
    avatarColor: "bg-teal-500",
    companyId: "blueroad-transport",
  },
  {
    id: "worker-blueroad-2",
    name: "Мөнхбат Цогт",
    role: "Supervisor",
    avatarColor: "bg-cyan-500",
    companyId: "blueroad-transport",
  },
  {
    id: "worker-blueroad-3",
    name: "Оюунбат Ган",
    role: "Data Entry",
    avatarColor: "bg-pink-500",
    companyId: "blueroad-transport",
  },
  // Frontier Customs workers
  {
    id: "worker-frontier-1",
    name: "Батбаяр Энх",
    role: "Gate Operator",
    avatarColor: "bg-yellow-500",
    companyId: "frontier-customs",
  },
  {
    id: "worker-frontier-2",
    name: "Цэцэг Очир",
    role: "Supervisor",
    avatarColor: "bg-amber-500",
    companyId: "frontier-customs",
  },
  {
    id: "worker-frontier-3",
    name: "Ганбат Мөнх",
    role: "Customs Officer",
    avatarColor: "bg-lime-500",
    companyId: "frontier-customs",
  },
];

// Mock password map: companyId -> password
// All companies use the same password for simplicity
export const companyPasswords: Record<string, string> = {
  "altan-logistics": "password123",
  "steppe-mining": "password123",
  "blueroad-transport": "password123",
  "frontier-customs": "password123",
};

// Legacy: Keep worker passwords for backward compatibility (not used in new flow)
export const workerPasswords: Record<string, string> = {
  "worker-altan-1": "password123",
  "worker-altan-2": "password123",
  "worker-altan-3": "password123",
  "worker-steppe-1": "password123",
  "worker-steppe-2": "password123",
  "worker-steppe-3": "password123",
  "worker-blueroad-1": "password123",
  "worker-blueroad-2": "password123",
  "worker-blueroad-3": "password123",
  "worker-frontier-1": "password123",
  "worker-frontier-2": "password123",
  "worker-frontier-3": "password123",
};

