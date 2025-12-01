"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { DriverManager } from "@/components/drivers/DriverManager"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { User } from "lucide-react"
import type { Driver } from "@/lib/types"

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])

  useEffect(() => {
    async function loadDrivers() {
      try {
        const response = await fetch("/api/drivers")
        if (response.ok) {
          const data = await response.json()
          setDrivers(data)
        }
      } catch (error) {
        console.error("Error loading drivers:", error)
      }
    }
    loadDrivers()

    // Listen for refresh events
    const handleRefresh = () => {
      loadDrivers()
    }
    window.addEventListener("refreshDropdownData", handleRefresh)
    return () => {
      window.removeEventListener("refreshDropdownData", handleRefresh)
    }
  }, [])

  const handleDriverAdded = () => {
    fetch("/api/drivers")
      .then((res) => res.json())
      .then((data) => setDrivers(data))
      .catch(console.error)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Жолооч</h1>
            <p className="text-muted-foreground">Жолоочдын мэдээллийг удирдах</p>
          </div>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <User className="w-5 h-5" />
                Жолооч
              </h2>
              <DriverManager 
                drivers={drivers} 
                onDriverAdded={handleDriverAdded} 
                onDriverUpdated={handleDriverAdded} 
              />
            </div>
            {drivers.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Бүтэн нэр</TableHead>
                      <TableHead>Утасны дугаар</TableHead>
                      <TableHead>Нэмэлт мэдээлэл</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drivers.map((driver) => (
                      <TableRow key={driver.id}>
                        <TableCell className="font-medium">{driver.name}</TableCell>
                        <TableCell>{driver.phone || "-"}</TableCell>
                        <TableCell>{driver.additionalInfo || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Жолооч байхгүй байна. Нэмэх товч дараад нэмнэ үү.
              </p>
            )}
          </Card>
        </main>
      </div>
    </div>
  )
}

