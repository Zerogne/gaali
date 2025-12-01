"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { ProductManager } from "@/components/products/ProductManager"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package } from "lucide-react"

interface Product {
  id: string
  value: string
  label: string
  isCustom: boolean
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])

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

  const handleProductAdded = () => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(console.error)
  }

  const customProducts = products.filter((p) => p.isCustom)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Бүтээгдэхүүн</h1>
            <p className="text-muted-foreground">Бүтээгдэхүүний төрлүүдийг удирдах</p>
          </div>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Package className="w-5 h-5" />
                Бүтээгдэхүүн
              </h2>
              <ProductManager products={products} onProductAdded={handleProductAdded} />
            </div>
            {customProducts.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Нэр</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.label}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Бүтээгдэхүүн байхгүй байна. Нэмэх товч дараад нэмнэ үү.
              </p>
            )}
          </Card>
        </main>
      </div>
    </div>
  )
}

