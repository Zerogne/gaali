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
  const [isSaving, setIsSaving] = useState(false)

  const handleAdd = () => {
    setEditingOrg(null)
    setOrgName("")
    setIsDialogOpen(true)
  }

  const handleEdit = (org: Organization) => {
    setEditingOrg(org)
    setOrgName(org.name)
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!orgName.trim()) {
      toast({
        title: "Error",
        description: "Organization name is required",
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
          ...(editingOrg ? {} : { type: type }) // Only send type when creating new, preserve existing type when editing
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save organization")
      }

      toast({
        title: "Success",
        description: editingOrg
          ? "Organization updated successfully"
          : "Organization added successfully",
      })

      setIsDialogOpen(false)
      setOrgName("")
      setEditingOrg(null)

      if (editingOrg) {
        onOrganizationUpdated()
      } else {
        onOrganizationAdded()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save organization",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (orgId: string) => {
    if (!confirm("Are you sure you want to delete this organization?")) {
      return
    }

    try {
      const response = await fetch(`/api/organizations/${orgId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete organization")
      }

      toast({
        title: "Success",
        description: "Organization deleted successfully",
      })

      onOrganizationUpdated()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete organization",
        variant: "destructive",
      })
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
                ? `Edit ${type === "sender" ? "Sender" : "Receiver"} Organization` 
                : `Add New ${type === "sender" ? "Sender" : "Receiver"} Organization`}
            </DialogTitle>
            <DialogDescription>
              {editingOrg
                ? `Update the ${type === "sender" ? "sender" : "receiver"} organization name below.`
                : `Enter a new ${type === "sender" ? "sender" : "receiver"} organization name.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Enter organization name"
                autoFocus
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
                          onClick={() => handleDelete(org.id)}
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
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : editingOrg ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

