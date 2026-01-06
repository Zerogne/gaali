"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Truck, Plus, Trash2, Loader2, Edit, Search, X } from "lucide-react"
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
  const [searchQuery, setSearchQuery] = useState("")
  const [addDialogOpen, setAddDialogOpen] = useState(false)

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
      setAddDialogOpen(false)

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
    setAddDialogOpen(true)
  }

  const handleCancelEdit = () => {
    setEditingCompany(null)
    setEditingCompanyName("")
    setAddDialogOpen(false)
  }

  // Filter companies based on search query
  const filteredCompanies = transportCompanies.filter((company) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      company.name.toLowerCase().includes(query) ||
      company.id.toLowerCase().includes(query)
    )
  })

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
      setAddDialogOpen(false)

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
            
            {/* Search Section */}
            <div className="flex items-center gap-2 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Нэр, ID-аар хайх..."
                  className="pl-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button
                onClick={() => {
                  setEditingCompany(null)
                  setEditingCompanyName("")
                  setNewCompanyName("")
                  setAddDialogOpen(true)
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Нэмэх
              </Button>
            </div>

            {filteredCompanies.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Нэр</TableHead>
                      <TableHead className="w-[120px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompanies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">
                          {company.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
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
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                {searchQuery ? "Хайлтын үр дүн олдсонгүй" : "Тээврийн компани байхгүй байна. Дээрх 'Нэмэх' товч дараад нэмнэ үү."}
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

          {/* Add/Edit Company Dialog */}
          <Dialog open={addDialogOpen || !!editingCompany} onOpenChange={(open) => {
            if (!open) {
              setAddDialogOpen(false)
              handleCancelEdit()
            }
          }}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingCompany ? "Тээврийн компани засах" : "Шинэ тээврийн компани нэмэх"}
                </DialogTitle>
                <DialogDescription>
                  {editingCompany ? "Тээврийн компанийн нэрийг засах" : "Шинэ тээврийн компанийн нэр оруулах"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="dialog-company-name">Нэр *</Label>
                  <Input
                    id="dialog-company-name"
                    value={editingCompany ? editingCompanyName : newCompanyName}
                    onChange={(e) => {
                      if (editingCompany) {
                        setEditingCompanyName(e.target.value)
                      } else {
                        setNewCompanyName(e.target.value)
                      }
                    }}
                    placeholder="Тээврийн компанийн нэр оруулах"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (editingCompany ? editingCompanyName : newCompanyName).trim()) {
                        if (editingCompany) {
                          handleSaveEdit(editingCompany)
                        } else {
                          handleAddCompany()
                        }
                      }
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAddDialogOpen(false)
                    handleCancelEdit()
                  }}
                  disabled={isUpdating || isAdding}
                >
                  Цуцлах
                </Button>
                <Button
                  onClick={() => {
                    if (editingCompany) {
                      handleSaveEdit(editingCompany)
                    } else {
                      handleAddCompany()
                    }
                  }}
                  disabled={isUpdating || isAdding || !(editingCompany ? editingCompanyName : newCompanyName).trim()}
                  className="gap-2"
                >
                  {isUpdating || isAdding ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {editingCompany ? "Хадгалж байна..." : "Нэмж байна..."}
                    </>
                  ) : (
                    <>
                      {editingCompany ? (
                        <>
                          <Edit className="w-4 h-4" />
                          Засах
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Нэмэх
                        </>
                      )}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  )
}
