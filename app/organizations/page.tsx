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
import { useToast } from "@/hooks/use-toast";
import type { Organization } from "@/lib/types";
import { Building2, Edit, Loader2, Plus, Trash2, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { findSimilarValue } from "@/lib/utils/string-similarity";

export default function OrganizationsPage() {
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<string | null>(null);
  const [editingOrg, setEditingOrg] = useState<string | null>(null);
  const [editingOrgName, setEditingOrgName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [duplicateValue, setDuplicateValue] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  useEffect(() => {
    async function loadOrganizations() {
      // Load all organizations (shared pool)
      try {
        const response = await fetch("/api/organizations");
        if (response.ok) {
          const data = await response.json();
          setOrganizations(data);
        }
      } catch (error) {
        console.error("Error loading organizations:", error);
      }
    }
    loadOrganizations();

    // Listen for refresh events
    const handleRefresh = () => {
      loadOrganizations();
    };
    window.addEventListener("refreshDropdownData", handleRefresh);
    return () => {
      window.removeEventListener("refreshDropdownData", handleRefresh);
    };
  }, []);

  const handleAddCompany = async () => {
    if (!newCompanyName.trim()) {
      toast({
        title: "Error",
        description: "Company name is required",
        variant: "destructive",
      });
      return;
    }

    // Check for similar/duplicate organizations
    const existingNames = organizations.map(o => o.name);
    const similarOrg = findSimilarValue(newCompanyName.trim(), existingNames);
    
    if (similarOrg) {
      setDuplicateValue(similarOrg);
      setDuplicateDialogOpen(true);
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newCompanyName.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save company");
      }

      toast({
        title: "Амжилттай",
        description: "Компани амжилттай нэмэгдлээ",
      });

      setNewCompanyName("");
      setAddDialogOpen(false);

      // Dispatch custom event to refresh all sections
      window.dispatchEvent(new CustomEvent("refreshDropdownData"));

      // Reload organizations
      const reloadResponse = await fetch("/api/organizations");
      if (reloadResponse.ok) {
        const data = await reloadResponse.json();
        setOrganizations(data);
      }
    } catch (error) {
      toast({
        title: "Алдаа",
        description:
          error instanceof Error
            ? error.message
            : "Компани хадгалахад алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditClick = (org: Organization) => {
    setEditingOrg(org.id);
    setEditingOrgName(org.name);
    setAddDialogOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingOrg(null);
    setEditingOrgName("");
    setAddDialogOpen(false);
  };

  // Filter organizations based on search query
  const filteredOrganizations = organizations.filter((org) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      org.name.toLowerCase().includes(query) ||
      org.id.toLowerCase().includes(query)
    );
  });

  const handleSaveEdit = async (orgId: string) => {
    if (!editingOrgName.trim()) {
      toast({
        title: "Error",
        description: "Company name is required",
        variant: "destructive",
      });
      return;
    }

    if (!editingOrg) return;

    // Check for similar/duplicate organizations (excluding current organization)
    const existingNames = organizations
      .filter(o => o.id !== orgId)
      .map(o => o.name);
    const similarOrg = findSimilarValue(editingOrgName.trim(), existingNames);
    
    if (similarOrg) {
      setDuplicateValue(similarOrg);
      setDuplicateDialogOpen(true);
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/organizations/${orgId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editingOrgName.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update company");
      }

      toast({
        title: "Амжилттай",
        description: "Компани амжилттай засагдлаа",
      });

      setEditingOrg(null);
      setEditingOrgName("");
      setAddDialogOpen(false);

      // Dispatch custom event to refresh all sections
      window.dispatchEvent(new CustomEvent("refreshDropdownData"));

      // Reload organizations
      const reloadResponse = await fetch("/api/organizations");
      if (reloadResponse.ok) {
        const data = await reloadResponse.json();
        setOrganizations(data);
      }
    } catch (error) {
      toast({
        title: "Алдаа",
        description: "Компани засахад алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = (orgId: string) => {
    setOrgToDelete(orgId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!orgToDelete) return;

    setIsDeleting(orgToDelete);
    setDeleteDialogOpen(false);
    try {
      const response = await fetch(`/api/organizations/${orgToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to delete company" }));
        throw new Error(errorData.error || "Failed to delete company");
      }

      toast({
        title: "Амжилттай",
        description: "Компани амжилттай устгагдлаа",
      });

      // Dispatch custom event to refresh all sections
      window.dispatchEvent(new CustomEvent("refreshDropdownData"));

      // Reload organizations
      const reloadResponse = await fetch("/api/organizations");
      if (reloadResponse.ok) {
        const data = await reloadResponse.json();
        setOrganizations(data);
      }
    } catch (error) {
      toast({
        title: "Алдаа",
        description: "Компани устгахад алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
      setOrgToDelete(null);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          {/* Companies */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Companies
              </h2>
            </div>

            {/* Search Section */}
            <div className="flex items-center gap-2 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Нэр, ID-аар хайх..."
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
                  setEditingOrg(null);
                  setEditingOrgName("");
                  setNewCompanyName("");
                  setAddDialogOpen(true);
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Нэмэх
              </Button>
            </div>

            {filteredOrganizations.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Нэр</TableHead>
                      <TableHead className="w-[120px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrganizations.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell className="font-medium">
                          {org.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(org)}
                              disabled={isDeleting === org.id}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(org.id)}
                              disabled={isDeleting === org.id}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {isDeleting === org.id ? (
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
                {searchQuery ? "Хайлтын үр дүн олдсонгүй" : "Компани байхгүй байна. Дээрх 'Нэмэх' товч дараад нэмнэ үү."}
              </p>
            )}
          </Card>

          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Компани устгах</AlertDialogTitle>
                <AlertDialogDescription>
                  Та энэ компанийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
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
                <AlertDialogTitle>Давхардсан компани</AlertDialogTitle>
                <AlertDialogDescription>
                  Ижил төстэй компани аль хэдийн байна: <strong>"{duplicateValue}"</strong>. Өөр нэр ашиглана уу.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => setDuplicateDialogOpen(false)}>
                  OK
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Add/Edit Organization Dialog */}
          <Dialog open={addDialogOpen || !!editingOrg} onOpenChange={(open) => {
            if (!open) {
              setAddDialogOpen(false);
              handleCancelEdit();
            }
          }}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingOrg ? "Тээврийн байгууллага засах" : "Шинэ тээврийн байгууллага нэмэх"}
                </DialogTitle>
                <DialogDescription>
                  {editingOrg ? "Тээврийн байгууллагын нэрийг засах" : "Шинэ тээврийн байгууллагын нэр оруулах"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="dialog-org-name">Нэр *</Label>
                  <Input
                    id="dialog-org-name"
                    value={editingOrg ? editingOrgName : newCompanyName}
                    onChange={(e) => {
                      if (editingOrg) {
                        setEditingOrgName(e.target.value);
                      } else {
                        setNewCompanyName(e.target.value);
                      }
                    }}
                    placeholder="Тээврийн байгууллагын нэр оруулах"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (editingOrg ? editingOrgName : newCompanyName).trim()) {
                        if (editingOrg) {
                          handleSaveEdit(editingOrg);
                        } else {
                          handleAddCompany();
                        }
                      }
                    }}
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
                    if (editingOrg) {
                      handleSaveEdit(editingOrg);
                    } else {
                      handleAddCompany();
                    }
                  }}
                  disabled={isUpdating || isAdding || !(editingOrg ? editingOrgName : newCompanyName).trim()}
                  className="gap-2"
                >
                  {isUpdating || isAdding ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {editingOrg ? "Хадгалж байна..." : "Нэмж байна..."}
                    </>
                  ) : (
                    <>
                      {editingOrg ? (
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
    </div>
  );
}
