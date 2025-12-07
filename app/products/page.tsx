"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Package, Plus, X, Loader2, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { findSimilarValue } from "@/lib/utils/string-similarity"

interface Product {
  id: string
  value: string
  label: string
  isCustom: boolean
}

export default function ProductsPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [newProductLabel, setNewProductLabel] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [editingProductName, setEditingProductName] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [duplicateValue, setDuplicateValue] = useState<string | null>(null)

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/products")
        if (response.ok) {
          const data = await response.json()
          setProducts(data)
        }
      } catch (error) {
        console.error("Error loading products:", error)
      }
    }
    loadProducts()

    // Listen for refresh events
    const handleRefresh = () => {
      loadProducts()
    }
    window.addEventListener("refreshDropdownData", handleRefresh)
    return () => {
      window.removeEventListener("refreshDropdownData", handleRefresh)
    }
  }, [])

  const handleAddProduct = async () => {
    if (!newProductLabel.trim()) {
      toast({
        title: "Error",
        description: "Product name is required",
        variant: "destructive",
      })
      return
    }

    // Check for similar/duplicate products
    const existingLabels = customProducts.map(p => p.label)
    const similarProduct = findSimilarValue(newProductLabel.trim(), existingLabels)
    
    if (similarProduct) {
      setDuplicateValue(similarProduct)
      setDuplicateDialogOpen(true)
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
      
      // Reload products
      const reloadResponse = await fetch("/api/products")
      if (reloadResponse.ok) {
        const data = await reloadResponse.json()
        setProducts(data)
      }
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

  const handleEditClick = (product: Product) => {
    setEditingProduct(product.id)
    setEditingProductName(product.label)
  }

  const handleCancelEdit = () => {
    setEditingProduct(null)
    setEditingProductName("")
  }

  const handleSaveEdit = async (productId: string) => {
    if (!editingProductName.trim()) {
      toast({
        title: "Error",
        description: "Product name is required",
        variant: "destructive",
      })
      return
    }

    // Check for similar/duplicate products (excluding current product)
    const existingLabels = customProducts
      .filter(p => p.id !== productId)
      .map(p => p.label)
    const similarProduct = findSimilarValue(editingProductName.trim(), existingLabels)
    
    if (similarProduct) {
      setDuplicateValue(similarProduct)
      setDuplicateDialogOpen(true)
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ label: editingProductName.trim() }),
      })

      if (!response.ok) {
        throw new Error("Failed to update product")
      }

      toast({
        title: "Success",
        description: "Product updated successfully",
      })

      setEditingProduct(null)
      setEditingProductName("")

      // Dispatch custom event to refresh all sections
      window.dispatchEvent(new CustomEvent("refreshDropdownData"))

      // Reload products
      const reloadResponse = await fetch("/api/products")
      if (reloadResponse.ok) {
        const data = await reloadResponse.json()
        setProducts(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
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
        const errorData = await response.json().catch(() => ({ error: "Failed to delete product" }))
        throw new Error(errorData.error || "Failed to delete product")
      }

      toast({
        title: "Success",
        description: "Product deleted successfully",
      })

      // Dispatch custom event to refresh all sections
      window.dispatchEvent(new CustomEvent("refreshDropdownData"))

      // Reload products
      const reloadResponse = await fetch("/api/products")
      if (reloadResponse.ok) {
        const data = await reloadResponse.json()
        setProducts(data)
      }
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

  const customProducts = products.filter((p) => p.isCustom)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Package className="w-5 h-5" />
                Бүтээгдэхүүн
              </h2>
            </div>
            
            {/* Add Product Input */}
            <div className="flex gap-2 mb-6">
              <Input
                value={newProductLabel}
                onChange={(e) => setNewProductLabel(e.target.value)}
                placeholder="Бүтээгдэхүүний нэр оруулах"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isAdding && newProductLabel.trim()) {
                    handleAddProduct()
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={handleAddProduct}
                disabled={isAdding || !newProductLabel.trim()}
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

            {customProducts.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Нэр</TableHead>
                      <TableHead className="w-[120px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {editingProduct === product.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingProductName}
                                onChange={(e) => setEditingProductName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && editingProductName.trim()) {
                                    handleSaveEdit(product.id)
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
                                onClick={() => handleSaveEdit(product.id)}
                                disabled={isUpdating || !editingProductName.trim()}
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
                            product.label
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {editingProduct !== product.id && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditClick(product)}
                                  disabled={isDeleting === product.id}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
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
                Бүтээгдэхүүн байхгүй байна. Дээрх талбарт нэр оруулаад нэмнэ үү.
              </p>
            )}
          </Card>

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Бүтээгдэхүүн устгах</AlertDialogTitle>
                <AlertDialogDescription>
                  Та энэ бүтээгдэхүүнийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
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
                <AlertDialogTitle>Давхардсан бүтээгдэхүүн</AlertDialogTitle>
                <AlertDialogDescription>
                  Ижил төстэй бүтээгдэхүүн аль хэдийн байна: <strong>"{duplicateValue}"</strong>. Өөр нэр ашиглана уу.
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
