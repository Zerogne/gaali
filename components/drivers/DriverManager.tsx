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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
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
    phone: "",
    registrationNumber: "",
    additionalInfo: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [driverToDelete, setDriverToDelete] = useState<string | null>(null)

  const handleAdd = () => {
    setEditingDriver(null)
    setDriverData({
      name: "",
      phone: "",
      registrationNumber: "",
      additionalInfo: "",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver)
    setDriverData({
      name: driver.name,
      phone: driver.phone || "",
      registrationNumber: driver.registrationNumber || "",
      additionalInfo: driver.additionalInfo || "",
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!driverData.name.trim()) {
      toast({
        title: "Алдаа",
        description: "Бүтэн нэр заавал оруулна",
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
          phone: driverData.phone.trim() || undefined,
          registrationNumber: driverData.registrationNumber.trim() || undefined,
          additionalInfo: driverData.additionalInfo.trim() || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save driver")
      }

      toast({
        title: "Амжилттай",
        description: editingDriver
          ? "Жолооч амжилттай засагдлаа"
          : "Жолооч амжилттай нэмэгдлээ",
      })

      setIsDialogOpen(false)
      setEditingDriver(null)

      // Dispatch custom event to refresh all sections
      window.dispatchEvent(new CustomEvent("refreshDropdownData"))

      if (editingDriver) {
        onDriverUpdated()
      } else {
        onDriverAdded()
      }
    } catch (error) {
      toast({
        title: "Алдаа",
        description: "Жолооч хадгалахад алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = (driverId: string) => {
    setDriverToDelete(driverId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!driverToDelete) return

    setIsDeleting(driverToDelete)
    setDeleteDialogOpen(false)
    try {
      const response = await fetch(`/api/drivers/${driverToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete driver")
      }

      toast({
        title: "Амжилттай",
        description: "Жолооч амжилттай устгагдлаа",
      })

      // Dispatch custom event to refresh all sections
      window.dispatchEvent(new CustomEvent("refreshDropdownData"))

      onDriverUpdated()
    } catch (error) {
      toast({
        title: "Алдаа",
        description: "Жолооч устгахад алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
      setDriverToDelete(null)
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
              {editingDriver ? "Жолооч засах" : "Жолооч нэмэх"}
            </DialogTitle>
            <DialogDescription>
              {editingDriver
                ? "Жолоочийн мэдээллийг засах."
                : "Жолоочийн мэдээлэл оруулах."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="driver-name">Бүтэн нэр *</Label>
              <Input
                id="driver-name"
                value={driverData.name}
                onChange={(e) =>
                  setDriverData({ ...driverData, name: e.target.value })
                }
                placeholder="Жолоочийн бүтэн нэр оруулах"
                autoFocus
                required
              />
            </div>

            <div>
              <Label htmlFor="driver-phone">Утасны дугаар</Label>
              <Input
                id="driver-phone"
                type="tel"
                value={driverData.phone}
                onChange={(e) =>
                  setDriverData({ ...driverData, phone: e.target.value })
                }
                placeholder="Утасны дугаар оруулах"
              />
            </div>

            <div>
              <Label htmlFor="driver-registration-number">Регистэрийн дугаар</Label>
              <Input
                id="driver-registration-number"
                value={driverData.registrationNumber}
                onChange={(e) =>
                  setDriverData({ ...driverData, registrationNumber: e.target.value })
                }
                placeholder="Регистэрийн дугаар оруулах"
              />
            </div>

            <div>
              <Label htmlFor="driver-additional-info">Нэмэлт мэдээлэл</Label>
              <Textarea
                id="driver-additional-info"
                value={driverData.additionalInfo}
                onChange={(e) =>
                  setDriverData({ ...driverData, additionalInfo: e.target.value })
                }
                placeholder="Нэмэлт мэдээлэл оруулах"
                rows={3}
              />
            </div>

            {drivers.length > 0 && (
              <div>
                <Label className="mb-2 block">Одоогийн жолооч нар</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {drivers.map((driver) => (
                    <div
                      key={driver.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                    >
                      <div className="flex-1">
                        <span className="text-sm text-gray-700 font-medium">{driver.name}</span>
                        {driver.phone && (
                          <span className="text-xs text-gray-500 ml-2">({driver.phone})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(driver)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(driver.id)}
                          disabled={isDeleting === driver.id}
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                        >
                          {isDeleting === driver.id ? (
                            <span className="text-xs">...</span>
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSaving}
            >
              Цуцлах
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Хадгалж байна..." : editingDriver ? "Засах" : "Нэмэх"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Жолооч устгах</AlertDialogTitle>
            <AlertDialogDescription>
              Та энэ жолоочийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Цуцлах</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Устгах
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
