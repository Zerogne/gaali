"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"

interface DeleteCompanyDialogProps {
  companyId: string
  companyName: string
}

export function DeleteCompanyDialog({ companyId, companyName }: DeleteCompanyDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const requiredText = `DELETE ${companyId}`

  async function handleDelete() {
    if (confirmText !== requiredText) {
      toast.error(`Please type "${requiredText}" to confirm`)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/delete`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Server error: ${response.status}`)
      }

      if (result.success) {
        toast.success(`Company "${companyName}" and all its data have been deleted`)
        setOpen(false)
        setConfirmText("")
        router.push("/admin/companies")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to delete company")
      }
    } catch (error) {
      console.error("Delete company error:", error)
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while deleting the company"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Company
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Company</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              This will permanently delete <strong>{companyName}</strong> and ALL of its data from MongoDB,
              including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All workers</li>
                <li>All truck sessions</li>
                <li>All logs</li>
                <li>All products</li>
                <li>All settings</li>
                <li>All other company data</li>
              </ul>
              <p className="mt-4 font-semibold text-destructive">
                This action cannot be undone!
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Label htmlFor="confirmText">
            Type <code className="bg-muted px-1 py-0.5 rounded">{requiredText}</code> to confirm:
          </Label>
          <Input
            id="confirmText"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={requiredText}
            className="mt-2"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading || confirmText !== requiredText}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Deleting..." : "Delete Company"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
