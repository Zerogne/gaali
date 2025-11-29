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
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TransportCompany {
  id: string
  name: string
}

interface TransportCompanyManagerProps {
  companies: TransportCompany[]
  onCompanyAdded: () => void
}

export function TransportCompanyManager({
  companies,
  onCompanyAdded,
}: TransportCompanyManagerProps) {
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [companyName, setCompanyName] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleAdd = () => {
    setCompanyName("")
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
      const response = await fetch("/api/transport-companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: companyName.trim() }),
      })

      if (!response.ok) {
        throw new Error("Failed to add transport company")
      }

      toast({
        title: "Success",
        description: "Transport company added successfully",
      })

      setIsDialogOpen(false)
      setCompanyName("")
      onCompanyAdded()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add transport company",
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Transport Company</DialogTitle>
            <DialogDescription>
              Enter a new transport company name.
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
              {isSaving ? "Saving..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

