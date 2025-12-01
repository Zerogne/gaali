"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { TransportCompanyManager } from "@/components/transport/TransportCompanyManager"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Truck } from "lucide-react"
import type { TransportCompany } from "@/lib/types"

export default function CompaniesPage() {
  const [transportCompanies, setTransportCompanies] = useState<TransportCompany[]>([])

  useEffect(() => {
    async function loadCompanies() {
      try {
        const response = await fetch("/api/transport-companies")
        if (response.ok) {
          const data = await response.json()
          setTransportCompanies(data)
        }
      } catch (error) {
        console.error("Error loading transport companies:", error)
      }
    }
    loadCompanies()

    // Listen for refresh events
    const handleRefresh = () => {
      loadCompanies()
    }
    window.addEventListener("refreshDropdownData", handleRefresh)
    return () => {
      window.removeEventListener("refreshDropdownData", handleRefresh)
    }
  }, [])

  const handleCompanyAdded = () => {
    fetch("/api/transport-companies")
      .then((res) => res.json())
      .then((data) => setTransportCompanies(data))
      .catch(console.error)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Тээврийн компани</h1>
            <p className="text-muted-foreground">Тээврийн компаниудыг удирдах</p>
          </div>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Тээврийн компани
              </h2>
              <TransportCompanyManager 
                companies={transportCompanies} 
                onCompanyAdded={handleCompanyAdded}
                onCompanyUpdated={handleCompanyAdded}
              />
            </div>
            {transportCompanies.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Нэр</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transportCompanies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Тээврийн компани байхгүй байна. Нэмэх товч дараад нэмнэ үү.
              </p>
            )}
          </Card>
        </main>
      </div>
    </div>
  )
}

