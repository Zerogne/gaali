"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Driver } from "@/lib/types"

interface DriverManagerProps {
  drivers: Driver[]
  onDriverAdded: () => void
  onDriverUpdated: () => void
}

export function DriverManager({
  drivers,
  onDriverAdded,
  onDriverUpdated,
}: DriverManagerProps) {
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [driverData, setDriverData] = useState({
    name: "",
    licenseNumber: "",
    licenseExpiry: "",
    registrationNumber: "",
    registrationYear: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleAdd = () => {
    setEditingDriver(null)
    setDriverData({
      name: "",
      licenseNumber: "",
      licenseExpiry: "",
      registrationNumber: "",
      registrationYear: "",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver)
    setDriverData({
      name: driver.name,
      licenseNumber: driver.licenseNumber || "",
      licenseExpiry: driver.licenseExpiry || "",
      registrationNumber: driver.registrationNumber || "",
      registrationYear: driver.registrationYear || "",
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!driverData.name.trim()) {
      toast({
        title: "Error",
        description: "Driver name is required",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const url = editingDriver
        ? `/api/drivers/${editingDriver.id}`
        : "/api/drivers"
      const method = editingDriver ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: driverData.name.trim(),
          licenseNumber: driverData.licenseNumber.trim() || undefined,
          licenseExpiry: driverData.licenseExpiry.trim() || undefined,
          registrationNumber: driverData.registrationNumber.trim() || undefined,
          registrationYear: driverData.registrationYear.trim() || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save driver")
      }

      toast({
        title: "Success",
        description: editingDriver
          ? "Driver updated successfully"
          : "Driver added successfully",
      })

      setIsDialogOpen(false)
      setEditingDriver(null)

      if (editingDriver) {
        onDriverUpdated()
      } else {
        onDriverAdded()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save driver",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handleAdd}
        className="gap-1.5 flex-shrink-0 h-10"
      >
        <Plus className="w-3.5 h-3.5" />
        Нэмэх
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingDriver ? "Edit Driver" : "Add New Driver"}
            </DialogTitle>
            <DialogDescription>
              {editingDriver
                ? "Update the driver information below."
                : "Enter driver information."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="driver-name">Driver Name *</Label>
              <Input
                id="driver-name"
                value={driverData.name}
                onChange={(e) =>
                  setDriverData({ ...driverData, name: e.target.value })
                }
                placeholder="Enter driver name"
                autoFocus
                required
              />
            </div>

            <div>
              <Label htmlFor="license-number">License Number</Label>
              <Input
                id="license-number"
                value={driverData.licenseNumber}
                onChange={(e) =>
                  setDriverData({ ...driverData, licenseNumber: e.target.value })
                }
                placeholder="Enter license number"
              />
            </div>

            <div>
              <Label htmlFor="license-expiry">License Expiry</Label>
              <Input
                id="license-expiry"
                type="date"
                value={driverData.licenseExpiry}
                onChange={(e) =>
                  setDriverData({ ...driverData, licenseExpiry: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reg-number">
                  Тээврийн хэрэгслийн улсын дугаар
                </Label>
                <Input
                  id="reg-number"
                  value={driverData.registrationNumber}
                  onChange={(e) =>
                    setDriverData({
                      ...driverData,
                      registrationNumber: e.target.value,
                    })
                  }
                  placeholder="Улсын дугаар"
                />
              </div>
              <div>
                <Label htmlFor="reg-year">Тээврийн хэрэгслийн жил</Label>
                <Input
                  id="reg-year"
                  type="number"
                  value={driverData.registrationYear}
                  onChange={(e) =>
                    setDriverData({
                      ...driverData,
                      registrationYear: e.target.value,
                    })
                  }
                  placeholder="Жил"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : editingDriver ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

