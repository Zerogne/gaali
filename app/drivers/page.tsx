"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { User, Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Driver } from "@/lib/types"
import { findSimilarValue } from "@/lib/utils/string-similarity"

export default function DriversPage() {
  const { toast } = useToast()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [driverData, setDriverData] = useState({
    name: "",
    phone: "",
    registrationNumber: "",
    additionalInfo: "",
  })
  const [isAdding, setIsAdding] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [driverToDelete, setDriverToDelete] = useState<string | null>(null)
  const [editingDriver, setEditingDriver] = useState<string | null>(null)
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [duplicateValue, setDuplicateValue] = useState<string | null>(null)

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

  const handleAddDriver = async () => {
    if (!driverData.name.trim()) {
      toast({
        title: "Алдаа",
        description: "Бүтэн нэр заавал оруулна",
        variant: "destructive",
      })
      return
    }

    if (editingDriver) {
      // Update existing driver
      // Check for similar/duplicate registration numbers (excluding current driver)
      if (driverData.registrationNumber.trim()) {
        const existingRegNumbers = drivers
          .filter(d => d.id !== editingDriver && d.registrationNumber)
          .map(d => d.registrationNumber!);
        const similarRegNumber = findSimilarValue(driverData.registrationNumber.trim(), existingRegNumbers);
        
        if (similarRegNumber) {
          setDuplicateValue(similarRegNumber);
          setDuplicateDialogOpen(true);
          return;
        }
      }

      setIsUpdating(true)
      try {
        const response = await fetch(`/api/drivers/${editingDriver}`, {
          method: "PUT",
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
          description: "Жолооч амжилттай засагдлаа",
        })

        setEditingDriver(null)
        setDriverData({
          name: "",
          phone: "",
          registrationNumber: "",
          additionalInfo: "",
        })

        // Dispatch custom event to refresh all sections
        window.dispatchEvent(new CustomEvent("refreshDropdownData"))

        // Reload drivers
        const reloadResponse = await fetch("/api/drivers")
        if (reloadResponse.ok) {
          const data = await reloadResponse.json()
          setDrivers(data)
        }
      } catch (error) {
        toast({
          title: "Алдаа",
          description: "Жолооч хадгалахад алдаа гарлаа",
          variant: "destructive",
        })
      } finally {
        setIsUpdating(false)
      }
      return
    }

    // Check for similar/duplicate registration numbers
    if (driverData.registrationNumber.trim()) {
      const existingRegNumbers = drivers
        .filter(d => d.registrationNumber)
        .map(d => d.registrationNumber!);
      const similarRegNumber = findSimilarValue(driverData.registrationNumber.trim(), existingRegNumbers);
      
      if (similarRegNumber) {
        setDuplicateValue(similarRegNumber);
        setDuplicateDialogOpen(true);
        return;
      }
    }

    setIsAdding(true)
    try {
      const response = await fetch("/api/drivers", {
        method: "POST",
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
        description: "Жолооч амжилттай нэмэгдлээ",
      })

      setDriverData({
        name: "",
        phone: "",
        registrationNumber: "",
        additionalInfo: "",
      })

      // Dispatch custom event to refresh all sections
      window.dispatchEvent(new CustomEvent("refreshDropdownData"))

      // Reload drivers
      const reloadResponse = await fetch("/api/drivers")
      if (reloadResponse.ok) {
        const data = await reloadResponse.json()
        setDrivers(data)
      }
    } catch (error) {
      toast({
        title: "Алдаа",
        description: "Жолооч хадгалахад алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleEditClick = (driver: Driver) => {
    setEditingDriver(driver.id)
    setDriverData({
      name: driver.name,
      phone: driver.phone || "",
      registrationNumber: driver.registrationNumber || "",
      additionalInfo: driver.additionalInfo || "",
    })
  }

  const handleCancelEdit = () => {
    setEditingDriver(null)
    setDriverData({
      name: "",
      phone: "",
      registrationNumber: "",
      additionalInfo: "",
    })
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
        const errorData = await response.json().catch(() => ({ error: "Failed to delete driver" }))
        throw new Error(errorData.error || "Failed to delete driver")
      }

      toast({
        title: "Амжилттай",
        description: "Жолооч амжилттай устгагдлаа",
      })

      // Dispatch custom event to refresh all sections
      window.dispatchEvent(new CustomEvent("refreshDropdownData"))

      // Reload drivers
      const reloadResponse = await fetch("/api/drivers")
      if (reloadResponse.ok) {
        const data = await reloadResponse.json()
        setDrivers(data)
      }
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
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <User className="w-5 h-5" />
                Жолооч
              </h2>
            </div>
            
            {/* Add/Edit Driver Form */}
            <div className="space-y-4 mb-6 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="driver-name">Бүтэн нэр *</Label>
                  <Input
                    id="driver-name"
                    value={driverData.name}
                    onChange={(e) =>
                      setDriverData({ ...driverData, name: e.target.value })
                    }
                    placeholder="Жолоочийн бүтэн нэр оруулах"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isAdding && !isUpdating && driverData.name.trim()) {
                        handleAddDriver()
                      }
                      if (e.key === "Escape" && editingDriver) {
                        handleCancelEdit()
                      }
                    }}
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
                  <Input
                    id="driver-additional-info"
                    value={driverData.additionalInfo}
                    onChange={(e) =>
                      setDriverData({ ...driverData, additionalInfo: e.target.value })
                    }
                    placeholder="Нэмэлт мэдээлэл оруулах"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {editingDriver ? (
                  <>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      disabled={isUpdating}
                    >
                      Цуцлах
                    </Button>
                    <Button
                      onClick={handleAddDriver}
                      disabled={isUpdating || !driverData.name.trim()}
                      className="gap-2"
                    >
                      {isUpdating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Edit className="w-4 h-4" />
                      )}
                      Засах
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleAddDriver}
                    disabled={isAdding || !driverData.name.trim()}
                    className="gap-2"
                  >
                    {isAdding ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Нэмэх
                  </Button>
                )}
              </div>
            </div>

            {drivers.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Бүтэн нэр</TableHead>
                      <TableHead>Утасны дугаар</TableHead>
                      <TableHead>Нэмэлт мэдээлэл</TableHead>
                      <TableHead className="w-[120px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drivers.map((driver) => (
                      <TableRow key={driver.id}>
                        <TableCell className="font-medium">{driver.name}</TableCell>
                        <TableCell>{driver.phone || "-"}</TableCell>
                        <TableCell>{driver.additionalInfo || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(driver)}
                              disabled={isDeleting === driver.id || editingDriver === driver.id}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(driver.id)}
                              disabled={isDeleting === driver.id || editingDriver === driver.id}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {isDeleting === driver.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Жолооч байхгүй байна. Дээрх талбарт мэдээлэл оруулаад нэмнэ үү.
              </p>
            )}
          </Card>

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

          <AlertDialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Давхардсан бүртгэлийн дугаар</AlertDialogTitle>
                <AlertDialogDescription>
                  Ижил бүртгэлийн дугаартай жолооч аль хэдийн байна: <strong>"{duplicateValue}"</strong>. Өөр бүртгэлийн дугаар ашиглана уу.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => setDuplicateDialogOpen(false)}>
                  OK
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </div>
  )
}
