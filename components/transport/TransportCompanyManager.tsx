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

interface TransportCompany {
  id: string
  name: string
}

interface TransportCompanyManagerProps {
  companies: TransportCompany[]
  onCompanyAdded: () => void
  onCompanyUpdated?: () => void
}

export function TransportCompanyManager({
  companies,
  onCompanyAdded,
  onCompanyUpdated,
}: TransportCompanyManagerProps) {
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<TransportCompany | null>(null)
  const [companyName, setCompanyName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null)

  const handleAdd = () => {
    setEditingCompany(null)
    setCompanyName("")
    setIsDialogOpen(true)
  }

  const handleEdit = (company: TransportCompany) => {
    setEditingCompany(company)
    setCompanyName(company.name)
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!companyName.trim()) {
      toast({
        title: "Error",
        description: "Company name is required",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const url = editingCompany
        ? `/api/transport-companies/${editingCompany.id}`
        : "/api/transport-companies"
      const method = editingCompany ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: companyName.trim() }),
      })

      if (!response.ok) {
        throw new Error("Failed to save transport company")
      }

      toast({
        title: "Success",
        description: editingCompany
          ? "Transport company updated successfully"
          : "Transport company added successfully",
      })

      setIsDialogOpen(false)
      setCompanyName("")
      setEditingCompany(null)

      // Dispatch custom event to refresh all sections
      window.dispatchEvent(new CustomEvent("refreshDropdownData"))

      if (editingCompany && onCompanyUpdated) {
        onCompanyUpdated()
      } else {
        onCompanyAdded()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save transport company",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
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
        throw new Error("Failed to delete transport company")
      }

      toast({
        title: "Success",
        description: "Transport company deleted successfully",
      })

      // Dispatch custom event to refresh all sections
      window.dispatchEvent(new CustomEvent("refreshDropdownData"))

      if (onCompanyUpdated) {
        onCompanyUpdated()
      } else {
        onCompanyAdded()
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCompany ? "Edit Transport Company" : "Add New Transport Company"}
            </DialogTitle>
            <DialogDescription>
              {editingCompany
                ? "Update the transport company name below."
                : "Enter a new transport company name."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
                autoFocus
              />
            </div>

            {companies.length > 0 && (
              <div>
                <Label className="mb-2 block">Existing Companies</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {companies.map((company) => (
                    <div
                      key={company.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                    >
                      <span className="text-sm text-gray-700">{company.name}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(company)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(company.id)}
                          disabled={isDeleting === company.id}
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                        >
                          {isDeleting === company.id ? (
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
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : editingCompany ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transport Company</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transport company? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
