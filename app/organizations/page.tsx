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
import { useToast } from "@/hooks/use-toast";
import type { Organization } from "@/lib/types";
import { Building2, Edit, Loader2, Plus, Trash2 } from "lucide-react";
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
  };

  const handleCancelEdit = () => {
    setEditingOrg(null);
    setEditingOrgName("");
  };

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

            {/* Add Company Input */}
            <div className="flex gap-2 mb-6">
              <Input
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="Компанийн нэр оруулах"
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !isAdding &&
                    newCompanyName.trim()
                  ) {
                    handleAddCompany();
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={handleAddCompany}
                disabled={isAdding || !newCompanyName.trim()}
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

            {organizations.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Нэр</TableHead>
                      <TableHead className="w-[120px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizations.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell className="font-medium">
                          {editingOrg === org.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingOrgName}
                                onChange={(e) => setEditingOrgName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && editingOrgName.trim()) {
                                    handleSaveEdit(org.id);
                                  }
                                  if (e.key === "Escape") {
                                    handleCancelEdit();
                                  }
                                }}
                                className="flex-1"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSaveEdit(org.id)}
                                disabled={isUpdating || !editingOrgName.trim()}
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
                            org.name
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {editingOrg !== org.id && (
                              <>
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
                Компани байхгүй байна. Дээрх талбарт нэр оруулаад нэмнэ үү.
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
        </main>
      </div>
    </div>
  );
}
