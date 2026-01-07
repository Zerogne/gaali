"use client";

import { Sidebar } from "@/components/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { Location } from "@/lib/types";
import { Building2, Edit, Loader2, Plus, Trash2, Search, X, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { findSimilarValue } from "@/lib/utils/string-similarity";

export default function LocationsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"seller" | "buyer">("seller");
  
  // Sellers State
  const [sellers, setSellers] = useState<Location[]>([]);
  const [newSellerLocationName, setNewSellerLocationName] = useState("");
  const [newSellerCompanyName, setNewSellerCompanyName] = useState("");
  const [isAddingSeller, setIsAddingSeller] = useState(false);
  const [isDeletingSeller, setIsDeletingSeller] = useState<string | null>(null);
  const [sellerToDelete, setSellerToDelete] = useState<string | null>(null);
  const [editingSeller, setEditingSeller] = useState<string | null>(null);
  const [editingSellerLocationName, setEditingSellerLocationName] = useState("");
  const [editingSellerCompanyName, setEditingSellerCompanyName] = useState("");
  const [isUpdatingSeller, setIsUpdatingSeller] = useState(false);
  const [duplicateSellerDialogOpen, setDuplicateSellerDialogOpen] = useState(false);
  const [duplicateSellerValue, setDuplicateSellerValue] = useState<string | null>(null);
  const [sellerSearchQuery, setSellerSearchQuery] = useState("");
  const [addSellerDialogOpen, setAddSellerDialogOpen] = useState(false);
  const [infoSellerDialogOpen, setInfoSellerDialogOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Location | null>(null);

  // Buyers State
  const [buyers, setBuyers] = useState<Location[]>([]);
  const [newBuyerLocationName, setNewBuyerLocationName] = useState("");
  const [newBuyerCompanyName, setNewBuyerCompanyName] = useState("");
  const [isAddingBuyer, setIsAddingBuyer] = useState(false);
  const [isDeletingBuyer, setIsDeletingBuyer] = useState<string | null>(null);
  const [buyerToDelete, setBuyerToDelete] = useState<string | null>(null);
  const [editingBuyer, setEditingBuyer] = useState<string | null>(null);
  const [editingBuyerLocationName, setEditingBuyerLocationName] = useState("");
  const [editingBuyerCompanyName, setEditingBuyerCompanyName] = useState("");
  const [isUpdatingBuyer, setIsUpdatingBuyer] = useState(false);
  const [duplicateBuyerDialogOpen, setDuplicateBuyerDialogOpen] = useState(false);
  const [duplicateBuyerValue, setDuplicateBuyerValue] = useState<string | null>(null);
  const [buyerSearchQuery, setBuyerSearchQuery] = useState("");
  const [addBuyerDialogOpen, setAddBuyerDialogOpen] = useState(false);
  const [infoBuyerDialogOpen, setInfoBuyerDialogOpen] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<Location | null>(null);

  // Load Locations
  useEffect(() => {
    async function loadLocations() {
      try {
        const [sellersResponse, buyersResponse] = await Promise.all([
          fetch("/api/locations?type=seller"),
          fetch("/api/locations?type=buyer")
        ]);
        
        if (sellersResponse.ok) {
          const sellersData = await sellersResponse.json();
          setSellers(sellersData);
        }
        
        if (buyersResponse.ok) {
          const buyersData = await buyersResponse.json();
          setBuyers(buyersData);
        }
      } catch (error) {
        console.error("Error loading locations:", error);
      }
    }
    loadLocations();

    const handleRefresh = () => {
      loadLocations();
    };
    window.addEventListener("refreshDropdownData", handleRefresh);
    return () => {
      window.removeEventListener("refreshDropdownData", handleRefresh);
    };
  }, []);

  const filteredSellers = sellers.filter((seller) => {
    if (!sellerSearchQuery.trim()) return true;
    const query = sellerSearchQuery.toLowerCase();
    return (
      seller.locationName.toLowerCase().includes(query) ||
      seller.companyName.toLowerCase().includes(query) ||
      seller.id.toLowerCase().includes(query)
    );
  });

  const filteredBuyers = buyers.filter((buyer) => {
    if (!buyerSearchQuery.trim()) return true;
    const query = buyerSearchQuery.toLowerCase();
    return (
      buyer.locationName.toLowerCase().includes(query) ||
      buyer.companyName.toLowerCase().includes(query) ||
      buyer.id.toLowerCase().includes(query)
    );
  });

  // Seller handlers
  const handleAddSeller = async () => {
    if (!newSellerLocationName.trim()) {
      toast({
        title: "Алдаа",
        description: "Байршлын нэр шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    if (!newSellerCompanyName.trim()) {
      toast({
        title: "Алдаа",
        description: "Компанийн нэр шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicates
    const existingNames = sellers.map(s => s.locationName);
    const similarLocation = findSimilarValue(newSellerLocationName.trim(), existingNames);
    
    if (similarLocation) {
      setDuplicateSellerValue(similarLocation);
      setDuplicateSellerDialogOpen(true);
      return;
    }

    setIsAddingSeller(true);
    try {
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locationName: newSellerLocationName.trim(),
          companyName: newSellerCompanyName.trim(),
          type: "seller",
        }),
      });

      if (response.ok) {
        const newSeller = await response.json();
        setSellers([newSeller, ...sellers]);
        setNewSellerLocationName("");
        setNewSellerCompanyName("");
        setAddSellerDialogOpen(false);
        toast({
          title: "Амжилттай",
          description: "Борлуулагч амжилттай нэмэгдлээ",
        });
        window.dispatchEvent(new Event("refreshDropdownData"));
      } else {
        const error = await response.json();
        toast({
          title: "Алдаа",
          description: error.error || "Борлуулагч нэмэхэд алдаа гарлаа",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding seller:", error);
      toast({
        title: "Алдаа",
        description: "Борлуулагч нэмэхэд алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsAddingSeller(false);
    }
  };

  const handleUpdateSeller = async () => {
    if (!editingSeller) return;

    if (!editingSellerLocationName.trim()) {
      toast({
        title: "Алдаа",
        description: "Байршлын нэр шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    if (!editingSellerCompanyName.trim()) {
      toast({
        title: "Алдаа",
        description: "Компанийн нэр шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicates (excluding current)
    const existingNames = sellers.filter(s => s.id !== editingSeller).map(s => s.locationName);
    const similarLocation = findSimilarValue(editingSellerLocationName.trim(), existingNames);
    
    if (similarLocation) {
      setDuplicateSellerValue(similarLocation);
      setDuplicateSellerDialogOpen(true);
      return;
    }

    setIsUpdatingSeller(true);
    try {
      const response = await fetch(`/api/locations/${editingSeller}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locationName: editingSellerLocationName.trim(),
          companyName: editingSellerCompanyName.trim(),
          type: "seller",
        }),
      });

      if (response.ok) {
        const updatedSeller = await response.json();
        setSellers(sellers.map(s => s.id === editingSeller ? updatedSeller : s));
        setEditingSeller(null);
        setEditingSellerLocationName("");
        setEditingSellerCompanyName("");
        toast({
          title: "Амжилттай",
          description: "Борлуулагч амжилттай шинэчлэгдлээ",
        });
        window.dispatchEvent(new Event("refreshDropdownData"));
      } else {
        const error = await response.json();
        toast({
          title: "Алдаа",
          description: error.error || "Борлуулагч шинэчлэхэд алдаа гарлаа",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating seller:", error);
      toast({
        title: "Алдаа",
        description: "Борлуулагч шинэчлэхэд алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingSeller(false);
    }
  };

  const handleDeleteSeller = async () => {
    if (!sellerToDelete) return;

    setIsDeletingSeller(sellerToDelete);
    try {
      const response = await fetch(`/api/locations/${sellerToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSellers(sellers.filter(s => s.id !== sellerToDelete));
        setSellerToDelete(null);
        toast({
          title: "Амжилттай",
          description: "Борлуулагч амжилттай устгагдлаа",
        });
        window.dispatchEvent(new Event("refreshDropdownData"));
      } else {
        const error = await response.json();
        toast({
          title: "Алдаа",
          description: error.error || "Борлуулагч устгахад алдаа гарлаа",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting seller:", error);
      toast({
        title: "Алдаа",
        description: "Борлуулагч устгахад алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsDeletingSeller(null);
    }
  };

  const handleEditSeller = (seller: Location) => {
    setEditingSeller(seller.id);
    setEditingSellerLocationName(seller.locationName);
    setEditingSellerCompanyName(seller.companyName);
  };

  const handleCancelEditSeller = () => {
    setEditingSeller(null);
    setEditingSellerLocationName("");
    setEditingSellerCompanyName("");
  };

  const handleDoubleClickSeller = (seller: Location) => {
    setSelectedSeller(seller);
    setInfoSellerDialogOpen(true);
  };

  // Buyer handlers
  const handleAddBuyer = async () => {
    if (!newBuyerLocationName.trim()) {
      toast({
        title: "Алдаа",
        description: "Байршлын нэр шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    if (!newBuyerCompanyName.trim()) {
      toast({
        title: "Алдаа",
        description: "Компанийн нэр шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicates
    const existingNames = buyers.map(b => b.locationName);
    const similarLocation = findSimilarValue(newBuyerLocationName.trim(), existingNames);
    
    if (similarLocation) {
      setDuplicateBuyerValue(similarLocation);
      setDuplicateBuyerDialogOpen(true);
      return;
    }

    setIsAddingBuyer(true);
    try {
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locationName: newBuyerLocationName.trim(),
          companyName: newBuyerCompanyName.trim(),
          type: "buyer",
        }),
      });

      if (response.ok) {
        const newBuyer = await response.json();
        setBuyers([newBuyer, ...buyers]);
        setNewBuyerLocationName("");
        setNewBuyerCompanyName("");
        setAddBuyerDialogOpen(false);
        toast({
          title: "Амжилттай",
          description: "Худалдан авагч амжилттай нэмэгдлээ",
        });
        window.dispatchEvent(new Event("refreshDropdownData"));
      } else {
        const error = await response.json();
        toast({
          title: "Алдаа",
          description: error.error || "Худалдан авагч нэмэхэд алдаа гарлаа",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding buyer:", error);
      toast({
        title: "Алдаа",
        description: "Худалдан авагч нэмэхэд алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsAddingBuyer(false);
    }
  };

  const handleUpdateBuyer = async () => {
    if (!editingBuyer) return;

    if (!editingBuyerLocationName.trim()) {
      toast({
        title: "Алдаа",
        description: "Байршлын нэр шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    if (!editingBuyerCompanyName.trim()) {
      toast({
        title: "Алдаа",
        description: "Компанийн нэр шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicates (excluding current)
    const existingNames = buyers.filter(b => b.id !== editingBuyer).map(b => b.locationName);
    const similarLocation = findSimilarValue(editingBuyerLocationName.trim(), existingNames);
    
    if (similarLocation) {
      setDuplicateBuyerValue(similarLocation);
      setDuplicateBuyerDialogOpen(true);
      return;
    }

    setIsUpdatingBuyer(true);
    try {
      const response = await fetch(`/api/locations/${editingBuyer}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locationName: editingBuyerLocationName.trim(),
          companyName: editingBuyerCompanyName.trim(),
          type: "buyer",
        }),
      });

      if (response.ok) {
        const updatedBuyer = await response.json();
        setBuyers(buyers.map(b => b.id === editingBuyer ? updatedBuyer : b));
        setEditingBuyer(null);
        setEditingBuyerLocationName("");
        setEditingBuyerCompanyName("");
        toast({
          title: "Амжилттай",
          description: "Худалдан авагч амжилттай шинэчлэгдлээ",
        });
        window.dispatchEvent(new Event("refreshDropdownData"));
      } else {
        const error = await response.json();
        toast({
          title: "Алдаа",
          description: error.error || "Худалдан авагч шинэчлэхэд алдаа гарлаа",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating buyer:", error);
      toast({
        title: "Алдаа",
        description: "Худалдан авагч шинэчлэхэд алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingBuyer(false);
    }
  };

  const handleDeleteBuyer = async () => {
    if (!buyerToDelete) return;

    setIsDeletingBuyer(buyerToDelete);
    try {
      const response = await fetch(`/api/locations/${buyerToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBuyers(buyers.filter(b => b.id !== buyerToDelete));
        setBuyerToDelete(null);
        toast({
          title: "Амжилттай",
          description: "Худалдан авагч амжилттай устгагдлаа",
        });
        window.dispatchEvent(new Event("refreshDropdownData"));
      } else {
        const error = await response.json();
        toast({
          title: "Алдаа",
          description: error.error || "Худалдан авагч устгахад алдаа гарлаа",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting buyer:", error);
      toast({
        title: "Алдаа",
        description: "Худалдан авагч устгахад алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsDeletingBuyer(null);
    }
  };

  const handleEditBuyer = (buyer: Location) => {
    setEditingBuyer(buyer.id);
    setEditingBuyerLocationName(buyer.locationName);
    setEditingBuyerCompanyName(buyer.companyName);
  };

  const handleCancelEditBuyer = () => {
    setEditingBuyer(null);
    setEditingBuyerLocationName("");
    setEditingBuyerCompanyName("");
  };

  const handleDoubleClickBuyer = (buyer: Location) => {
    setSelectedBuyer(buyer);
    setInfoBuyerDialogOpen(true);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Худалдагч / Худалдан авагч</h1>
              <p className="text-sm text-muted-foreground">Байршил болон компанийн мэдээллийг удирдах</p>
            </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "seller" | "buyer")} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="seller">Худалдагч</TabsTrigger>
              <TabsTrigger value="buyer">Худалдан авагч</TabsTrigger>
            </TabsList>

            {/* Sellers Tab */}
            <TabsContent value="seller">
              <Card className="p-6">
                {/* Search and Add Section */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={sellerSearchQuery}
                      onChange={(e) => setSellerSearchQuery(e.target.value)}
                      placeholder="Байршлын нэр, компанийн нэрээр хайх..."
                      className="pl-10"
                    />
                    {sellerSearchQuery && (
                      <button
                        onClick={() => setSellerSearchQuery("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <Button
                    onClick={() => setAddSellerDialogOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Нэмэх
                  </Button>
                </div>

                {/* Table */}
                {filteredSellers.length > 0 ? (
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Байршлын нэр</TableHead>
                          <TableHead>Компанийн нэр</TableHead>
                          <TableHead className="w-[120px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSellers.map((seller) => (
                          <TableRow
                            key={seller.id}
                            onDoubleClick={() => handleDoubleClickSeller(seller)}
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                          >
                            <TableCell className="font-medium">
                              {editingSeller === seller.id ? (
                                <Input
                                  value={editingSellerLocationName}
                                  onChange={(e) => setEditingSellerLocationName(e.target.value)}
                                  className="w-full"
                                />
                              ) : (
                                seller.locationName
                              )}
                            </TableCell>
                            <TableCell>
                              {editingSeller === seller.id ? (
                                <Input
                                  value={editingSellerCompanyName}
                                  onChange={(e) => setEditingSellerCompanyName(e.target.value)}
                                  className="w-full"
                                />
                              ) : (
                                seller.companyName
                              )}
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              {editingSeller === seller.id ? (
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleUpdateSeller}
                                    disabled={isUpdatingSeller}
                                    className="h-8 w-8 p-0"
                                    title="Хадгалах"
                                  >
                                    {isUpdatingSeller ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      "✓"
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCancelEditSeller}
                                    className="h-8 w-8 p-0"
                                    title="Цуцлах"
                                  >
                                    ✕
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditSeller(seller)}
                                    disabled={isDeletingSeller === seller.id}
                                    className="h-8 w-8 p-0"
                                    title="Засах"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSellerToDelete(seller.id)}
                                    disabled={isDeletingSeller === seller.id}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Устгах"
                                  >
                                    {isDeletingSeller === seller.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <Store className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <p className="text-sm font-medium text-foreground mb-1">
                      {sellerSearchQuery ? "Хайлтын үр дүн олдсонгүй" : "Борлуулагч байхгүй байна"}
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      {sellerSearchQuery ? "Өөр утгаар хайж үзнэ үү" : "Дээрх 'Нэмэх' товч дараад нэмнэ үү"}
                    </p>
                    {!sellerSearchQuery && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAddSellerDialogOpen(true)}
                        className="gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Эхний борлуулагч нэмэх
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Buyers Tab */}
            <TabsContent value="buyer">
              <Card className="p-6">
                {/* Search and Add Section */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={buyerSearchQuery}
                      onChange={(e) => setBuyerSearchQuery(e.target.value)}
                      placeholder="Байршлын нэр, компанийн нэрээр хайх..."
                      className="pl-10"
                    />
                    {buyerSearchQuery && (
                      <button
                        onClick={() => setBuyerSearchQuery("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <Button
                    onClick={() => setAddBuyerDialogOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Нэмэх
                  </Button>
                </div>

                {/* Table */}
                {filteredBuyers.length > 0 ? (
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Байршлын нэр</TableHead>
                          <TableHead>Компанийн нэр</TableHead>
                          <TableHead className="w-[120px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBuyers.map((buyer) => (
                          <TableRow
                            key={buyer.id}
                            onDoubleClick={() => handleDoubleClickBuyer(buyer)}
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                          >
                            <TableCell className="font-medium">
                              {editingBuyer === buyer.id ? (
                                <Input
                                  value={editingBuyerLocationName}
                                  onChange={(e) => setEditingBuyerLocationName(e.target.value)}
                                  className="w-full"
                                />
                              ) : (
                                buyer.locationName
                              )}
                            </TableCell>
                            <TableCell>
                              {editingBuyer === buyer.id ? (
                                <Input
                                  value={editingBuyerCompanyName}
                                  onChange={(e) => setEditingBuyerCompanyName(e.target.value)}
                                  className="w-full"
                                />
                              ) : (
                                buyer.companyName
                              )}
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              {editingBuyer === buyer.id ? (
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleUpdateBuyer}
                                    disabled={isUpdatingBuyer}
                                    className="h-8 w-8 p-0"
                                    title="Хадгалах"
                                  >
                                    {isUpdatingBuyer ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      "✓"
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCancelEditBuyer}
                                    className="h-8 w-8 p-0"
                                    title="Цуцлах"
                                  >
                                    ✕
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditBuyer(buyer)}
                                    disabled={isDeletingBuyer === buyer.id}
                                    className="h-8 w-8 p-0"
                                    title="Засах"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setBuyerToDelete(buyer.id)}
                                    disabled={isDeletingBuyer === buyer.id}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Устгах"
                                  >
                                    {isDeletingBuyer === buyer.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <Store className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <p className="text-sm font-medium text-foreground mb-1">
                      {buyerSearchQuery ? "Хайлтын үр дүн олдсонгүй" : "Худалдан авагч байхгүй байна"}
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      {buyerSearchQuery ? "Өөр утгаар хайж үзнэ үү" : "Дээрх 'Нэмэх' товч дараад нэмнэ үү"}
                    </p>
                    {!buyerSearchQuery && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAddBuyerDialogOpen(true)}
                        className="gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Эхний худалдан авагч нэмэх
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>

          {/* Add Seller Dialog */}
          <Dialog open={addSellerDialogOpen} onOpenChange={setAddSellerDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Борлуулагч нэмэх</DialogTitle>
                <DialogDescription>
                  Шинэ борлуулагчийн мэдээллийг оруулна уу
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="seller-location-name">Байршлын нэр <span className="text-red-500">*</span></Label>
                  <Input
                    id="seller-location-name"
                    value={newSellerLocationName}
                    onChange={(e) => setNewSellerLocationName(e.target.value)}
                    placeholder="Байршлын нэр оруулах"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="seller-company-name">Компанийн нэр <span className="text-red-500">*</span></Label>
                  <Input
                    id="seller-company-name"
                    value={newSellerCompanyName}
                    onChange={(e) => setNewSellerCompanyName(e.target.value)}
                    placeholder="Компанийн нэр оруулах"
                    className="mt-2"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAddSellerDialogOpen(false);
                    setNewSellerLocationName("");
                    setNewSellerCompanyName("");
                  }}
                >
                  Цуцлах
                </Button>
                <Button
                  onClick={handleAddSeller}
                  disabled={isAddingSeller}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isAddingSeller ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Нэмж байна...
                    </>
                  ) : (
                    "Нэмэх"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Buyer Dialog */}
          <Dialog open={addBuyerDialogOpen} onOpenChange={setAddBuyerDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Худалдан авагч нэмэх</DialogTitle>
                <DialogDescription>
                  Шинэ худалдан авагчийн мэдээллийг оруулна уу
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="buyer-location-name">Байршлын нэр <span className="text-red-500">*</span></Label>
                  <Input
                    id="buyer-location-name"
                    value={newBuyerLocationName}
                    onChange={(e) => setNewBuyerLocationName(e.target.value)}
                    placeholder="Байршлын нэр оруулах"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="buyer-company-name">Компанийн нэр <span className="text-red-500">*</span></Label>
                  <Input
                    id="buyer-company-name"
                    value={newBuyerCompanyName}
                    onChange={(e) => setNewBuyerCompanyName(e.target.value)}
                    placeholder="Компанийн нэр оруулах"
                    className="mt-2"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAddBuyerDialogOpen(false);
                    setNewBuyerLocationName("");
                    setNewBuyerCompanyName("");
                  }}
                >
                  Цуцлах
                </Button>
                <Button
                  onClick={handleAddBuyer}
                  disabled={isAddingBuyer}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isAddingBuyer ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Нэмж байна...
                    </>
                  ) : (
                    "Нэмэх"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Info Dialogs */}
          <Dialog open={infoSellerDialogOpen} onOpenChange={setInfoSellerDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Борлуулагчийн мэдээлэл</DialogTitle>
              </DialogHeader>
              {selectedSeller && (
                <div className="space-y-2 py-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Байршлын нэр:</Label>
                    <p className="text-sm text-gray-900">{selectedSeller.locationName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Компанийн нэр:</Label>
                    <p className="text-sm text-gray-900">{selectedSeller.companyName}</p>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={infoBuyerDialogOpen} onOpenChange={setInfoBuyerDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Худалдан авагчийн мэдээлэл</DialogTitle>
              </DialogHeader>
              {selectedBuyer && (
                <div className="space-y-2 py-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Байршлын нэр:</Label>
                    <p className="text-sm text-gray-900">{selectedBuyer.locationName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700">Компанийн нэр:</Label>
                    <p className="text-sm text-gray-900">{selectedBuyer.companyName}</p>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialogs */}
          <AlertDialog open={sellerToDelete !== null} onOpenChange={(open) => !open && setSellerToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Борлуулагч устгах</AlertDialogTitle>
                <AlertDialogDescription>
                  Та энэ борлуулагчийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSellerToDelete(null)}>Цуцлах</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteSeller}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isDeletingSeller !== null}
                >
                  {isDeletingSeller ? <Loader2 className="w-4 h-4 animate-spin" /> : "Устгах"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={buyerToDelete !== null} onOpenChange={(open) => !open && setBuyerToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Худалдан авагч устгах</AlertDialogTitle>
                <AlertDialogDescription>
                  Та энэ худалдан авагчийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setBuyerToDelete(null)}>Цуцлах</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteBuyer}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isDeletingBuyer !== null}
                >
                  {isDeletingBuyer ? <Loader2 className="w-4 h-4 animate-spin" /> : "Устгах"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Duplicate Dialogs */}
          <AlertDialog open={duplicateSellerDialogOpen} onOpenChange={setDuplicateSellerDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Ижил нэртэй борлуулагч байна</AlertDialogTitle>
                <AlertDialogDescription>
                  "{duplicateSellerValue}" нэртэй борлуулагч аль хэдийн бүртгэгдсэн байна. Та үргэлжлүүлэх үү?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDuplicateSellerDialogOpen(false)}>Цуцлах</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    setDuplicateSellerDialogOpen(false);
                    handleAddSeller();
                  }}
                >
                  Үргэлжлүүлэх
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={duplicateBuyerDialogOpen} onOpenChange={setDuplicateBuyerDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Ижил нэртэй худалдан авагч байна</AlertDialogTitle>
                <AlertDialogDescription>
                  "{duplicateBuyerValue}" нэртэй худалдан авагч аль хэдийн бүртгэгдсэн байна. Та үргэлжлүүлэх үү?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDuplicateBuyerDialogOpen(false)}>Цуцлах</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    setDuplicateBuyerDialogOpen(false);
                    handleAddBuyer();
                  }}
                >
                  Үргэлжлүүлэх
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          </div>
        </main>
      </div>
    </div>
  );
}

