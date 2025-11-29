"use client"

import { useState, useEffect } from "react"
import { Truck } from "lucide-react"
import { cn } from "@/lib/utils"

interface UserInfo {
  name: string
  role: string
  companyName?: string
}

export function Sidebar() {
  const [companyName, setCompanyName] = useState<string>("XP Agency")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadCompanyName() {
      try {
        const response = await fetch("/api/user")
        if (response.ok) {
          const data: UserInfo = await response.json()
          if (data.companyName) {
            setCompanyName(data.companyName)
          }
        }
      } catch (error) {
        console.error("Error loading company name:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCompanyName()
  }, [])

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {isLoading ? "Loading..." : companyName}
            </h1>
            <p className="text-xs text-gray-500">Logistics Platform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <a
              href="#"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                "bg-blue-50 text-blue-700 font-medium"
              )}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  )
}

