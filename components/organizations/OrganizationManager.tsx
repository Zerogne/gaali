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

import type { Organization, OrganizationType } from "@/lib/types"

interface OrganizationManagerProps {
  organizations: Organization[]
  type: OrganizationType // "sender" or "receiver"
  onOrganizationAdded: () => void
  onOrganizationUpdated: () => void
}

export function OrganizationManager({
  organizations,
  type,
  onOrganizationAdded,
  onOrganizationUpdated,
}: OrganizationManagerProps) {
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null)
  const [orgName, setOrgName] = useState("")
  const [orgId, setOrgId] = useState("")
  const [contract, setContract] = useState("")
  const [phone, setPhone] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [orgToDelete, setOrgToDelete] = useState<string | null>(null)

  const handleAdd = () => {
    setEditingOrg(null)
    setOrgName("")
    setOrgId("")
    setContract("")
    setPhone("")
    setIsDialogOpen(true)
  }

  const handleEdit = (org: Organization) => {
    setEditingOrg(org)
    setOrgName(org.name)
    setOrgId(org.companyId || "")
    setContract(org.contract || "")
    setPhone(org.phone || "")
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!orgName.trim()) {
      toast({
        title: "Алдаа",
        description: "Нэр шаардлагатай",
        variant: "destructive",
      })
      return
    }

    if (!orgId.trim()) {
      toast({
        title: "Алдаа",
        description: "Регистер шаардлагатай",
        variant: "destructive",
      })
      return
    }

    if (!contract.trim()) {
      toast({
        title: "Алдаа",
        description: "Гадаад худалдааны гэрээ шаардлагатай",
        variant: "destructive",
      })
      return
    }

    if (!phone.trim()) {
      toast({
        title: "Алдаа",
        description: "Утасны дугаар шаардлагатай",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const url = editingOrg
        ? `/api/organizations/${editingOrg.id}`
        : "/api/organizations"
      const method = editingOrg ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name: orgName.trim(),
          companyId: orgId.trim(),
          contract: contract.trim(),
          phone: phone.trim(),
          ...(editingOrg ? {} : { type: type }) // Only send type when creating new, preserve existing type when editing
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to save organization" }))
        throw new Error(errorData.error || "Failed to save organization")
      }

      toast({
        title: "Амжилттай",
        description: editingOrg
          ? "Байгууллага амжилттай засагдлаа"
          : "Байгууллага амжилттай нэмэгдлээ",
      })

      setIsDialogOpen(false)
      setOrgName("")
      setOrgId("")
      setContract("")
      setPhone("")
      setEditingOrg(null)

      // Dispatch custom event to refresh all sections
      window.dispatchEvent(new CustomEvent("refreshDropdownData"))

      if (editingOrg) {
        onOrganizationUpdated()
      } else {
        onOrganizationAdded()
      }
    } catch (error) {
      toast({
        title: "Алдаа",
        description: error instanceof Error ? error.message : "Байгууллага хадгалахад алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = (orgId: string) => {
    setOrgToDelete(orgId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!orgToDelete) return

    setDeleteDialogOpen(false)
    try {
      const response = await fetch(`/api/organizations/${orgToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete organization")
      }

      toast({
        title: "Success",
        description: "Organization deleted successfully",
      })

      // Dispatch custom event to refresh all sections
      window.dispatchEvent(new CustomEvent("refreshDropdownData"))

      onOrganizationUpdated()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete organization",
        variant: "destructive",
      })
    } finally {
      setOrgToDelete(null)
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
              {editingOrg 
                ? `${type === "sender" ? "Илгээч" : "Хүлээн авагч"} байгууллага засах` 
                : `Шинэ ${type === "sender" ? "илгээч" : "хүлээн авагч"} байгууллага нэмэх`}
            </DialogTitle>
            <DialogDescription>
              {editingOrg
                ? `${type === "sender" ? "Илгээч" : "Хүлээн авагч"} байгууллагын мэдээллийг засах`
                : `Шинэ ${type === "sender" ? "илгээч" : "хүлээн авагч"} байгууллагын мэдээлэл оруулах`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="org-name">Нэр *</Label>
              <Input
                id="org-name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Байгууллагын нэр оруулах"
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="org-id">Регистер *</Label>
              <Input
                id="org-id"
                value={orgId}
                onChange={(e) => setOrgId(e.target.value)}
                placeholder="Регистрийн дугаар оруулах"
              />
            </div>
            <div>
              <Label htmlFor="org-contract">Гадаад худалдааны гэрээ *</Label>
              <Input
                id="org-contract"
                value={contract}
                onChange={(e) => setContract(e.target.value)}
                placeholder="Гадаад худалдааны гэрээний дугаар оруулах"
              />
            </div>
            <div>
              <Label htmlFor="org-phone">Утасны дугаар *</Label>
              <Input
                id="org-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Утасны дугаар оруулах"
              />
            </div>

            {organizations.length > 0 && (
              <div>
                <Label className="mb-2 block">Existing Organizations</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {organizations.map((org) => (
                    <div
                      key={org.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                    >
                      <span className="text-sm text-gray-700">{org.name}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(org)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(org.id)}
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
            <Button 
              onClick={handleSave} 
              disabled={
                isSaving || 
                !orgName.trim() || 
                !orgId.trim() || 
                !contract.trim() || 
                !phone.trim()
              }
            >
              {isSaving ? "Хадгалж байна..." : editingOrg ? "Засах" : "Нэмэх"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Organization</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this organization? This action cannot be undone.
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
