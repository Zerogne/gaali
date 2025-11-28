"use client"

import { useState, useEffect } from "react"
import { Bell, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { handleLogout } from "@/lib/auth/logoutClient"

interface UserInfo {
  name: string
  role: string
}

export function TopBar() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadUserInfo() {
      try {
        const response = await fetch("/api/user")
        if (response.ok) {
          const data = await response.json()
          setUserInfo(data)
        }
      } catch (error) {
        console.error("Error loading user info:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserInfo()
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
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 lg:px-8 sticky top-0 z-50">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search by plate number, driver, or cargo..."
            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-gray-100 transition-colors"
        >
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="gap-2 px-2 hover:bg-gray-100 transition-colors"
            >
              <Avatar className="w-8 h-8 ring-2 ring-blue-100">
                <AvatarFallback className="bg-blue-600 text-white text-sm font-semibold">
                  {isLoading ? "..." : initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden md:block">
                <p className="text-sm font-semibold text-gray-900">
                  {isLoading ? "Loading..." : displayName}
                </p>
                <p className="text-xs text-gray-500">
                  {isLoading ? "..." : displayRole}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={handleLogoutClick}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

