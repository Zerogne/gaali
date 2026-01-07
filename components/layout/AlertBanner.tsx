"use client"

import { AlertCircle, X } from "lucide-react"
import { useState } from "react"

export function AlertBanner() {
  const [showAlert, setShowAlert] = useState(true)

  if (!showAlert) return null

  return (
    <div className="px-6 py-3 bg-orange-50 border-b border-orange-200 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-orange-600" />
        <div>
          <p className="text-sm font-medium text-orange-900">Танигдаагүй улсын дугаар илрүүлсэн</p>
          <p className="text-xs text-orange-700">
            Тээврийн хэрэгсэл "Б9999ЗЗ" гаалийн мэдээллийн санд баталгаажуулах боломжгүй - Гараар шалгах шаардлагатай
          </p>
        </div>
      </div>
      <button 
        onClick={() => setShowAlert(false)} 
        className="text-orange-600 hover:text-orange-800 transition-colors p-1"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}
