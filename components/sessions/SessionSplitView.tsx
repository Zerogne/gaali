"use client"

import { useState, useEffect, useRef } from "react"
import { CameraPanel } from "./CameraPanel"
import { SessionFormPanel } from "./SessionFormPanel"

/**
 * Mock plate feed hook
 * TODO: Replace with real camera API integration
 * This simulates receiving LPR JSON events from the camera service
 */
function usePlateFeed() {
  const [lastPlate, setLastPlate] = useState<string | null>(null)
  const [lastPayload, setLastPayload] = useState<any>(null)
  const [status, setStatus] = useState<"idle" | "polling" | "error">("polling")

  useEffect(() => {
    // TODO: Replace this mock with real fetch/WebSocket
    // Example: fetch("/api/camera/events") or WebSocket connection
    const interval = setInterval(() => {
      // Simulate receiving plate data every 2-5 seconds
      const mockPlates = ["ABC1234", "XYZ5678", "DEF9012", null]
      const randomPlate = mockPlates[Math.floor(Math.random() * mockPlates.length)]
      
      if (randomPlate) {
        setLastPlate(randomPlate)
        setLastPayload({
          plate: randomPlate,
          confidence: Math.floor(Math.random() * 30) + 70,
          timestamp: new Date().toISOString(),
        })
        setStatus("polling")
      } else {
        setStatus("idle")
      }
    }, 2000 + Math.random() * 3000)

    return () => clearInterval(interval)
  }, [])

  return { lastPlate, lastPayload, status }
}

export function SessionSplitView() {
  const { lastPlate, lastPayload, status } = usePlateFeed()
  const [plateTouched, setPlateTouched] = useState(false)
  const [currentPlate, setCurrentPlate] = useState<string>("")

  // Track if user manually edited the plate field
  const handlePlateChange = (value: string) => {
    setCurrentPlate(value)
    // If user types something different from the auto-filled plate, mark as touched
    if (value && value !== lastPlate) {
      setPlateTouched(true)
    } else if (value === lastPlate) {
      // If it matches the auto-filled plate, reset touched state
      setPlateTouched(false)
    }
  }

  // Reset touched state when new plate comes from camera and field is empty
  useEffect(() => {
    if (lastPlate && !currentPlate) {
      setPlateTouched(false)
    }
  }, [lastPlate, currentPlate])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 h-screen overflow-hidden">
      {/* Left: Camera Panel */}
      <div className="h-screen overflow-hidden">
        <CameraPanel
          streamUrl={undefined} // TODO: Configure actual camera stream URL
          lastPlate={lastPlate}
          lastPayload={lastPayload}
          status={status}
          onRefresh={() => {
            // TODO: Trigger camera refresh
            console.log("Refresh camera")
          }}
        />
      </div>

      {/* Right: Session Form Panel */}
      <div className="h-screen overflow-hidden">
        <SessionFormPanel
          autoFillPlate={lastPlate}
          plateTouched={plateTouched}
          onPlateChange={handlePlateChange}
        />
      </div>
    </div>
  )
}
