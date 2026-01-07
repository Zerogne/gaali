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
  const [newCompanyId, setNewCompanyId] = useState("")
  const [newContract, setNewContract] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null)
  const [editingCompany, setEditingCompany] = useState<string | null>(null)
  const [editingCompanyName, setEditingCompanyName] = useState("")
  const [editingCompanyId, setEditingCompanyId] = useState("")
  const [editingContract, setEditingContract] = useState("")
  const [editingPhone, setEditingPhone] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [duplicateValue, setDuplicateValue] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [infoDialogOpen, setInfoDialogOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<TransportCompany | null>(null)

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
        title: "Алдаа",
        description: "Нэр шаардлагатай",
        variant: "destructive",
      })
      return
    }

    if (!newCompanyId.trim()) {
      toast({
        title: "Алдаа",
        description: "Регистер шаардлагатай",
        variant: "destructive",
      })
      return
    }

    if (!newContract.trim()) {
      toast({
        title: "Алдаа",
        description: "Гадаад худалдааны гэрээ шаардлагатай",
        variant: "destructive",
      })
      return
    }

    if (!newPhone.trim()) {
      toast({
        title: "Алдаа",
        description: "Утасны дугаар шаардлагатай",
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
        body: JSON.stringify({ 
          name: newCompanyName.trim(),
          companyId: newCompanyId.trim(),
          contract: newContract.trim(),
          phone: newPhone.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to save transport company" }))
        throw new Error(errorData.error || "Failed to save transport company")
      }

      toast({
        title: "Амжилттай",
        description: "Тээврийн компани амжилттай нэмэгдлээ",
      })

      setNewCompanyName("")
      setNewCompanyId("")
      setNewContract("")
      setNewPhone("")
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
        title: "Алдаа",
        description: error instanceof Error ? error.message : "Тээврийн компани хадгалахад алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleEditClick = (company: TransportCompany) => {
    setEditingCompany(company.id)
    setEditingCompanyName(company.name)
    setEditingCompanyId(company.companyId || "")
    setEditingContract(company.contract || "")
    setEditingPhone(company.phone || "")
    setAddDialogOpen(true)
  }

  const handleCancelEdit = () => {
    setEditingCompany(null)
    setEditingCompanyName("")
    setEditingCompanyId("")
    setEditingContract("")
    setEditingPhone("")
    setAddDialogOpen(false)
  }

  const handleDoubleClick = (company: TransportCompany) => {
    setSelectedCompany(company)
    setInfoDialogOpen(true)
  }

  // Filter companies based on search query
  const filteredCompanies = transportCompanies.filter((company) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      company.name.toLowerCase().includes(query) ||
      company.id.toLowerCase().includes(query) ||
      company.companyId?.toLowerCase().includes(query) ||
      company.contract?.toLowerCase().includes(query) ||
      company.phone?.toLowerCase().includes(query)
    )
  })

  const handleSaveEdit = async (companyId: string) => {
    if (!editingCompanyName.trim()) {
      toast({
        title: "Алдаа",
        description: "Нэр шаардлагатай",
        variant: "destructive",
      })
      return
    }

    if (!editingCompanyId.trim()) {
      toast({
        title: "Алдаа",
        description: "Регистер шаардлагатай",
        variant: "destructive",
      })
      return
    }

    if (!editingContract.trim()) {
      toast({
        title: "Алдаа",
        description: "Гадаад худалдааны гэрээ шаардлагатай",
        variant: "destructive",
      })
      return
    }

    if (!editingPhone.trim()) {
      toast({
        title: "Алдаа",
        description: "Утасны дугаар шаардлагатай",
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
        body: JSON.stringify({ 
          name: editingCompanyName.trim(),
          companyId: editingCompanyId.trim(),
          contract: editingContract.trim(),
          phone: editingPhone.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to update transport company" }))
        throw new Error(errorData.error || "Failed to update transport company")
      }

      toast({
        title: "Амжилттай",
        description: "Тээврийн компани амжилттай засагдлаа",
      })

      setEditingCompany(null)
      setEditingCompanyName("")
      setEditingCompanyId("")
      setEditingContract("")
      setEditingPhone("")
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
        title: "Алдаа",
        description: error instanceof Error ? error.message : "Тээврийн компани засахад алдаа гарлаа",
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
                  setEditingCompanyId("")
                  setEditingContract("")
                  setEditingPhone("")
                  setNewCompanyName("")
                  setNewCompanyId("")
                  setNewContract("")
                  setNewPhone("")
                  setAddDialogOpen(true)
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Нэмэх
              </Button>
            </div>

            {filteredCompanies.length > 0 ? (
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Нэр</TableHead>
                      <TableHead>Регистер</TableHead>
                      <TableHead>Гадаад худалдааны гэрээ</TableHead>
                      <TableHead>Утасны дугаар</TableHead>
                      <TableHead className="w-[120px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompanies.map((company) => (
                      <TableRow 
                        key={company.id}
                        onDoubleClick={() => handleDoubleClick(company)}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">
                          {company.name}
                        </TableCell>
                        <TableCell>
                          {company.companyId || "-"}
                        </TableCell>
                        <TableCell>
                          {company.contract || "-"}
                        </TableCell>
                        <TableCell>
                          {company.phone || "-"}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
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
                  />
                </div>
                <div>
                  <Label htmlFor="dialog-company-id">Регистер *</Label>
                  <Input
                    id="dialog-company-id"
                    value={editingCompany ? editingCompanyId : newCompanyId}
                    onChange={(e) => {
                      if (editingCompany) {
                        setEditingCompanyId(e.target.value)
                      } else {
                        setNewCompanyId(e.target.value)
                      }
                    }}
                    placeholder="Регистрийн дугаар оруулах"
                  />
                </div>
                <div>
                  <Label htmlFor="dialog-company-contract">Гадаад худалдааны гэрээ *</Label>
                  <Input
                    id="dialog-company-contract"
                    value={editingCompany ? editingContract : newContract}
                    onChange={(e) => {
                      if (editingCompany) {
                        setEditingContract(e.target.value)
                      } else {
                        setNewContract(e.target.value)
                      }
                    }}
                    placeholder="Гадаад худалдааны гэрээний дугаар оруулах"
                  />
                </div>
                <div>
                  <Label htmlFor="dialog-company-phone">Утасны дугаар *</Label>
                  <Input
                    id="dialog-company-phone"
                    value={editingCompany ? editingPhone : newPhone}
                    onChange={(e) => {
                      if (editingCompany) {
                        setEditingPhone(e.target.value)
                      } else {
                        setNewPhone(e.target.value)
                      }
                    }}
                    placeholder="Утасны дугаар оруулах"
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
                  disabled={
                    isUpdating || 
                    isAdding || 
                    !(editingCompany ? editingCompanyName : newCompanyName).trim() ||
                    !(editingCompany ? editingCompanyId : newCompanyId).trim() ||
                    !(editingCompany ? editingContract : newContract).trim() ||
                    !(editingCompany ? editingPhone : newPhone).trim()
                  }
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

          {/* Company Info Dialog */}
          <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Тээврийн компанийн мэдээлэл</DialogTitle>
              </DialogHeader>
              {selectedCompany && (
                <div className="space-y-4 py-4">
                  <div>
                    <Label className="text-sm font-semibold">Нэр:</Label>
                    <p className="mt-1 text-sm">{selectedCompany.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Регистер:</Label>
                    <p className="mt-1 text-sm">{selectedCompany.companyId || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Гадаад худалдааны гэрээ:</Label>
                    <p className="mt-1 text-sm">{selectedCompany.contract || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Утасны дугаар:</Label>
                    <p className="mt-1 text-sm">{selectedCompany.phone || "-"}</p>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={() => setInfoDialogOpen(false)}>
                  Хаах
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  )
}
