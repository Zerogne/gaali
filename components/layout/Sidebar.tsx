"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { handleLogout } from "@/lib/auth/logoutClient";
import { cn } from "@/lib/utils";
import {
  Building2,
  History,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Truck,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const menuItems = [
  { icon: LayoutDashboard, label: "Хяналтын самбар", href: "/" },
  { icon: History, label: "Бүртгэлийн түүх", href: "/history" },
  { icon: Package, label: "Бүтээгдэхүүн", href: "/products" },
  { icon: Truck, label: "Тээврийн компани", href: "/companies" },
  { icon: User, label: "Жолооч", href: "/drivers" },
  { icon: Building2, label: "Байгууллага", href: "/organizations" },
  { icon: Settings, label: "Тохиргоо", href: "/settings" },
];

interface UserInfo {
  name: string;
  role: string;
  companyName?: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const [companyName, setCompanyName] = useState<string>("XP Agency");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/api/user");
        if (response.ok) {
          const data: UserInfo = await response.json();
          setUserInfo(data);
          if (data.companyName) {
            setCompanyName(data.companyName);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const handleLogoutClick = async () => {
    await handleLogout();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = userInfo?.name || "Хэрэглэгч";
  const displayRole = userInfo?.role || "Ажилтан";
  const initials = userInfo ? getInitials(userInfo.name) : "Х";

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {isLoading ? "Уншиж байна..." : companyName}
            </h1>
            <p className="text-xs text-gray-500">Логистик платформ</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                    isActive
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Profile section at bottom */}
      <div className="p-4 border-t border-gray-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-gray-100 text-left">
              <Avatar className="w-8 h-8 ring-2 ring-blue-100">
                <AvatarFallback className="bg-blue-600 text-white text-sm font-semibold">
                  {isLoading ? "..." : initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {isLoading ? "Уншиж байна..." : displayName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {isLoading ? "..." : displayRole}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white">
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={handleLogoutClick}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Гарах
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
