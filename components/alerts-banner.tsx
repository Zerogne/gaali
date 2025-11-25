"use client"

import { AlertCircle, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function AlertsBanner() {
  const [showAlert, setShowAlert] = useState(true)

  if (!showAlert) return null

  return (
    <div className={cn("px-6 py-3 bg-warning/10 border-b border-warning/20 flex items-center justify-between")}>
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-warning" />
        <div>
          <p className="text-sm font-medium text-warning">Unrecognized Plate Detected</p>
          <p className="text-xs text-warning/80">
            Vehicle "Б9999ЗЗ" could not be verified in customs database - Manual review required
          </p>
        </div>
      </div>
      <button onClick={() => setShowAlert(false)} className="text-warning hover:text-warning/80 transition-colors">
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}
