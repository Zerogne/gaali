"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  value: string
  label: string
  isCustom: boolean
}

interface ProductManagerProps {
  products: Product[]
  onProductAdded: () => void
}

export function ProductManager({ products, onProductAdded }: ProductManagerProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [newProductLabel, setNewProductLabel] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)

  const customProducts = products.filter((p) => p.isCustom)

  const handleAddProduct = async () => {
    if (!newProductLabel.trim()) {
      toast({
        title: "Error",
        description: "Product name is required",
        variant: "destructive",
      })
      return
    }

    setIsAdding(true)
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newProductLabel.trim() }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to add product")
      }

      toast({
        title: "Success",
        description: "Product added successfully",
      })

      setNewProductLabel("")
      
      // Dispatch custom event to refresh all sections
      window.dispatchEvent(new CustomEvent("refreshDropdownData"))
      
      onProductAdded()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add product",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return

    setIsDeleting(productToDelete)
    setDeleteDialogOpen(false)
    try {
      const response = await fetch(`/api/products/${productToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete product")
      }

      toast({
        title: "Success",
        description: "Product deleted successfully",
      })

      // Dispatch custom event to refresh all sections
      window.dispatchEvent(new CustomEvent("refreshDropdownData"))

      onProductAdded()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
      setProductToDelete(null)
    }
  }

  return (
    <>
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-gray-300 hover:bg-gray-50 flex-shrink-0 h-10"
        >
          <Plus className="w-4 h-4" />
          Нэмэх
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Products</DialogTitle>
          <DialogDescription>
            Add or remove custom product types for cargo selection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add New Product */}
          <div className="space-y-2">
            <Label htmlFor="new-product">Add New Product</Label>
            <div className="flex gap-2">
              <Input
                id="new-product"
                value={newProductLabel}
                onChange={(e) => setNewProductLabel(e.target.value)}
                placeholder="Enter product name"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isAdding) {
                    handleAddProduct()
                  }
                }}
              />
              <Button
                onClick={handleAddProduct}
                disabled={isAdding || !newProductLabel.trim()}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {isAdding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Custom Products List */}
          {customProducts.length > 0 && (
            <div className="space-y-2">
              <Label>Custom Products</Label>
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-60 overflow-y-auto">
                {customProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50"
                  >
                    <span className="text-sm text-gray-900">{product.label}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(product.id)}
                      disabled={isDeleting === product.id}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {isDeleting === product.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {customProducts.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No custom products yet. Add one above to get started.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Product</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this product? This action cannot be undone.
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
