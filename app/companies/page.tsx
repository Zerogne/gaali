"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Truck, Plus, Trash2, Loader2, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { TransportCompany } from "@/lib/types"
import { findSimilarValue } from "@/lib/utils/string-similarity"

export default function CompaniesPage() {
  const { toast } = useToast()
  const [transportCompanies, setTransportCompanies] = useState<TransportCompany[]>([])
  const [newCompanyName, setNewCompanyName] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null)
  const [editingCompany, setEditingCompany] = useState<string | null>(null)
  const [editingCompanyName, setEditingCompanyName] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [duplicateValue, setDuplicateValue] = useState<string | null>(null)

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

  const handleAddCompany = async () => {
    if (!newCompanyName.trim()) {
      toast({
        title: "Error",
        description: "Company name is required",
        variant: "destructive",
      })
      return
    }

    // Check for similar/duplicate companies
    const existingNames = transportCompanies.map(c => c.name)
    const similarCompany = findSimilarValue(newCompanyName.trim(), existingNames)
    
    if (similarCompany) {
      setDuplicateValue(similarCompany)
      setDuplicateDialogOpen(true)
      return
    }

    setIsAdding(true)
    try {
      const response = await fetch("/api/transport-companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newCompanyName.trim() }),
      })

      if (!response.ok) {
        throw new Error("Failed to save transport company")
      }

      toast({
        title: "Success",
        description: "Transport company added successfully",
      })

      setNewCompanyName("")

      // Dispatch custom event to refresh all sections
      window.dispatchEvent(new CustomEvent("refreshDropdownData"))

      // Reload companies
      const reloadResponse = await fetch("/api/transport-companies")
      if (reloadResponse.ok) {
        const data = await reloadResponse.json()
        setTransportCompanies(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save transport company",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleEditClick = (company: TransportCompany) => {
    setEditingCompany(company.id)
    setEditingCompanyName(company.name)
  }

  const handleCancelEdit = () => {
    setEditingCompany(null)
    setEditingCompanyName("")
  }

  const handleSaveEdit = async (companyId: string) => {
    if (!editingCompanyName.trim()) {
      toast({
        title: "Error",
        description: "Company name is required",
        variant: "destructive",
      })
      return
    }

    // Check for similar/duplicate companies (excluding current company)
    const existingNames = transportCompanies
      .filter(c => c.id !== companyId)
      .map(c => c.name)
    const similarCompany = findSimilarValue(editingCompanyName.trim(), existingNames)
    
    if (similarCompany) {
      setDuplicateValue(similarCompany)
      setDuplicateDialogOpen(true)
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/transport-companies/${companyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editingCompanyName.trim() }),
      })

      if (!response.ok) {
        throw new Error("Failed to update transport company")
      }

      toast({
        title: "Success",
        description: "Transport company updated successfully",
      })

      setEditingCompany(null)
      setEditingCompanyName("")

      // Dispatch custom event to refresh all sections
      window.dispatchEvent(new CustomEvent("refreshDropdownData"))

      // Reload companies
      const reloadResponse = await fetch("/api/transport-companies")
      if (reloadResponse.ok) {
        const data = await reloadResponse.json()
        setTransportCompanies(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update transport company",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteClick = (companyId: string) => {
    setCompanyToDelete(companyId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!companyToDelete) return

    setIsDeleting(companyToDelete)
    setDeleteDialogOpen(false)
    try {
      const response = await fetch(`/api/transport-companies/${companyToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to delete transport company" }))
        throw new Error(errorData.error || "Failed to delete transport company")
      }

      toast({
        title: "Success",
        description: "Transport company deleted successfully",
      })

      // Dispatch custom event to refresh all sections
      window.dispatchEvent(new CustomEvent("refreshDropdownData"))

      // Reload companies
      const reloadResponse = await fetch("/api/transport-companies")
      if (reloadResponse.ok) {
        const data = await reloadResponse.json()
        setTransportCompanies(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete transport company",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
      setCompanyToDelete(null)
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
                <Truck className="w-5 h-5" />
                Тээврийн компани
              </h2>
            </div>
            
            {/* Add Company Input */}
            <div className="flex gap-2 mb-6">
              <Input
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="Тээврийн компанийн нэр оруулах"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isAdding && newCompanyName.trim()) {
                    handleAddCompany()
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={handleAddCompany}
                disabled={isAdding || !newCompanyName.trim()}
                className="gap-2"
              >
                {isAdding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Нэмэх
              </Button>
            </div>

            {transportCompanies.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Нэр</TableHead>
                      <TableHead className="w-[120px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transportCompanies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">
                          {editingCompany === company.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingCompanyName}
                                onChange={(e) => setEditingCompanyName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && editingCompanyName.trim()) {
                                    handleSaveEdit(company.id)
                                  }
                                  if (e.key === "Escape") {
                                    handleCancelEdit()
                                  }
                                }}
                                className="flex-1"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSaveEdit(company.id)}
                                disabled={isUpdating || !editingCompanyName.trim()}
                                className="h-8"
                              >
                                {isUpdating ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  "Хадгалах"
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                                disabled={isUpdating}
                                className="h-8"
                              >
                                Цуцлах
                              </Button>
                            </div>
                          ) : (
                            company.name
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {editingCompany !== company.id && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditClick(company)}
                                  disabled={isDeleting === company.id}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(company.id)}
                                  disabled={isDeleting === company.id}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  {isDeleting === company.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Тээврийн компани байхгүй байна. Дээрх талбарт нэр оруулаад нэмнэ үү.
              </p>
            )}
          </Card>

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Тээврийн компани устгах</AlertDialogTitle>
                <AlertDialogDescription>
                  Та энэ тээврийн компанийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
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
                <AlertDialogTitle>Давхардсан тээврийн компани</AlertDialogTitle>
                <AlertDialogDescription>
                  Ижил төстэй тээврийн компани аль хэдийн байна: <strong>"{duplicateValue}"</strong>. Өөр нэр ашиглана уу.
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
