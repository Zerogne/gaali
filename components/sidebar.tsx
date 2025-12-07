"use client"

import { useState, useEffect } from "react"
import { Truck, Settings, LayoutDashboard, LogOut, User, Package, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { handleLogout } from "@/lib/auth/logoutClient"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Package, label: "Бүтээгдэхүүн", href: "/products" },
  { icon: Truck, label: "Тээврийн компани", href: "/companies" },
  { icon: User, label: "Жолооч", href: "/drivers" },
  { icon: Building2, label: "Байгууллага", href: "/organizations" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

interface UserInfo {
  name: string
  role: string
  companyName?: string
}

export function Sidebar() {
  const pathname = usePathname()
  const [companyName, setCompanyName] = useState<string>("XP Agency")
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/api/user")
        if (response.ok) {
          const data: UserInfo = await response.json()
          setUserInfo(data)
          if (data.companyName) {
            setCompanyName(data.companyName)
          }
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleLogoutClick = async () => {
    await handleLogout()
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const displayName = userInfo?.name || "User"
  const displayRole = userInfo?.role || "Worker"
  const initials = userInfo ? getInitials(userInfo.name) : "U"

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Truck className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">
              {isLoading ? "Loading..." : companyName}
            </h1>
            <p className="text-xs text-sidebar-foreground/60">Logistics Platform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Profile section at bottom */}
      <div className="p-4 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-sidebar-accent/50 text-left">
              <Avatar className="w-8 h-8 ring-2 ring-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  {isLoading ? "..." : initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">
                  {isLoading ? "Loading..." : displayName}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {isLoading ? "..." : displayRole}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem 
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={handleLogoutClick}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
