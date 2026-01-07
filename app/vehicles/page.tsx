"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Car, Plus, Edit, Trash2, Loader2, Search, X, Truck, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FilterableSelect } from "@/components/ui/filterable-select";

interface Vehicle {
  id: string;
  plateNumber: string;
  registrationNumber?: string; // Улсын бүртгэлийн дугаар
  chassisNumber?: string; // Арлын дугаар
  trailerId?: string; // Чиргүүл
  countryOfManufacture?: string; // Үйлдвэрлэсэн улс
  make?: string; // Үйлдвэр
  model?: string; // Машины загвар
  color?: string; // Өнгө
  vehicleType?: string;
  year?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Trailer {
  id: string;
  plateNumber: string;
  trailerType?: string;
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
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [vehicleData, setVehicleData] = useState({
    plateNumber: "",
    registrationNumber: "",
    chassisNumber: "",
    trailerId: "",
    countryOfManufacture: "",
    make: "",
    model: "",
    color: "",
    vehicleType: "",
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
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    async function loadVehicles() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/vehicles");
        if (response.ok) {
          const data = await response.json();
          setVehicles(data);
        }
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

  useEffect(() => {
    async function loadTrailers() {
      try {
        const response = await fetch("/api/trailers");
        if (response.ok) {
          const data = await response.json();
          setTrailers(data);
        }
      } catch (error) {
        console.error("Error loading trailers:", error);
      }
    }
    loadTrailers();
  }, []);

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
      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vehicleData),
      });
      if (response.ok) {
        const newVehicle = await response.json();
        setVehicles([...vehicles, newVehicle]);
        setVehicleData({
          plateNumber: "",
          registrationNumber: "",
          chassisNumber: "",
          trailerId: "",
          countryOfManufacture: "",
          make: "",
          model: "",
          color: "",
          vehicleType: "",
          year: "",
          notes: "",
        });
        setAddDialogOpen(false);
        toast({
          title: "Амжилттай",
          description: "Тээврийн хэрэгсэл амжилттай нэмэгдлээ",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Алдаа",
          description: error.error || "Тээврийн хэрэгсэл нэмэхэд алдаа гарлаа",
          variant: "destructive",
        });
      }
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
      const response = await fetch(`/api/vehicles/${editingVehicle}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vehicleData),
      });
      if (response.ok) {
        const updatedVehicle = await response.json();
        setVehicles(vehicles.map((v) => (v.id === editingVehicle ? updatedVehicle : v)));
        setEditingVehicle(null);
        setVehicleData({
          plateNumber: "",
          registrationNumber: "",
          chassisNumber: "",
          trailerId: "",
          countryOfManufacture: "",
          make: "",
          model: "",
          color: "",
          vehicleType: "",
          year: "",
          notes: "",
        });
        setAddDialogOpen(false);
        toast({
          title: "Амжилттай",
          description: "Тээврийн хэрэгсэл амжилттай шинэчлэгдлээ",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Алдаа",
          description: error.error || "Тээврийн хэрэгсэл шинэчлэхэд алдаа гарлаа",
          variant: "destructive",
        });
      }
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
      const response = await fetch(`/api/vehicles/${vehicleToDelete}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setVehicles(vehicles.filter((v) => v.id !== vehicleToDelete));
        toast({
          title: "Амжилттай",
          description: "Тээврийн хэрэгсэл амжилттай устгагдлаа",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Алдаа",
          description: error.error || "Тээврийн хэрэгсэл устгахад алдаа гарлаа",
          variant: "destructive",
        });
      }
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
      registrationNumber: vehicle.registrationNumber || "",
      chassisNumber: vehicle.chassisNumber || "",
      trailerId: vehicle.trailerId || "",
      countryOfManufacture: vehicle.countryOfManufacture || "",
      make: vehicle.make || "",
      model: vehicle.model || "",
      color: vehicle.color || "",
      vehicleType: vehicle.vehicleType || "",
      year: vehicle.year?.toString() || "",
      notes: vehicle.notes || "",
    });
    setAddDialogOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingVehicle(null);
    setVehicleData({
      plateNumber: "",
      registrationNumber: "",
      chassisNumber: "",
      trailerId: "",
      countryOfManufacture: "",
      make: "",
      model: "",
      color: "",
      vehicleType: "",
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

  const handleDoubleClickVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setInfoDialogOpen(true);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Тээврийн хэрэгсэл</h1>
              <p className="text-sm text-muted-foreground">Тээврийн хэрэгслийн мэдээллийг удирдах</p>
            </div>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                        <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-foreground">Тээврийн хэрэгсэл</h2>
                        <p className="text-sm text-muted-foreground">
                          Нийт: {vehicles.length} {vehicles.length === 1 ? "хэрэгсэл" : "хэрэгсэл"}
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
                          registrationNumber: "",
                          chassisNumber: "",
                          trailerId: "",
                          countryOfManufacture: "",
                    make: "",
                    model: "",
                          color: "",
                          vehicleType: "",
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
                    <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredVehicles.length > 0 ? (
                    <div className="border rounded-lg overflow-x-auto">
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
                            <TableRow 
                              key={vehicle.id}
                              onDoubleClick={() => handleDoubleClickVehicle(vehicle)}
                              className="cursor-pointer hover:bg-muted/50 transition-colors"
                            >
                        <TableCell className="font-mono font-semibold">
                          {vehicle.plateNumber}
                        </TableCell>
                        <TableCell>{vehicle.vehicleType || "—"}</TableCell>
                        <TableCell>{vehicle.make || "—"}</TableCell>
                        <TableCell>{vehicle.model || "—"}</TableCell>
                        <TableCell>{vehicle.year || "—"}</TableCell>
                              <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(vehicle)}
                              disabled={isDeleting === vehicle.id}
                              className="h-8 w-8 p-0"
                                    title="Засах"
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
                                    title="Устгах"
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
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                      <Car className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                      <p className="text-sm font-medium text-foreground mb-1">
                        {searchQuery ? "Хайлтын үр дүн олдсонгүй" : "Тээврийн хэрэгсэл байхгүй байна"}
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        {searchQuery ? "Өөр утгаар хайж үзнэ үү" : "Дээрх 'Нэмэх' товч дараад нэмнэ үү"}
                      </p>
                      {!searchQuery && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingVehicle(null);
                            setVehicleData({
                              plateNumber: "",
                              vehicleType: "",
                              make: "",
                              model: "",
                              registrationNumber: "",
                              chassisNumber: "",
                              trailerId: "",
                              countryOfManufacture: "",
                              color: "",
                              year: "",
                              notes: "",
                            });
                            setAddDialogOpen(true);
                          }}
                          className="gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Эхний хэрэгсэл нэмэх
                        </Button>
                      )}
                    </div>
            )}
          </Card>
          </div>

          {/* Add/Edit Vehicle Dialog */}
          <Dialog 
            open={addDialogOpen || !!editingVehicle} 
            onOpenChange={(open) => {
            if (!open) {
              setAddDialogOpen(false);
              handleCancelEdit();
            }
            }}
          >
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>
                  {editingVehicle ? "Тээврийн хэрэгсэл засах" : "Шинэ тээврийн хэрэгсэл нэмэх"}
                </DialogTitle>
                <DialogDescription>
                  {editingVehicle ? "Тээврийн хэрэгслийн мэдээллийг засах" : "Шинэ тээврийн хэрэгслийн мэдээлэл оруулах"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 overflow-y-auto flex-1">
                <div className="space-y-2">
                  <Label htmlFor="dialog-plateNumber">Улсын дугаар *</Label>
                  <Input
                    id="dialog-plateNumber"
                    value={vehicleData.plateNumber}
                    onChange={(e) => setVehicleData({ ...vehicleData, plateNumber: e.target.value.toUpperCase() })}
                    placeholder="1234ААА"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dialog-registrationNumber">Улсын бүртгэлийн дугаар</Label>
                  <Input
                    id="dialog-registrationNumber"
                    value={vehicleData.registrationNumber}
                    onChange={(e) => setVehicleData({ ...vehicleData, registrationNumber: e.target.value })}
                    placeholder="Улсын бүртгэлийн дугаар"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dialog-chassisNumber">Арлын дугаар</Label>
                  <Input
                    id="dialog-chassisNumber"
                    value={vehicleData.chassisNumber}
                    onChange={(e) => setVehicleData({ ...vehicleData, chassisNumber: e.target.value })}
                    placeholder="Арлын дугаар"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dialog-trailerId">Чиргүүл</Label>
                  <FilterableSelect
                    options={trailers.map(t => ({ value: t.id, label: t.plateNumber }))}
                    value={vehicleData.trailerId}
                    onValueChange={(value) => setVehicleData({ ...vehicleData, trailerId: value })}
                    placeholder="Чиргүүл сонгох..."
                    emptyMessage="Чиргүүл олдсонгүй"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dialog-countryOfManufacture">Үйлдвэрлэсэн улс</Label>
                    <Input
                      id="dialog-countryOfManufacture"
                      value={vehicleData.countryOfManufacture}
                      onChange={(e) => setVehicleData({ ...vehicleData, countryOfManufacture: e.target.value })}
                      placeholder="Жишээ: Герман"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dialog-make">Үйлдвэр</Label>
                    <Input
                      id="dialog-make"
                      value={vehicleData.make}
                      onChange={(e) => setVehicleData({ ...vehicleData, make: e.target.value })}
                      placeholder="Жишээ: Mercedes"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dialog-model">Машины загвар</Label>
                    <Input
                      id="dialog-model"
                      value={vehicleData.model}
                      onChange={(e) => setVehicleData({ ...vehicleData, model: e.target.value })}
                      placeholder="Жишээ: Actros"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dialog-color">Өнгө</Label>
                    <Input
                      id="dialog-color"
                      value={vehicleData.color}
                      onChange={(e) => setVehicleData({ ...vehicleData, color: e.target.value })}
                      placeholder="Жишээ: Цагаан"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dialog-vehicleType">Тээврийн хэрэгслийн төрөл</Label>
                    <Input
                      id="dialog-vehicleType"
                      value={vehicleData.vehicleType}
                      onChange={(e) => setVehicleData({ ...vehicleData, vehicleType: e.target.value })}
                      placeholder="Жишээ: Ачааны машин"
                    />
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dialog-notes">Тэмдэглэл</Label>
                  <Textarea
                    id="dialog-notes"
                    value={vehicleData.notes}
                    onChange={(e) => setVehicleData({ ...vehicleData, notes: e.target.value })}
                    placeholder="Нэмэлт мэдээлэл..."
                    rows={3}
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

          {/* Vehicle Info Dialog */}
          <Dialog 
            open={infoDialogOpen} 
            onOpenChange={setInfoDialogOpen}
          >
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Тээврийн хэрэгслийн мэдээлэл</DialogTitle>
              </DialogHeader>
              {selectedVehicle && (
                <div className="space-y-4 py-4">
                  <div>
                    <Label className="text-sm font-semibold">Улсын дугаар:</Label>
                    <p className="mt-1 text-sm font-mono font-semibold">{selectedVehicle.plateNumber}</p>
                  </div>
                  {selectedVehicle.registrationNumber && (
                    <div>
                      <Label className="text-sm font-semibold">Улсын бүртгэлийн дугаар:</Label>
                      <p className="mt-1 text-sm">{selectedVehicle.registrationNumber}</p>
                    </div>
                  )}
                  {selectedVehicle.chassisNumber && (
                    <div>
                      <Label className="text-sm font-semibold">Арлын дугаар:</Label>
                      <p className="mt-1 text-sm">{selectedVehicle.chassisNumber}</p>
                    </div>
                  )}
                  {selectedVehicle.trailerId && (
                    <div>
                      <Label className="text-sm font-semibold">Чиргүүл:</Label>
                      <p className="mt-1 text-sm">
                        {trailers.find(t => t.id === selectedVehicle.trailerId)?.plateNumber || selectedVehicle.trailerId}
                      </p>
                    </div>
                  )}
                  {selectedVehicle.countryOfManufacture && (
                    <div>
                      <Label className="text-sm font-semibold">Үйлдвэрлэсэн улс:</Label>
                      <p className="mt-1 text-sm">{selectedVehicle.countryOfManufacture}</p>
                    </div>
                  )}
                  {selectedVehicle.make && (
                    <div>
                      <Label className="text-sm font-semibold">Үйлдвэр:</Label>
                      <p className="mt-1 text-sm">{selectedVehicle.make}</p>
                    </div>
                  )}
                  {selectedVehicle.model && (
                    <div>
                      <Label className="text-sm font-semibold">Машины загвар:</Label>
                      <p className="mt-1 text-sm">{selectedVehicle.model}</p>
                    </div>
                  )}
                  {selectedVehicle.color && (
                    <div>
                      <Label className="text-sm font-semibold">Өнгө:</Label>
                      <p className="mt-1 text-sm">{selectedVehicle.color}</p>
                    </div>
                  )}
                  {selectedVehicle.vehicleType && (
                    <div>
                      <Label className="text-sm font-semibold">Тээврийн хэрэгслийн төрөл:</Label>
                      <p className="mt-1 text-sm">{selectedVehicle.vehicleType}</p>
                    </div>
                  )}
                  {selectedVehicle.year && (
                    <div>
                      <Label className="text-sm font-semibold">Он:</Label>
                      <p className="mt-1 text-sm">{selectedVehicle.year}</p>
                    </div>
                  )}
                  {selectedVehicle.notes && (
                    <div>
                      <Label className="text-sm font-semibold">Тэмдэглэл:</Label>
                      <p className="mt-1 text-sm">{selectedVehicle.notes}</p>
                    </div>
                  )}
                </div>
              )}
              <DialogFooter>
                <Button onClick={() => setInfoDialogOpen(false)}>
                  Хаах
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

        </main>
      </div>
    </div>
  );
}

