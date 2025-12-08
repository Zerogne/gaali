"use client"

import { ScaleDebugPanel } from "@/components/scale/ScaleDebugPanel"

export default function ScaleDebugPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">ScaleServiceApp Bridge Debug</h1>
      <p className="text-sm text-gray-600">
        Make sure ScaleServiceApp is running (server started), then try requesting data.
      </p>
      <ScaleDebugPanel />
    </div>
  )
}

