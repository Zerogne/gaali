"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { OrganizationManager } from "@/components/organizations/OrganizationManager"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Building2 } from "lucide-react"
import type { Organization } from "@/lib/types"

export default function OrganizationsPage() {
  const [senderOrganizations, setSenderOrganizations] = useState<Organization[]>([])
  const [receiverOrganizations, setReceiverOrganizations] = useState<Organization[]>([])

  useEffect(() => {
    async function loadOrganizations() {
      // Load sender organizations
      try {
        const response = await fetch("/api/organizations?type=sender")
        if (response.ok) {
          const data = await response.json()
          setSenderOrganizations(data)
        }
      } catch (error) {
        console.error("Error loading sender organizations:", error)
      }

      // Load receiver organizations
      try {
        const response = await fetch("/api/organizations?type=receiver")
        if (response.ok) {
          const data = await response.json()
          setReceiverOrganizations(data)
        }
      } catch (error) {
        console.error("Error loading receiver organizations:", error)
      }
    }
    loadOrganizations()

    // Listen for refresh events
    const handleRefresh = () => {
      loadOrganizations()
    }
    window.addEventListener("refreshDropdownData", handleRefresh)
    return () => {
      window.removeEventListener("refreshDropdownData", handleRefresh)
    }
  }, [])

  const handleSenderOrganizationAdded = () => {
    fetch("/api/organizations?type=sender")
      .then((res) => res.json())
      .then((data) => setSenderOrganizations(data))
      .catch(console.error)
  }

  const handleReceiverOrganizationAdded = () => {
    fetch("/api/organizations?type=receiver")
      .then((res) => res.json())
      .then((data) => setReceiverOrganizations(data))
      .catch(console.error)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Байгууллага</h1>
            <p className="text-muted-foreground">Байгууллагуудыг удирдах</p>
          </div>
          
          {/* Sender Organizations */}
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Илгээч байгууллага
              </h2>
              <OrganizationManager
                organizations={senderOrganizations}
                type="sender"
                onOrganizationAdded={handleSenderOrganizationAdded}
                onOrganizationUpdated={handleSenderOrganizationAdded}
              />
            </div>
            {senderOrganizations.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Нэр</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {senderOrganizations.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell className="font-medium">{org.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Илгээч байгууллага байхгүй байна. Нэмэх товч дараад нэмнэ үү.
              </p>
            )}
          </Card>

          {/* Receiver Organizations */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Хүлээн авагч байгууллага
              </h2>
              <OrganizationManager
                organizations={receiverOrganizations}
                type="receiver"
                onOrganizationAdded={handleReceiverOrganizationAdded}
                onOrganizationUpdated={handleReceiverOrganizationAdded}
              />
            </div>
            {receiverOrganizations.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Нэр</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receiverOrganizations.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell className="font-medium">{org.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Хүлээн авагч байгууллага байхгүй байна. Нэмэх товч дараад нэмнэ үү.
              </p>
            )}
          </Card>
        </main>
      </div>
    </div>
  )
}

