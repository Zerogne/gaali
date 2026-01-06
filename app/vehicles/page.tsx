"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Car, Plus, Edit, Trash2, Loader2, Search, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Vehicle {
  id: string;
  plateNumber: string;
  vehicleType?: string;
  make?: string;
  model?: string;
  year?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function VehiclesPage() {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleData, setVehicleData] = useState({
    plateNumber: "",
    vehicleType: "",
    make: "",
    model: "",
    year: "",
    notes: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  useEffect(() => {
    async function loadVehicles() {
      try {
        setIsLoading(true);
        // TODO: Replace with actual API endpoint when backend is ready
        // const response = await fetch("/api/vehicles");
        // if (response.ok) {
        //   const data = await response.json();
        //   setVehicles(data);
        // }
        setVehicles([]); // Placeholder for now
      } catch (error) {
        console.error("Error loading vehicles:", error);
        toast({
          title: "Алдаа",
          description: "Тээврийн хэрэгслийн мэдээлэл ачаалахад алдаа гарлаа",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadVehicles();
  }, [toast]);

  const handleAddVehicle = async () => {
    if (!vehicleData.plateNumber.trim()) {
      toast({
        title: "Алдаа",
        description: "Улсын дугаар оруулах шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    try {
      // TODO: Replace with actual API endpoint when backend is ready
      // const response = await fetch("/api/vehicles", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(vehicleData),
      // });
      // if (response.ok) {
      //   const newVehicle = await response.json();
      //   setVehicles([...vehicles, newVehicle]);
      //   setVehicleData({
      //     plateNumber: "",
      //     vehicleType: "",
      //     make: "",
      //     model: "",
      //     year: "",
      //     notes: "",
      //   });
      //   toast({
      //     title: "Амжилттай",
      //     description: "Тээврийн хэрэгсэл амжилттай нэмэгдлээ",
      //   });
      // }
      toast({
        title: "Мэдэгдэл",
        description: "Энэ функц хараахан бэлэн болоогүй байна",
      });
    } catch (error) {
      console.error("Error adding vehicle:", error);
      toast({
        title: "Алдаа",
        description: "Тээврийн хэрэгсэл нэмэхэд алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateVehicle = async () => {
    if (!editingVehicle || !vehicleData.plateNumber.trim()) {
      return;
    }

    setIsUpdating(true);
    try {
      // TODO: Replace with actual API endpoint when backend is ready
      // const response = await fetch(`/api/vehicles/${editingVehicle}`, {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(vehicleData),
      // });
      // if (response.ok) {
      //   const updatedVehicle = await response.json();
      //   setVehicles(vehicles.map((v) => (v.id === editingVehicle ? updatedVehicle : v)));
      //   setEditingVehicle(null);
      //   setVehicleData({
      //     plateNumber: "",
      //     vehicleType: "",
      //     make: "",
      //     model: "",
      //     year: "",
      //     notes: "",
      //   });
      //   toast({
      //     title: "Амжилттай",
      //     description: "Тээврийн хэрэгсэл амжилттай шинэчлэгдлээ",
      //   });
      // }
      toast({
        title: "Мэдэгдэл",
        description: "Энэ функц хараахан бэлэн болоогүй байна",
      });
    } catch (error) {
      console.error("Error updating vehicle:", error);
      toast({
        title: "Алдаа",
        description: "Тээврийн хэрэгсэл шинэчлэхэд алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;

    setIsDeleting(vehicleToDelete);
    try {
      // TODO: Replace with actual API endpoint when backend is ready
      // const response = await fetch(`/api/vehicles/${vehicleToDelete}`, {
      //   method: "DELETE",
      // });
      // if (response.ok) {
      //   setVehicles(vehicles.filter((v) => v.id !== vehicleToDelete));
      //   toast({
      //     title: "Амжилттай",
      //     description: "Тээврийн хэрэгсэл амжилттай устгагдлаа",
      //   });
      // }
      toast({
        title: "Мэдэгдэл",
        description: "Энэ функц хараахан бэлэн болоогүй байна",
      });
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast({
        title: "Алдаа",
        description: "Тээврийн хэрэгсэл устгахад алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
      setVehicleToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle.id);
    setVehicleData({
      plateNumber: vehicle.plateNumber || "",
      vehicleType: vehicle.vehicleType || "",
      make: vehicle.make || "",
      model: vehicle.model || "",
      year: vehicle.year?.toString() || "",
      notes: vehicle.notes || "",
    });
    setAddDialogOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingVehicle(null);
    setVehicleData({
      plateNumber: "",
      vehicleType: "",
      make: "",
      model: "",
      year: "",
      notes: "",
    });
    setAddDialogOpen(false);
  };

  // Filter vehicles based on search query
  const filteredVehicles = vehicles.filter((vehicle) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      vehicle.plateNumber.toLowerCase().includes(query) ||
      vehicle.vehicleType?.toLowerCase().includes(query) ||
      vehicle.make?.toLowerCase().includes(query) ||
      vehicle.model?.toLowerCase().includes(query) ||
      vehicle.id.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Car className="w-5 h-5" />
                Тээврийн хэрэгсэл
              </h2>
            </div>

            {/* Search Section */}
            <div className="flex items-center gap-2 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Улсын дугаар, төрөл, үйлдвэрлэгч, загвар, ID-аар хайх..."
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
                  setEditingVehicle(null);
                  setVehicleData({
                    plateNumber: "",
                    vehicleType: "",
                    make: "",
                    model: "",
                    year: "",
                    notes: "",
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
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredVehicles.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Улсын дугаар</TableHead>
                      <TableHead>Төрөл</TableHead>
                      <TableHead>Үйлдвэрлэгч</TableHead>
                      <TableHead>Загвар</TableHead>
                      <TableHead>Он</TableHead>
                      <TableHead className="w-[120px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-mono font-semibold">
                          {vehicle.plateNumber}
                        </TableCell>
                        <TableCell>{vehicle.vehicleType || "—"}</TableCell>
                        <TableCell>{vehicle.make || "—"}</TableCell>
                        <TableCell>{vehicle.model || "—"}</TableCell>
                        <TableCell>{vehicle.year || "—"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(vehicle)}
                              disabled={isDeleting === vehicle.id}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setVehicleToDelete(vehicle.id);
                                setDeleteDialogOpen(true);
                              }}
                              disabled={isDeleting === vehicle.id}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {isDeleting === vehicle.id ? (
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
              <p className="text-sm text-muted-foreground text-center py-8">
                {searchQuery ? "Хайлтын үр дүн олдсонгүй" : "Тээврийн хэрэгсэл байхгүй байна. Дээрх 'Нэмэх' товч дараад нэмнэ үү."}
              </p>
            )}
          </Card>

          {/* Add/Edit Vehicle Dialog */}
          <Dialog open={addDialogOpen || !!editingVehicle} onOpenChange={(open) => {
            if (!open) {
              setAddDialogOpen(false);
              handleCancelEdit();
            }
          }}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingVehicle ? "Тээврийн хэрэгсэл засах" : "Шинэ тээврийн хэрэгсэл нэмэх"}
                </DialogTitle>
                <DialogDescription>
                  {editingVehicle ? "Тээврийн хэрэгслийн мэдээллийг засах" : "Шинэ тээврийн хэрэгслийн мэдээлэл оруулах"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="dialog-plateNumber">Улсын дугаар *</Label>
                  <Input
                    id="dialog-plateNumber"
                    value={vehicleData.plateNumber}
                    onChange={(e) => setVehicleData({ ...vehicleData, plateNumber: e.target.value.toUpperCase() })}
                    placeholder="УБ1234"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dialog-vehicleType">Тээврийн хэрэгслийн төрөл</Label>
                  <Input
                    id="dialog-vehicleType"
                    value={vehicleData.vehicleType}
                    onChange={(e) => setVehicleData({ ...vehicleData, vehicleType: e.target.value })}
                    placeholder="Жишээ: Ачааны машин"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dialog-make">Үйлдвэрлэгч</Label>
                    <Input
                      id="dialog-make"
                      value={vehicleData.make}
                      onChange={(e) => setVehicleData({ ...vehicleData, make: e.target.value })}
                      placeholder="Жишээ: Mercedes"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dialog-model">Загвар</Label>
                    <Input
                      id="dialog-model"
                      value={vehicleData.model}
                      onChange={(e) => setVehicleData({ ...vehicleData, model: e.target.value })}
                      placeholder="Жишээ: Actros"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dialog-year">Он</Label>
                  <Input
                    id="dialog-year"
                    type="number"
                    value={vehicleData.year}
                    onChange={(e) => setVehicleData({ ...vehicleData, year: e.target.value })}
                    placeholder="2020"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dialog-notes">Тэмдэглэл</Label>
                  <Input
                    id="dialog-notes"
                    value={vehicleData.notes}
                    onChange={(e) => setVehicleData({ ...vehicleData, notes: e.target.value })}
                    placeholder="Нэмэлт мэдээлэл..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAddDialogOpen(false);
                    handleCancelEdit();
                  }}
                  disabled={isUpdating || isAdding}
                >
                  Цуцлах
                </Button>
                <Button
                  onClick={() => {
                    if (editingVehicle) {
                      handleUpdateVehicle();
                    } else {
                      handleAddVehicle();
                    }
                  }}
                  disabled={isUpdating || isAdding || !vehicleData.plateNumber.trim()}
                  className="gap-2"
                >
                  {isUpdating || isAdding ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {editingVehicle ? "Хадгалж байна..." : "Нэмж байна..."}
                    </>
                  ) : (
                    <>
                      {editingVehicle ? (
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
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Тээврийн хэрэгсэл устгах</AlertDialogTitle>
            <AlertDialogDescription>
              Та энэ тээврийн хэрэгслийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Цуцлах</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVehicle}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Устгах
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

