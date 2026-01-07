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
import type { TransportCompany, Organization } from "@/lib/types";
import { Building2, Edit, Loader2, Plus, Trash2, Search, X, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { findSimilarValue } from "@/lib/utils/string-similarity";

export default function OrganizationsPage() {
  const { toast } = useToast();
  
  // Transport Companies State
  const [transportCompanies, setTransportCompanies] = useState<TransportCompany[]>([]);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyId, setNewCompanyId] = useState("");
  const [newContract, setNewContract] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [isDeletingCompany, setIsDeletingCompany] = useState<string | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);
  const [editingCompany, setEditingCompany] = useState<string | null>(null);
  const [editingCompanyName, setEditingCompanyName] = useState("");
  const [editingCompanyId, setEditingCompanyId] = useState("");
  const [editingContract, setEditingContract] = useState("");
  const [editingPhone, setEditingPhone] = useState("");
  const [isUpdatingCompany, setIsUpdatingCompany] = useState(false);
  const [duplicateCompanyDialogOpen, setDuplicateCompanyDialogOpen] = useState(false);
  const [duplicateCompanyValue, setDuplicateCompanyValue] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [addCompanyDialogOpen, setAddCompanyDialogOpen] = useState(false);
  const [addOrgDialogOpen, setAddOrgDialogOpen] = useState(false);
  const [infoCompanyDialogOpen, setInfoCompanyDialogOpen] = useState(false);
  const [infoOrgDialogOpen, setInfoOrgDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<TransportCompany | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  // Organizations State
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgId, setNewOrgId] = useState("");
  const [newOrgContract, setNewOrgContract] = useState("");
  const [newOrgPhone, setNewOrgPhone] = useState("");
  const [isAddingOrg, setIsAddingOrg] = useState(false);
  const [isDeletingOrg, setIsDeletingOrg] = useState<string | null>(null);
  const [orgToDelete, setOrgToDelete] = useState<string | null>(null);
  const [editingOrg, setEditingOrg] = useState<string | null>(null);
  const [editingOrgName, setEditingOrgName] = useState("");
  const [editingOrgId, setEditingOrgId] = useState("");
  const [editingOrgContract, setEditingOrgContract] = useState("");
  const [editingOrgPhone, setEditingOrgPhone] = useState("");
  const [isUpdatingOrg, setIsUpdatingOrg] = useState(false);
  const [duplicateOrgDialogOpen, setDuplicateOrgDialogOpen] = useState(false);
  const [duplicateOrgValue, setDuplicateOrgValue] = useState<string | null>(null);

  // Load Transport Companies
  useEffect(() => {
    async function loadCompanies() {
      try {
        const response = await fetch("/api/transport-companies");
        if (response.ok) {
          const data = await response.json();
          setTransportCompanies(data);
        }
      } catch (error) {
        console.error("Error loading transport companies:", error);
      }
    }
    loadCompanies();

    const handleRefresh = () => {
      loadCompanies();
    };
    window.addEventListener("refreshDropdownData", handleRefresh);
    return () => {
      window.removeEventListener("refreshDropdownData", handleRefresh);
    };
  }, []);

  // Load Organizations
  useEffect(() => {
    async function loadOrganizations() {
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

    const handleRefresh = () => {
      loadOrganizations();
    };
    window.addEventListener("refreshDropdownData", handleRefresh);
    return () => {
      window.removeEventListener("refreshDropdownData", handleRefresh);
    };
  }, []);

  // Transport Company Handlers
  const handleAddCompany = async () => {
    if (!newCompanyName.trim()) {
      toast({
        title: "Алдаа",
        description: "Нэр шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    if (!newCompanyId.trim()) {
      toast({
        title: "Алдаа",
        description: "Регистер шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    if (!newContract.trim()) {
      toast({
        title: "Алдаа",
        description: "Гадаад худалдааны гэрээ шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    if (!newPhone.trim()) {
      toast({
        title: "Алдаа",
        description: "Утасны дугаар шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    const existingNames = transportCompanies.map(c => c.name);
    const similarCompany = findSimilarValue(newCompanyName.trim(), existingNames);
    
    if (similarCompany) {
      setDuplicateCompanyValue(similarCompany);
      setDuplicateCompanyDialogOpen(true);
      return;
    }

    setIsAddingCompany(true);
    try {
      const response = await fetch("/api/transport-companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name: newCompanyName.trim(),
          companyId: newCompanyId.trim(),
          contract: newContract.trim(),
          phone: newPhone.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to save transport company" }));
        throw new Error(errorData.error || "Failed to save transport company");
      }

      toast({
        title: "Амжилттай",
        description: "Тээврийн компани амжилттай нэмэгдлээ",
      });

      setNewCompanyName("");
      setNewCompanyId("");
      setNewContract("");
      setNewPhone("");
      setAddCompanyDialogOpen(false);

      window.dispatchEvent(new CustomEvent("refreshDropdownData"));

      const reloadResponse = await fetch("/api/transport-companies");
      if (reloadResponse.ok) {
        const data = await reloadResponse.json();
        setTransportCompanies(data);
      }
    } catch (error) {
      toast({
        title: "Алдаа",
        description: error instanceof Error ? error.message : "Тээврийн компани хадгалахад алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsAddingCompany(false);
    }
  };

  const handleEditCompanyClick = (company: TransportCompany) => {
    setEditingCompany(company.id);
    setEditingCompanyName(company.name);
    setEditingCompanyId(company.companyId || "");
    setEditingContract(company.contract || "");
    setEditingPhone(company.phone || "");
    setAddCompanyDialogOpen(true);
  };

  const handleCancelEditCompany = () => {
    setEditingCompany(null);
    setEditingCompanyName("");
    setEditingCompanyId("");
    setEditingContract("");
    setEditingPhone("");
    setAddCompanyDialogOpen(false);
  };

  const handleDoubleClickCompany = (company: TransportCompany) => {
    setSelectedCompany(company);
    setInfoCompanyDialogOpen(true);
  };

  // Combined filtered data
  type CombinedItem = (TransportCompany & { itemType: "company" }) | (Organization & { itemType: "org" });
  
  const allItems: CombinedItem[] = [
    ...transportCompanies.map(c => ({ ...c, itemType: "company" as const })),
    ...organizations.map(o => ({ ...o, itemType: "org" as const }))
  ];

  const filteredItems = allItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query) ||
      item.companyId?.toLowerCase().includes(query) ||
      item.contract?.toLowerCase().includes(query) ||
      item.phone?.toLowerCase().includes(query)
    );
  });

  const handleSaveEditCompany = async (companyId: string) => {
    if (!editingCompanyName.trim()) {
      toast({
        title: "Алдаа",
        description: "Нэр шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    if (!editingCompanyId.trim()) {
      toast({
        title: "Алдаа",
        description: "Регистер шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    if (!editingContract.trim()) {
      toast({
        title: "Алдаа",
        description: "Гадаад худалдааны гэрээ шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    if (!editingPhone.trim()) {
      toast({
        title: "Алдаа",
        description: "Утасны дугаар шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    const existingNames = transportCompanies
      .filter(c => c.id !== companyId)
      .map(c => c.name);
    const similarCompany = findSimilarValue(editingCompanyName.trim(), existingNames);
    
    if (similarCompany) {
      setDuplicateCompanyValue(similarCompany);
      setDuplicateCompanyDialogOpen(true);
      return;
    }

    setIsUpdatingCompany(true);
    try {
      const response = await fetch(`/api/transport-companies/${companyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name: editingCompanyName.trim(),
          companyId: editingCompanyId.trim(),
          contract: editingContract.trim(),
          phone: editingPhone.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to update transport company" }));
        throw new Error(errorData.error || "Failed to update transport company");
      }

      toast({
        title: "Амжилттай",
        description: "Тээврийн компани амжилттай засагдлаа",
      });

      setEditingCompany(null);
      setEditingCompanyName("");
      setEditingCompanyId("");
      setEditingContract("");
      setEditingPhone("");
      setAddCompanyDialogOpen(false);

      window.dispatchEvent(new CustomEvent("refreshDropdownData"));

      const reloadResponse = await fetch("/api/transport-companies");
      if (reloadResponse.ok) {
        const data = await reloadResponse.json();
        setTransportCompanies(data);
      }
    } catch (error) {
      toast({
        title: "Алдаа",
        description: error instanceof Error ? error.message : "Тээврийн компани засахад алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingCompany(false);
    }
  };

  const handleDeleteCompanyClick = (companyId: string) => {
    setCompanyToDelete(companyId);
  };

  const handleDeleteCompanyConfirm = async () => {
    if (!companyToDelete) return;

    setIsDeletingCompany(companyToDelete);
    try {
      const response = await fetch(`/api/transport-companies/${companyToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to delete transport company" }));
        throw new Error(errorData.error || "Failed to delete transport company");
      }

      toast({
        title: "Амжилттай",
        description: "Тээврийн компани амжилттай устгагдлаа",
      });

      window.dispatchEvent(new CustomEvent("refreshDropdownData"));

      const reloadResponse = await fetch("/api/transport-companies");
      if (reloadResponse.ok) {
        const data = await reloadResponse.json();
        setTransportCompanies(data);
      }
    } catch (error) {
      toast({
        title: "Алдаа",
        description: "Тээврийн компани устгахад алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsDeletingCompany(null);
      setCompanyToDelete(null);
    }
  };

  // Organization Handlers
  const handleAddOrg = async () => {
    if (!newOrgName.trim()) {
      toast({
        title: "Алдаа",
        description: "Нэр шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    if (!newOrgId.trim()) {
      toast({
        title: "Алдаа",
        description: "Регистер шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    if (!newOrgContract.trim()) {
      toast({
        title: "Алдаа",
        description: "Гадаад худалдааны гэрээ шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    if (!newOrgPhone.trim()) {
      toast({
        title: "Алдаа",
        description: "Утасны дугаар шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    const existingNames = organizations.map(o => o.name);
    const similarOrg = findSimilarValue(newOrgName.trim(), existingNames);
    
    if (similarOrg) {
      setDuplicateOrgValue(similarOrg);
      setDuplicateOrgDialogOpen(true);
      return;
    }

    setIsAddingOrg(true);
    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newOrgName.trim(),
          companyId: newOrgId.trim(),
          contract: newOrgContract.trim(),
          phone: newOrgPhone.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to save company" }));
        throw new Error(errorData.error || "Failed to save company");
      }

      toast({
        title: "Амжилттай",
        description: "Компани амжилттай нэмэгдлээ",
      });

      setNewOrgName("");
      setNewOrgId("");
      setNewOrgContract("");
      setNewOrgPhone("");
      setAddOrgDialogOpen(false);

      window.dispatchEvent(new CustomEvent("refreshDropdownData"));

      const reloadResponse = await fetch("/api/organizations");
      if (reloadResponse.ok) {
        const data = await reloadResponse.json();
        setOrganizations(data);
      }
    } catch (error) {
      toast({
        title: "Алдаа",
        description: error instanceof Error ? error.message : "Компани хадгалахад алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsAddingOrg(false);
    }
  };

  const handleEditOrgClick = (org: Organization) => {
    setEditingOrg(org.id);
    setEditingOrgName(org.name);
    setEditingOrgId(org.companyId || "");
    setEditingOrgContract(org.contract || "");
    setEditingOrgPhone(org.phone || "");
    setAddOrgDialogOpen(true);
  };

  const handleCancelEditOrg = () => {
    setEditingOrg(null);
    setEditingOrgName("");
    setEditingOrgId("");
    setEditingOrgContract("");
    setEditingOrgPhone("");
    setAddOrgDialogOpen(false);
  };

  const handleDoubleClickOrg = (org: Organization) => {
    setSelectedOrg(org);
    setInfoOrgDialogOpen(true);
  };


  const handleSaveEditOrg = async (orgId: string) => {
    if (!editingOrgName.trim()) {
      toast({
        title: "Алдаа",
        description: "Нэр шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    if (!editingOrgId.trim()) {
      toast({
        title: "Алдаа",
        description: "Регистер шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    if (!editingOrgContract.trim()) {
      toast({
        title: "Алдаа",
        description: "Гадаад худалдааны гэрээ шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    if (!editingOrgPhone.trim()) {
      toast({
        title: "Алдаа",
        description: "Утасны дугаар шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    if (!editingOrg) return;

    const existingNames = organizations
      .filter(o => o.id !== orgId)
      .map(o => o.name);
    const similarOrg = findSimilarValue(editingOrgName.trim(), existingNames);
    
    if (similarOrg) {
      setDuplicateOrgValue(similarOrg);
      setDuplicateOrgDialogOpen(true);
      return;
    }

    setIsUpdatingOrg(true);
    try {
      const response = await fetch(`/api/organizations/${orgId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editingOrgName.trim(),
          companyId: editingOrgId.trim(),
          contract: editingOrgContract.trim(),
          phone: editingOrgPhone.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to update company" }));
        throw new Error(errorData.error || "Failed to update company");
      }

      toast({
        title: "Амжилттай",
        description: "Компани амжилттай засагдлаа",
      });

      setEditingOrg(null);
      setEditingOrgName("");
      setEditingOrgId("");
      setEditingOrgContract("");
      setEditingOrgPhone("");
      setAddOrgDialogOpen(false);

      window.dispatchEvent(new CustomEvent("refreshDropdownData"));

      const reloadResponse = await fetch("/api/organizations");
      if (reloadResponse.ok) {
        const data = await reloadResponse.json();
        setOrganizations(data);
      }
    } catch (error) {
      toast({
        title: "Алдаа",
        description: error instanceof Error ? error.message : "Компани засахад алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingOrg(false);
    }
  };

  const handleDeleteOrgClick = (orgId: string) => {
    setOrgToDelete(orgId);
  };

  const handleDeleteOrgConfirm = async () => {
    if (!orgToDelete) return;

    setIsDeletingOrg(orgToDelete);
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

      window.dispatchEvent(new CustomEvent("refreshDropdownData"));

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
      setIsDeletingOrg(null);
      setOrgToDelete(null);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Компани ба Байгууллага
              </h2>
            </div>

            {/* Search and Add Section */}
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
                  setEditingCompany(null);
                  setEditingOrg(null);
                  setEditingCompanyName("");
                  setEditingCompanyId("");
                  setEditingContract("");
                  setEditingPhone("");
                  setEditingOrgName("");
                  setEditingOrgId("");
                  setEditingOrgContract("");
                  setEditingOrgPhone("");
                  setNewCompanyName("");
                  setNewCompanyId("");
                  setNewContract("");
                  setNewPhone("");
                  setNewOrgName("");
                  setNewOrgId("");
                  setNewOrgContract("");
                  setNewOrgPhone("");
                  setAddCompanyDialogOpen(true);
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Нэмэх
              </Button>
            </div>

            {/* Combined Table */}
            {filteredItems.length > 0 ? (
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Нэр</TableHead>
                      <TableHead>Регистер</TableHead>
                      <TableHead>Гадаад худалдааны гэрээ</TableHead>
                      <TableHead>Утасны дугаар</TableHead>
                      <TableHead className="w-[120px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow 
                        key={`${item.itemType}-${item.id}`}
                        onDoubleClick={() => {
                          if (item.itemType === "company") {
                            handleDoubleClickCompany(item);
                          } else {
                            handleDoubleClickOrg(item);
                          }
                        }}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>
                          {item.companyId || "-"}
                        </TableCell>
                        <TableCell>
                          {item.contract || "-"}
                        </TableCell>
                        <TableCell>
                          {item.phone || "-"}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (item.itemType === "company") {
                                  handleEditCompanyClick(item);
                                } else {
                                  handleEditOrgClick(item);
                                }
                              }}
                              disabled={
                                (item.itemType === "company" && isDeletingCompany === item.id) ||
                                (item.itemType === "org" && isDeletingOrg === item.id)
                              }
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (item.itemType === "company") {
                                  handleDeleteCompanyClick(item.id);
                                } else {
                                  handleDeleteOrgClick(item.id);
                                }
                              }}
                              disabled={
                                (item.itemType === "company" && isDeletingCompany === item.id) ||
                                (item.itemType === "org" && isDeletingOrg === item.id)
                              }
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {(item.itemType === "company" && isDeletingCompany === item.id) ||
                              (item.itemType === "org" && isDeletingOrg === item.id) ? (
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

          {/* Transport Company Delete Dialog */}
          <AlertDialog open={!!companyToDelete} onOpenChange={(open) => {
            if (!open) setCompanyToDelete(null);
          }}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Тээврийн компани устгах</AlertDialogTitle>
                <AlertDialogDescription>
                  Та энэ тээврийн компанийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setCompanyToDelete(null)}>Цуцлах</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteCompanyConfirm}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                >
                  Устгах
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Organization Delete Dialog */}
          <AlertDialog open={!!orgToDelete} onOpenChange={(open) => {
            if (!open) setOrgToDelete(null);
          }}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Компани устгах</AlertDialogTitle>
                <AlertDialogDescription>
                  Та энэ компанийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setOrgToDelete(null)}>Цуцлах</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteOrgConfirm}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                >
                  Устгах
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Transport Company Duplicate Dialog */}
          <AlertDialog open={duplicateCompanyDialogOpen} onOpenChange={setDuplicateCompanyDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Давхардсан тээврийн компани</AlertDialogTitle>
                <AlertDialogDescription>
                  Ижил төстэй тээврийн компани аль хэдийн байна: <strong>"{duplicateCompanyValue}"</strong>. Өөр нэр ашиглана уу.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => setDuplicateCompanyDialogOpen(false)}>
                  OK
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Organization Duplicate Dialog */}
          <AlertDialog open={duplicateOrgDialogOpen} onOpenChange={setDuplicateOrgDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Давхардсан компани</AlertDialogTitle>
                <AlertDialogDescription>
                  Ижил төстэй компани аль хэдийн байна: <strong>"{duplicateOrgValue}"</strong>. Өөр нэр ашиглана уу.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => setDuplicateOrgDialogOpen(false)}>
                  OK
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Transport Company Add/Edit Dialog */}
          <Dialog open={addCompanyDialogOpen || !!editingCompany} onOpenChange={(open) => {
            if (!open) {
              setAddCompanyDialogOpen(false);
              handleCancelEditCompany();
            }
          }}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingCompany ? "Тээврийн компани засах" : "Шинэ тээврийн компани нэмэх"}
                </DialogTitle>
                <DialogDescription>
                  {editingCompany ? "Тээврийн компанийн мэдээллийг засах" : "Шинэ тээврийн компанийн мэдээлэл оруулах"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="dialog-company-name">Нэр *</Label>
                  <Input
                    id="dialog-company-name"
                    value={editingCompany ? editingCompanyName : newCompanyName}
                    onChange={(e) => {
                      if (editingCompany) {
                        setEditingCompanyName(e.target.value);
                      } else {
                        setNewCompanyName(e.target.value);
                      }
                    }}
                    placeholder="Тээврийн компанийн нэр оруулах"
                  />
                </div>
                <div>
                  <Label htmlFor="dialog-company-id">Регистер *</Label>
                  <Input
                    id="dialog-company-id"
                    value={editingCompany ? editingCompanyId : newCompanyId}
                    onChange={(e) => {
                      if (editingCompany) {
                        setEditingCompanyId(e.target.value);
                      } else {
                        setNewCompanyId(e.target.value);
                      }
                    }}
                    placeholder="Регистрийн дугаар оруулах"
                  />
                </div>
                <div>
                  <Label htmlFor="dialog-company-contract">Гадаад худалдааны гэрээ *</Label>
                  <Input
                    id="dialog-company-contract"
                    value={editingCompany ? editingContract : newContract}
                    onChange={(e) => {
                      if (editingCompany) {
                        setEditingContract(e.target.value);
                      } else {
                        setNewContract(e.target.value);
                      }
                    }}
                    placeholder="Гадаад худалдааны гэрээний дугаар оруулах"
                  />
                </div>
                <div>
                  <Label htmlFor="dialog-company-phone">Утасны дугаар *</Label>
                  <Input
                    id="dialog-company-phone"
                    value={editingCompany ? editingPhone : newPhone}
                    onChange={(e) => {
                      if (editingCompany) {
                        setEditingPhone(e.target.value);
                      } else {
                        setNewPhone(e.target.value);
                      }
                    }}
                    placeholder="Утасны дугаар оруулах"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAddCompanyDialogOpen(false);
                    handleCancelEditCompany();
                  }}
                  disabled={isUpdatingCompany || isAddingCompany}
                >
                  Цуцлах
                </Button>
                <Button
                  onClick={() => {
                    if (editingCompany) {
                      handleSaveEditCompany(editingCompany);
                    } else {
                      handleAddCompany();
                    }
                  }}
                  disabled={
                    isUpdatingCompany || 
                    isAddingCompany || 
                    !(editingCompany ? editingCompanyName : newCompanyName).trim() ||
                    !(editingCompany ? editingCompanyId : newCompanyId).trim() ||
                    !(editingCompany ? editingContract : newContract).trim() ||
                    !(editingCompany ? editingPhone : newPhone).trim()
                  }
                  className="gap-2"
                >
                  {isUpdatingCompany || isAddingCompany ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {editingCompany ? "Хадгалж байна..." : "Нэмж байна..."}
                    </>
                  ) : (
                    <>
                      {editingCompany ? (
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

          {/* Organization Add/Edit Dialog */}
          <Dialog open={addOrgDialogOpen || !!editingOrg} onOpenChange={(open) => {
            if (!open) {
              setAddOrgDialogOpen(false);
              handleCancelEditOrg();
            }
          }}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingOrg ? "Байгууллага засах" : "Шинэ байгууллага нэмэх"}
                </DialogTitle>
                <DialogDescription>
                  {editingOrg ? "Байгууллагын мэдээллийг засах" : "Шинэ байгууллагын мэдээлэл оруулах"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="dialog-org-name">Нэр *</Label>
                  <Input
                    id="dialog-org-name"
                    value={editingOrg ? editingOrgName : newOrgName}
                    onChange={(e) => {
                      if (editingOrg) {
                        setEditingOrgName(e.target.value);
                      } else {
                        setNewOrgName(e.target.value);
                      }
                    }}
                    placeholder="Компанийн нэр оруулах"
                  />
                </div>
                <div>
                  <Label htmlFor="dialog-org-id">Регистер *</Label>
                  <Input
                    id="dialog-org-id"
                    value={editingOrg ? editingOrgId : newOrgId}
                    onChange={(e) => {
                        if (editingOrg) {
                        setEditingOrgId(e.target.value);
                        } else {
                        setNewOrgId(e.target.value);
                      }
                    }}
                    placeholder="Регистрийн дугаар оруулах"
                  />
                </div>
                <div>
                  <Label htmlFor="dialog-org-contract">Гадаад худалдааны гэрээ *</Label>
                  <Input
                    id="dialog-org-contract"
                    value={editingOrg ? editingOrgContract : newOrgContract}
                    onChange={(e) => {
                      if (editingOrg) {
                        setEditingOrgContract(e.target.value);
                      } else {
                        setNewOrgContract(e.target.value);
                      }
                    }}
                    placeholder="Гадаад худалдааны гэрээний дугаар оруулах"
                  />
                </div>
                <div>
                  <Label htmlFor="dialog-org-phone">Утасны дугаар *</Label>
                  <Input
                    id="dialog-org-phone"
                    value={editingOrg ? editingOrgPhone : newOrgPhone}
                    onChange={(e) => {
                      if (editingOrg) {
                        setEditingOrgPhone(e.target.value);
                      } else {
                        setNewOrgPhone(e.target.value);
                      }
                    }}
                    placeholder="Утасны дугаар оруулах"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAddOrgDialogOpen(false);
                    handleCancelEditOrg();
                  }}
                  disabled={isUpdatingOrg || isAddingOrg}
                >
                  Цуцлах
                </Button>
                <Button
                  onClick={() => {
                    if (editingOrg) {
                      handleSaveEditOrg(editingOrg);
                    } else {
                      handleAddOrg();
                    }
                  }}
                  disabled={
                    isUpdatingOrg || 
                    isAddingOrg || 
                    !(editingOrg ? editingOrgName : newOrgName).trim() ||
                    !(editingOrg ? editingOrgId : newOrgId).trim() ||
                    !(editingOrg ? editingOrgContract : newOrgContract).trim() ||
                    !(editingOrg ? editingOrgPhone : newOrgPhone).trim()
                  }
                  className="gap-2"
                >
                  {isUpdatingOrg || isAddingOrg ? (
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

          {/* Transport Company Info Dialog */}
          <Dialog open={infoCompanyDialogOpen} onOpenChange={setInfoCompanyDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Тээврийн компанийн мэдээлэл</DialogTitle>
              </DialogHeader>
              {selectedCompany && (
                <div className="space-y-4 py-4">
                  <div>
                    <Label className="text-sm font-semibold">Нэр:</Label>
                    <p className="mt-1 text-sm">{selectedCompany.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Регистер:</Label>
                    <p className="mt-1 text-sm">{selectedCompany.companyId || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Гадаад худалдааны гэрээ:</Label>
                    <p className="mt-1 text-sm">{selectedCompany.contract || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Утасны дугаар:</Label>
                    <p className="mt-1 text-sm">{selectedCompany.phone || "-"}</p>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={() => setInfoCompanyDialogOpen(false)}>
                  Хаах
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Organization Info Dialog */}
          <Dialog open={infoOrgDialogOpen} onOpenChange={setInfoOrgDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Компанийн мэдээлэл</DialogTitle>
              </DialogHeader>
              {selectedOrg && (
                <div className="space-y-4 py-4">
                  <div>
                    <Label className="text-sm font-semibold">Нэр:</Label>
                    <p className="mt-1 text-sm">{selectedOrg.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Регистер:</Label>
                    <p className="mt-1 text-sm">{selectedOrg.companyId || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Гадаад худалдааны гэрээ:</Label>
                    <p className="mt-1 text-sm">{selectedOrg.contract || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Утасны дугаар:</Label>
                    <p className="mt-1 text-sm">{selectedOrg.phone || "-"}</p>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={() => setInfoOrgDialogOpen(false)}>
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
