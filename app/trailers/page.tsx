"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Truck, Plus, Edit, Trash2, Loader2, Search, X, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Trailer {
  id: string;
  plateNumber: string;
  ownerName: string;
  ownerId: string;
  ownerPhone: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function TrailersPage() {
  const { toast } = useToast();
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [trailerData, setTrailerData] = useState({
    plateNumber: "",
    ownerName: "",
    ownerId: "",
    ownerPhone: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [trailerToDelete, setTrailerToDelete] = useState<string | null>(null);
  const [editingTrailer, setEditingTrailer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedTrailer, setSelectedTrailer] = useState<Trailer | null>(null);

  useEffect(() => {
    async function loadTrailers() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/trailers");
        if (response.ok) {
          const data = await response.json();
          setTrailers(data);
        }
      } catch (error) {
        console.error("Error loading trailers:", error);
        toast({
          title: "Алдаа",
          description: "Чиргүүлийн мэдээлэл ачаалахад алдаа гарлаа",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadTrailers();
  }, [toast]);

  const handleAddTrailer = async () => {
    if (!trailerData.plateNumber.trim()) {
      toast({
        title: "Алдаа",
        description: "Чиргүүлийн улсын дугаар оруулах шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    if (!trailerData.ownerName.trim()) {
      toast({
        title: "Алдаа",
        description: "Эзэмшигчийн нэр оруулах шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    if (!trailerData.ownerId.trim()) {
      toast({
        title: "Алдаа",
        description: "Эзэмшигчийн регистер оруулах шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    if (!trailerData.ownerPhone.trim()) {
      toast({
        title: "Алдаа",
        description: "Эзэмшигчийн утасны дугаар оруулах шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch("/api/trailers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trailerData),
      });
      if (response.ok) {
        const newTrailer = await response.json();
        setTrailers([...trailers, newTrailer]);
        setTrailerData({
          plateNumber: "",
          ownerName: "",
          ownerId: "",
          ownerPhone: "",
        });
        setAddDialogOpen(false);
        toast({
          title: "Амжилттай",
          description: "Чиргүүл амжилттай нэмэгдлээ",
        });
      } else {
        const errorData = await response.json().catch(() => ({ error: "Failed to add trailer" }));
        throw new Error(errorData.error || "Failed to add trailer");
      }
    } catch (error) {
      console.error("Error adding trailer:", error);
      toast({
        title: "Алдаа",
        description: error instanceof Error ? error.message : "Чиргүүл нэмэхэд алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateTrailer = async () => {
    if (!editingTrailer || !trailerData.plateNumber.trim()) {
      return;
    }

    if (!trailerData.ownerName.trim()) {
      toast({
        title: "Алдаа",
        description: "Эзэмшигчийн нэр оруулах шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    if (!trailerData.ownerId.trim()) {
      toast({
        title: "Алдаа",
        description: "Эзэмшигчийн регистер оруулах шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    if (!trailerData.ownerPhone.trim()) {
      toast({
        title: "Алдаа",
        description: "Эзэмшигчийн утасны дугаар оруулах шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/trailers/${editingTrailer}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trailerData),
      });
      if (response.ok) {
        const updatedTrailer = await response.json();
        setTrailers(trailers.map((t) => (t.id === editingTrailer ? updatedTrailer : t)));
        setEditingTrailer(null);
        setTrailerData({
          plateNumber: "",
          ownerName: "",
          ownerId: "",
          ownerPhone: "",
        });
        setAddDialogOpen(false);
        toast({
          title: "Амжилттай",
          description: "Чиргүүл амжилттай шинэчлэгдлээ",
        });
      } else {
        const errorData = await response.json().catch(() => ({ error: "Failed to update trailer" }));
        throw new Error(errorData.error || "Failed to update trailer");
      }
    } catch (error) {
      console.error("Error updating trailer:", error);
      toast({
        title: "Алдаа",
        description: error instanceof Error ? error.message : "Чиргүүл шинэчлэхэд алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTrailer = async () => {
    if (!trailerToDelete) return;

    setIsDeleting(trailerToDelete);
    try {
      const response = await fetch(`/api/trailers/${trailerToDelete}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setTrailers(trailers.filter((t) => t.id !== trailerToDelete));
        toast({
          title: "Амжилттай",
          description: "Чиргүүл амжилттай устгагдлаа",
        });
      } else {
        const errorData = await response.json().catch(() => ({ error: "Failed to delete trailer" }));
        throw new Error(errorData.error || "Failed to delete trailer");
      }
    } catch (error) {
      console.error("Error deleting trailer:", error);
      toast({
        title: "Алдаа",
        description: error instanceof Error ? error.message : "Чиргүүл устгахад алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
      setTrailerToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleEditTrailer = (trailer: Trailer) => {
    setEditingTrailer(trailer.id);
    setTrailerData({
      plateNumber: trailer.plateNumber || "",
      ownerName: trailer.ownerName || "",
      ownerId: trailer.ownerId || "",
      ownerPhone: trailer.ownerPhone || "",
    });
    setAddDialogOpen(true);
  };

  const handleCancelEditTrailer = () => {
    setEditingTrailer(null);
    setTrailerData({
      plateNumber: "",
      ownerName: "",
      ownerId: "",
      ownerPhone: "",
    });
    setAddDialogOpen(false);
  };

  const handleDoubleClickTrailer = (trailer: Trailer) => {
    setSelectedTrailer(trailer);
    setInfoDialogOpen(true);
  };

  // Filter trailers based on search query
  const filteredTrailers = trailers.filter((trailer) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      trailer.plateNumber.toLowerCase().includes(query) ||
      trailer.ownerName.toLowerCase().includes(query) ||
      trailer.ownerId.toLowerCase().includes(query) ||
      trailer.ownerPhone.toLowerCase().includes(query) ||
      trailer.id.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Чиргүүл</h1>
              <p className="text-sm text-muted-foreground">Чиргүүлийн мэдээллийг удирдах</p>
            </div>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                    <Truck className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Чиргүүл</h2>
                    <p className="text-sm text-muted-foreground">
                      Нийт: {trailers.length} {trailers.length === 1 ? "чиргүүл" : "чиргүүл"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Search Section */}
              <div className="flex items-center gap-2 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Улсын дугаар, эзэмшигчийн нэр, регистер, утасны дугаараар хайх..."
                    className="pl-10"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <Button
                  onClick={() => {
                    setEditingTrailer(null);
                    setTrailerData({
                      plateNumber: "",
                      ownerName: "",
                      ownerId: "",
                      ownerPhone: "",
                    });
                    setAddDialogOpen(true);
                  }}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Нэмэх
                </Button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredTrailers.length > 0 ? (
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Улсын дугаар</TableHead>
                        <TableHead>Эзэмшигчийн нэр</TableHead>
                        <TableHead>Регистер</TableHead>
                        <TableHead>Утасны дугаар</TableHead>
                        <TableHead className="w-[120px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTrailers.map((trailer) => (
                        <TableRow 
                          key={trailer.id}
                          onDoubleClick={() => handleDoubleClickTrailer(trailer)}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          <TableCell className="font-mono font-semibold">
                            {trailer.plateNumber}
                          </TableCell>
                          <TableCell>{trailer.ownerName}</TableCell>
                          <TableCell>{trailer.ownerId}</TableCell>
                          <TableCell>{trailer.ownerPhone}</TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditTrailer(trailer)}
                                disabled={isDeleting === trailer.id}
                                className="h-8 w-8 p-0"
                                title="Засах"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setTrailerToDelete(trailer.id);
                                  setDeleteDialogOpen(true);
                                }}
                                disabled={isDeleting === trailer.id}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Устгах"
                              >
                                {isDeleting === trailer.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Truck className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-sm font-medium text-foreground mb-1">
                    {searchQuery ? "Хайлтын үр дүн олдсонгүй" : "Чиргүүл байхгүй байна"}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    {searchQuery ? "Өөр утгаар хайж үзнэ үү" : "Дээрх 'Нэмэх' товч дараад нэмнэ үү"}
                  </p>
                  {!searchQuery && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingTrailer(null);
                        setTrailerData({
                          plateNumber: "",
                          ownerName: "",
                          ownerId: "",
                          ownerPhone: "",
                        });
                        setAddDialogOpen(true);
                      }}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Эхний чиргүүл нэмэх
                    </Button>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Trailer Info Dialog */}
          <Dialog 
            open={infoDialogOpen} 
            onOpenChange={setInfoDialogOpen}
          >
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Чиргүүлийн мэдээлэл</DialogTitle>
              </DialogHeader>
              {selectedTrailer && (
                <div className="space-y-4 py-4">
                  <div>
                    <Label className="text-sm font-semibold">Улсын дугаар:</Label>
                    <p className="mt-1 text-sm font-mono font-semibold">{selectedTrailer.plateNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Эзэмшигчийн нэр:</Label>
                    <p className="mt-1 text-sm">{selectedTrailer.ownerName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Регистер:</Label>
                    <p className="mt-1 text-sm">{selectedTrailer.ownerId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Утасны дугаар:</Label>
                    <p className="mt-1 text-sm">{selectedTrailer.ownerPhone}</p>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={() => setInfoDialogOpen(false)}>
                  Хаах
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add/Edit Trailer Dialog */}
          <Dialog 
            open={addDialogOpen || !!editingTrailer} 
            onOpenChange={(open) => {
              if (!open) {
                setAddDialogOpen(false);
                handleCancelEditTrailer();
              }
            }}
          >
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingTrailer ? "Чиргүүл засах" : "Шинэ чиргүүл нэмэх"}
                </DialogTitle>
                <DialogDescription>
                  {editingTrailer ? "Чиргүүлийн мэдээллийг засах" : "Шинэ чиргүүлийн мэдээлэл оруулах"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="trailer-dialog-plateNumber">Чиргүүлийн улсын дугаар *</Label>
                  <Input
                    id="trailer-dialog-plateNumber"
                    value={trailerData.plateNumber}
                    onChange={(e) => setTrailerData({ ...trailerData, plateNumber: e.target.value.toUpperCase() })}
                    placeholder="1234ААА"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trailer-dialog-ownerName">Эзэмшигчийн нэр *</Label>
                  <Input
                    id="trailer-dialog-ownerName"
                    value={trailerData.ownerName}
                    onChange={(e) => setTrailerData({ ...trailerData, ownerName: e.target.value })}
                    placeholder="Эзэмшигчийн нэр оруулах"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trailer-dialog-ownerId">Эзэмшигчийн регистер *</Label>
                  <Input
                    id="trailer-dialog-ownerId"
                    value={trailerData.ownerId}
                    onChange={(e) => setTrailerData({ ...trailerData, ownerId: e.target.value })}
                    placeholder="Регистрийн дугаар оруулах"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trailer-dialog-ownerPhone">Эзэмшигчийн утасны дугаар *</Label>
                  <Input
                    id="trailer-dialog-ownerPhone"
                    value={trailerData.ownerPhone}
                    onChange={(e) => setTrailerData({ ...trailerData, ownerPhone: e.target.value })}
                    placeholder="Утасны дугаар оруулах"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAddDialogOpen(false);
                    handleCancelEditTrailer();
                  }}
                  disabled={isUpdating || isAdding}
                >
                  Цуцлах
                </Button>
                <Button
                  onClick={() => {
                    if (editingTrailer) {
                      handleUpdateTrailer();
                    } else {
                      handleAddTrailer();
                    }
                  }}
                  disabled={isUpdating || isAdding || !trailerData.plateNumber.trim() || !trailerData.ownerName.trim() || !trailerData.ownerId.trim() || !trailerData.ownerPhone.trim()}
                  className="gap-2"
                >
                  {isUpdating || isAdding ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {editingTrailer ? "Хадгалж байна..." : "Нэмж байна..."}
                    </>
                  ) : (
                    <>
                      {editingTrailer ? (
                        <>
                          <Edit className="w-4 h-4" />
                          Засах
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Нэмэх
                        </>
                      )}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog 
            open={deleteDialogOpen} 
            onOpenChange={setDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Чиргүүл устгах</AlertDialogTitle>
                <AlertDialogDescription>
                  Та энэ чиргүүлийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteTrailer}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Устгах
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </div>
  );
}

