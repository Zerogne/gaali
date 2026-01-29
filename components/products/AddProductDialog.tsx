"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { findSimilarValue } from "@/lib/utils/string-similarity"

export interface AddProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Existing product labels for duplicate/similarity check */
  existingLabels: string[]
  /** Called after a product is added successfully (new product id passed) */
  onSuccess?: (productId: string) => void
}

export function AddProductDialog({
  open,
  onOpenChange,
  existingLabels,
  onSuccess,
}: AddProductDialogProps) {
  const { toast } = useToast()
  const [label, setLabel] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [duplicateValue, setDuplicateValue] = useState<string | null>(null)

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setLabel("")
      setDuplicateDialogOpen(false)
      setDuplicateValue(null)
    }
    onOpenChange(next)
  }

  const handleSubmit = async () => {
    const trimmed = label.trim()
    if (!trimmed) {
      toast({
        title: "Алдаа",
        description: "Бүтээгдэхүүний нэр оруулах шаардлагатай",
        variant: "destructive",
      })
      return
    }

    const similar = findSimilarValue(trimmed, existingLabels)
    if (similar) {
      setDuplicateValue(similar)
      setDuplicateDialogOpen(true)
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: trimmed }),
        credentials: "include",
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Failed to add product")
      }

      const product = await response.json()
      toast({
        title: "Амжилттай",
        description: "Бүтээгдэхүүн нэмэгдлээ",
      })

      setLabel("")
      handleOpenChange(false)
      window.dispatchEvent(new CustomEvent("refreshDropdownData"))
      onSuccess?.(product.id)
    } catch (error) {
      toast({
        title: "Алдаа",
        description: error instanceof Error ? error.message : "Бүтээгдэхүүн нэмэхэд алдаа гарлаа",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Шинэ бүтээгдэхүүн нэмэх</DialogTitle>
            <DialogDescription>Бүтээгдэхүүний нэрийг оруулна уу</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="add-product-name">
                Бүтээгдэхүүний нэр <span className="text-red-500">*</span>
              </Label>
              <Input
                id="add-product-name"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Бүтээгдэхүүний нэр оруулах"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleSubmit()
                  }
                  if (e.key === "Escape") handleOpenChange(false)
                }}
                autoFocus
                disabled={isSubmitting}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
              Цуцлах
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !label.trim()}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Нэмэх"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate warning dialog */}
      {duplicateDialogOpen && duplicateValue && (
        <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Давхардсан бүтээгдэхүүн</DialogTitle>
              <DialogDescription>
                Ижил төстэй бүтээгдэхүүн аль хэдийн байна: <strong>&quot;{duplicateValue}&quot;</strong>. Өөр нэр ашиглана уу.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setDuplicateDialogOpen(false)}>OK</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
