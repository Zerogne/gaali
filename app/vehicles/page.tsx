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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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
    vehicleType: "",
    make: "",
    model: "",
    year: "",
    notes: "",
  });
  const [trailerData, setTrailerData] = useState({
    plateNumber: "",
    trailerType: "",
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
  const [editingTrailer, setEditingTrailer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [trailerSearchQuery, setTrailerSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addTrailerDialogOpen, setAddTrailerDialogOpen] = useState(false);
  const [isAddingTrailer, setIsAddingTrailer] = useState(false);
  const [isUpdatingTrailer, setIsUpdatingTrailer] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedTrailer, setSelectedTrailer] = useState<Trailer | null>(null);
  const [activeTab, setActiveTab] = useState("vehicles");

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
        toast({
          title: "Алдаа",
          description: "Чиргүүлийн мэдээлэл ачаалахад алдаа гарлаа",
          variant: "destructive",
        });
      }
    }
    loadTrailers();
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

  // Filter trailers based on search query
  const filteredTrailers = trailers.filter((trailer) => {
    if (!trailerSearchQuery.trim()) return true;
    const query = trailerSearchQuery.toLowerCase();
    return (
      trailer.plateNumber.toLowerCase().includes(query) ||
      trailer.trailerType?.toLowerCase().includes(query) ||
      trailer.make?.toLowerCase().includes(query) ||
      trailer.model?.toLowerCase().includes(query) ||
      trailer.id.toLowerCase().includes(query)
    );
  });

  // Trailer handlers
  const handleAddTrailer = async () => {
    if (!trailerData.plateNumber.trim()) {
      toast({
        title: "Алдаа",
        description: "Улсын дугаар оруулах шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    setIsAddingTrailer(true);
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
          trailerType: "",
          make: "",
          model: "",
          year: "",
          notes: "",
        });
        setAddTrailerDialogOpen(false);
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
      setIsAddingTrailer(false);
    }
  };

  const handleUpdateTrailer = async () => {
    if (!editingTrailer || !trailerData.plateNumber.trim()) {
      return;
    }

    setIsUpdatingTrailer(true);
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
          trailerType: "",
          make: "",
          model: "",
          year: "",
          notes: "",
        });
        setAddTrailerDialogOpen(false);
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
      setIsUpdatingTrailer(false);
    }
  };

  const handleDeleteTrailer = async () => {
    if (!vehicleToDelete) return;

    setIsDeleting(vehicleToDelete);
    try {
      const response = await fetch(`/api/trailers/${vehicleToDelete}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setTrailers(trailers.filter((t) => t.id !== vehicleToDelete));
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
      setVehicleToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleEditTrailer = (trailer: Trailer) => {
    setEditingTrailer(trailer.id);
    setTrailerData({
      plateNumber: trailer.plateNumber || "",
      trailerType: trailer.trailerType || "",
      make: trailer.make || "",
      model: trailer.model || "",
      year: trailer.year?.toString() || "",
      notes: trailer.notes || "",
    });
    setAddTrailerDialogOpen(true);
  };

  const handleCancelEditTrailer = () => {
    setEditingTrailer(null);
    setTrailerData({
      plateNumber: "",
      trailerType: "",
      make: "",
      model: "",
      year: "",
      notes: "",
    });
    setAddTrailerDialogOpen(false);
  };

  const handleDoubleClickVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setSelectedTrailer(null);
    setInfoDialogOpen(true);
  };

  const handleDoubleClickTrailer = (trailer: Trailer) => {
    setSelectedTrailer(trailer);
    setSelectedVehicle(null);
    setInfoDialogOpen(true);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Тээврийн хэрэгсэл ба чиргүүл</h1>
              <p className="text-sm text-muted-foreground">Тээврийн хэрэгсэл болон чиргүүлийн мэдээллийг удирдах</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                <TabsTrigger value="vehicles" className="gap-2">
                  <Car className="w-4 h-4" />
                  Тээврийн хэрэгсэл
                  <Badge variant="secondary" className="ml-1">
                    {vehicles.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="trailers" className="gap-2">
                  <Truck className="w-4 h-4" />
                  Чиргүүл
                  <Badge variant="secondary" className="ml-1">
                    {trailers.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="vehicles" className="mt-0">
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
              </TabsContent>

              <TabsContent value="trailers" className="mt-0">
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
                        value={trailerSearchQuery}
                        onChange={(e) => setTrailerSearchQuery(e.target.value)}
                        placeholder="Улсын дугаар, төрөл, үйлдвэрлэгч, загвар, ID-аар хайх..."
                        className="pl-10"
                      />
                      {trailerSearchQuery && (
                        <button
                          onClick={() => setTrailerSearchQuery("")}
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
                          trailerType: "",
                          make: "",
                          model: "",
                          year: "",
                          notes: "",
                        });
                        setAddTrailerDialogOpen(true);
                      }}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Нэмэх
                    </Button>
                  </div>

                  {filteredTrailers.length > 0 ? (
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
                          {filteredTrailers.map((trailer) => (
                            <TableRow 
                              key={trailer.id}
                              onDoubleClick={() => handleDoubleClickTrailer(trailer)}
                              className="cursor-pointer hover:bg-muted/50 transition-colors"
                            >
                              <TableCell className="font-mono font-semibold">
                                {trailer.plateNumber}
                              </TableCell>
                              <TableCell>{trailer.trailerType || "—"}</TableCell>
                              <TableCell>{trailer.make || "—"}</TableCell>
                              <TableCell>{trailer.model || "—"}</TableCell>
                              <TableCell>{trailer.year || "—"}</TableCell>
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
                                      setVehicleToDelete(trailer.id);
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
                        {trailerSearchQuery ? "Хайлтын үр дүн олдсонгүй" : "Чиргүүл байхгүй байна"}
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        {trailerSearchQuery ? "Өөр утгаар хайж үзнэ үү" : "Дээрх 'Нэмэх' товч дараад нэмнэ үү"}
                      </p>
                      {!trailerSearchQuery && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingTrailer(null);
                            setTrailerData({
                              plateNumber: "",
                              trailerType: "",
                              make: "",
                              model: "",
                              year: "",
                              notes: "",
                            });
                            setAddTrailerDialogOpen(true);
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
              </TabsContent>
            </Tabs>
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

          {/* Vehicle/Trailer Info Dialog */}
          <Dialog 
            open={infoDialogOpen} 
            onOpenChange={setInfoDialogOpen}
          >
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedVehicle ? "Тээврийн хэрэгслийн мэдээлэл" : "Чиргүүлийн мэдээлэл"}
                </DialogTitle>
              </DialogHeader>
              {selectedVehicle && (
                <div className="space-y-4 py-4">
                  <div>
                    <Label className="text-sm font-semibold">Улсын дугаар:</Label>
                    <p className="mt-1 text-sm font-mono font-semibold">{selectedVehicle.plateNumber}</p>
                  </div>
                  {selectedVehicle.vehicleType && (
                    <div>
                      <Label className="text-sm font-semibold">Төрөл:</Label>
                      <p className="mt-1 text-sm">{selectedVehicle.vehicleType}</p>
                    </div>
                  )}
                  {selectedVehicle.make && (
                    <div>
                      <Label className="text-sm font-semibold">Үйлдвэрлэгч:</Label>
                      <p className="mt-1 text-sm">{selectedVehicle.make}</p>
                    </div>
                  )}
                  {selectedVehicle.model && (
                    <div>
                      <Label className="text-sm font-semibold">Загвар:</Label>
                      <p className="mt-1 text-sm">{selectedVehicle.model}</p>
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
              {selectedTrailer && (
                <div className="space-y-4 py-4">
                  <div>
                    <Label className="text-sm font-semibold">Улсын дугаар:</Label>
                    <p className="mt-1 text-sm font-mono font-semibold">{selectedTrailer.plateNumber}</p>
                  </div>
                  {selectedTrailer.trailerType && (
                    <div>
                      <Label className="text-sm font-semibold">Төрөл:</Label>
                      <p className="mt-1 text-sm">{selectedTrailer.trailerType}</p>
                    </div>
                  )}
                  {selectedTrailer.make && (
                    <div>
                      <Label className="text-sm font-semibold">Үйлдвэрлэгч:</Label>
                      <p className="mt-1 text-sm">{selectedTrailer.make}</p>
                    </div>
                  )}
                  {selectedTrailer.model && (
                    <div>
                      <Label className="text-sm font-semibold">Загвар:</Label>
                      <p className="mt-1 text-sm">{selectedTrailer.model}</p>
                    </div>
                  )}
                  {selectedTrailer.year && (
                    <div>
                      <Label className="text-sm font-semibold">Он:</Label>
                      <p className="mt-1 text-sm">{selectedTrailer.year}</p>
                    </div>
                  )}
                  {selectedTrailer.notes && (
                    <div>
                      <Label className="text-sm font-semibold">Тэмдэглэл:</Label>
                      <p className="mt-1 text-sm">{selectedTrailer.notes}</p>
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

          {/* Add/Edit Trailer Dialog */}
          <Dialog 
            open={addTrailerDialogOpen || !!editingTrailer} 
            onOpenChange={(open) => {
              if (!open) {
                setAddTrailerDialogOpen(false);
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
              <Label htmlFor="trailer-dialog-plateNumber">Улсын дугаар *</Label>
              <Input
                id="trailer-dialog-plateNumber"
                value={trailerData.plateNumber}
                onChange={(e) => setTrailerData({ ...trailerData, plateNumber: e.target.value.toUpperCase() })}
                placeholder="УБ1234"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trailer-dialog-trailerType">Чиргүүлийн төрөл</Label>
              <Input
                id="trailer-dialog-trailerType"
                value={trailerData.trailerType}
                onChange={(e) => setTrailerData({ ...trailerData, trailerType: e.target.value })}
                placeholder="Жишээ: Ачааны чиргүүл"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trailer-dialog-make">Үйлдвэрлэгч</Label>
                <Input
                  id="trailer-dialog-make"
                  value={trailerData.make}
                  onChange={(e) => setTrailerData({ ...trailerData, make: e.target.value })}
                  placeholder="Жишээ: Schmitz"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trailer-dialog-model">Загвар</Label>
                <Input
                  id="trailer-dialog-model"
                  value={trailerData.model}
                  onChange={(e) => setTrailerData({ ...trailerData, model: e.target.value })}
                  placeholder="Жишээ: Cargobull"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="trailer-dialog-year">Он</Label>
              <Input
                id="trailer-dialog-year"
                type="number"
                value={trailerData.year}
                onChange={(e) => setTrailerData({ ...trailerData, year: e.target.value })}
                placeholder="2020"
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trailer-dialog-notes">Тэмдэглэл</Label>
              <Textarea
                id="trailer-dialog-notes"
                value={trailerData.notes}
                onChange={(e) => setTrailerData({ ...trailerData, notes: e.target.value })}
                placeholder="Нэмэлт мэдээлэл..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddTrailerDialogOpen(false);
                handleCancelEditTrailer();
              }}
              disabled={isUpdatingTrailer || isAddingTrailer}
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
              disabled={isUpdatingTrailer || isAddingTrailer || !trailerData.plateNumber.trim()}
              className="gap-2"
            >
              {isUpdatingTrailer || isAddingTrailer ? (
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
            <AlertDialogTitle>
              {vehicles.find(v => v.id === vehicleToDelete) 
                ? "Тээврийн хэрэгсэл устгах" 
                : "Чиргүүл устгах"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {vehicles.find(v => v.id === vehicleToDelete)
                ? "Та энэ тээврийн хэрэгслийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй."
                : "Та энэ чиргүүлийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Цуцлах</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (vehicles.find(v => v.id === vehicleToDelete)) {
                  handleDeleteVehicle();
                } else {
                  handleDeleteTrailer();
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Устгах
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
          </AlertDialog>

          {/* Vehicle/Trailer Info Dialog */}
          <Dialog 
            open={infoDialogOpen} 
            onOpenChange={setInfoDialogOpen}
          >
            <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedVehicle ? "Тээврийн хэрэгслийн мэдээлэл" : "Чиргүүлийн мэдээлэл"}
            </DialogTitle>
          </DialogHeader>
          {selectedVehicle && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-sm font-semibold">Улсын дугаар:</Label>
                <p className="mt-1 text-sm font-mono font-semibold">{selectedVehicle.plateNumber}</p>
              </div>
              {selectedVehicle.vehicleType && (
                <div>
                  <Label className="text-sm font-semibold">Төрөл:</Label>
                  <p className="mt-1 text-sm">{selectedVehicle.vehicleType}</p>
                </div>
              )}
              {selectedVehicle.make && (
                <div>
                  <Label className="text-sm font-semibold">Үйлдвэрлэгч:</Label>
                  <p className="mt-1 text-sm">{selectedVehicle.make}</p>
                </div>
              )}
              {selectedVehicle.model && (
                <div>
                  <Label className="text-sm font-semibold">Загвар:</Label>
                  <p className="mt-1 text-sm">{selectedVehicle.model}</p>
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
          {selectedTrailer && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-sm font-semibold">Улсын дугаар:</Label>
                <p className="mt-1 text-sm font-mono font-semibold">{selectedTrailer.plateNumber}</p>
              </div>
              {selectedTrailer.trailerType && (
                <div>
                  <Label className="text-sm font-semibold">Төрөл:</Label>
                  <p className="mt-1 text-sm">{selectedTrailer.trailerType}</p>
                </div>
              )}
              {selectedTrailer.make && (
                <div>
                  <Label className="text-sm font-semibold">Үйлдвэрлэгч:</Label>
                  <p className="mt-1 text-sm">{selectedTrailer.make}</p>
                </div>
              )}
              {selectedTrailer.model && (
                <div>
                  <Label className="text-sm font-semibold">Загвар:</Label>
                  <p className="mt-1 text-sm">{selectedTrailer.model}</p>
                </div>
              )}
              {selectedTrailer.year && (
                <div>
                  <Label className="text-sm font-semibold">Он:</Label>
                  <p className="mt-1 text-sm">{selectedTrailer.year}</p>
                </div>
              )}
              {selectedTrailer.notes && (
                <div>
                  <Label className="text-sm font-semibold">Тэмдэглэл:</Label>
                  <p className="mt-1 text-sm">{selectedTrailer.notes}</p>
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
        </main>
      </div>
    </div>
  );
}

