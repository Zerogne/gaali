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
import type { Contract } from "@/lib/types";
import { FileText, Edit, Loader2, Plus, Trash2, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { findSimilarValue } from "@/lib/utils/string-similarity";

export default function ContractsPage() {
  const { toast } = useToast();
  
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [newContractNumber, setNewContractNumber] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newCompanyId, setNewCompanyId] = useState("");
  const [newCompanyPhone, setNewCompanyPhone] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [contractToDelete, setContractToDelete] = useState<string | null>(null);
  const [editingContract, setEditingContract] = useState<string | null>(null);
  const [editingContractNumber, setEditingContractNumber] = useState("");
  const [editingCompany, setEditingCompany] = useState("");
  const [editingCompanyId, setEditingCompanyId] = useState("");
  const [editingCompanyPhone, setEditingCompanyPhone] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingStartDate, setEditingStartDate] = useState("");
  const [editingEndDate, setEditingEndDate] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [duplicateValue, setDuplicateValue] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadContracts = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [contractsRes, transportRes, orgsRes] = await Promise.all([
          fetch("/api/contracts", { credentials: "include" }),
          fetch("/api/transport-companies", { credentials: "include" }),
          fetch("/api/organizations", { credentials: "include" }),
        ]);

        const all: Contract[] = [];

        if (contractsRes.ok) {
          const data = await contractsRes.json();
          if (Array.isArray(data)) {
            all.push(...data.map((c: any) => ({
              id: c.id,
              number: c.number || "",
              company: c.company || "",
              companyId: c.companyId || "",
              companyPhone: c.companyPhone || "",
              description: c.description,
              startDate: c.startDate,
              endDate: c.endDate,
              createdAt: c.createdAt || "",
            })));
          }
        }

        if (transportRes.ok) {
          const data = await transportRes.json();
          if (Array.isArray(data)) {
            data.forEach((tc: any) => {
              if (tc.contract?.trim() && tc.name?.trim()) {
                all.push({
                  id: `tc_${tc.id}`,
                  number: tc.contract.trim(),
                  company: tc.name.trim(),
                  companyId: tc.companyId || "",
                  companyPhone: tc.phone || "",
                  createdAt: tc.createdAt || "",
                });
              }
            });
          }
        }

        if (orgsRes.ok) {
          const data = await orgsRes.json();
          if (Array.isArray(data)) {
            data.forEach((org: any) => {
              if (org.contract?.trim() && org.name?.trim()) {
                all.push({
                  id: `org_${org.id}`,
                  number: org.contract.trim(),
                  company: org.name.trim(),
                  companyId: org.companyId || "",
                  companyPhone: org.phone || "",
                  createdAt: org.createdAt || "",
                });
              }
            });
          }
        }

        setContracts(all);
      } catch (error) {
        console.error("Error loading contracts:", error);
        setLoadError(error instanceof Error ? error.message : "Өгөгдөл ачаалахад алдаа гарлаа");
        toast({
          title: "Алдаа",
          description: "Гэрээний өгөгдөл ачаалахад алдаа гарлаа.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  const filteredContracts = contracts.filter((contract) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      contract.number.toLowerCase().includes(query) ||
      contract.company.toLowerCase().includes(query) ||
      contract.companyId.toLowerCase().includes(query) ||
      contract.companyPhone.toLowerCase().includes(query) ||
      contract.id.toLowerCase().includes(query) ||
      contract.description?.toLowerCase().includes(query) ||
      contract.startDate?.toLowerCase().includes(query) ||
      contract.endDate?.toLowerCase().includes(query)
    );
  });

  const handleAddContract = async () => {
    if (!newContractNumber.trim()) {
      toast({
        title: "Алдаа",
        description: "Гэрээний дугаар шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    if (!newCompany.trim()) {
      toast({
        title: "Алдаа",
        description: "Компани шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    if (!newCompanyId.trim()) {
      toast({
        title: "Алдаа",
        description: "Компанийн регистер шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    if (!newCompanyPhone.trim()) {
      toast({
        title: "Алдаа",
        description: "Компанийн утасны дугаар шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicates
    const existingNumbers = contracts.map(c => c.number);
    const similarContract = findSimilarValue(newContractNumber.trim(), existingNumbers);
    
    if (similarContract) {
      setDuplicateValue(similarContract);
      setDuplicateDialogOpen(true);
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch("/api/contracts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          number: newContractNumber.trim(),
          company: newCompany.trim(),
          companyId: newCompanyId.trim(),
          companyPhone: newCompanyPhone.trim(),
          description: newDescription.trim() || undefined,
          startDate: newStartDate.trim() || undefined,
          endDate: newEndDate.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Гэрээ нэмэхэд алдаа гарлаа");
      }

      toast({
        title: "Амжилттай",
        description: "Гэрээ амжилттай нэмэгдлээ",
      });

      setNewContractNumber("");
      setNewCompany("");
      setNewCompanyId("");
      setNewCompanyPhone("");
      setNewDescription("");
      setNewStartDate("");
      setNewEndDate("");
      setAddDialogOpen(false);

      await loadContracts();
    } catch (error) {
      toast({
        title: "Алдаа",
        description: error instanceof Error ? error.message : "Гэрээ нэмэхэд алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditContractClick = (contract: Contract) => {
    setEditingContract(contract.id);
    setEditingContractNumber(contract.number);
    setEditingCompany(contract.company);
    setEditingCompanyId(contract.companyId);
    setEditingCompanyPhone(contract.companyPhone);
    setEditingDescription(contract.description || "");
    setEditingStartDate(contract.startDate || "");
    setEditingEndDate(contract.endDate || "");
    setAddDialogOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingContract(null);
    setEditingContractNumber("");
    setEditingCompany("");
    setEditingCompanyId("");
    setEditingCompanyPhone("");
    setEditingDescription("");
    setEditingStartDate("");
    setEditingEndDate("");
    setAddDialogOpen(false);
  };

  const handleSaveEdit = async (contractId: string) => {
    if (!editingContractNumber.trim()) {
      toast({
        title: "Алдаа",
        description: "Гэрээний дугаар шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    if (!editingCompany.trim()) {
      toast({
        title: "Алдаа",
        description: "Компани шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    if (!editingCompanyId.trim()) {
      toast({
        title: "Алдаа",
        description: "Компанийн регистер шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    if (!editingCompanyPhone.trim()) {
      toast({
        title: "Алдаа",
        description: "Компанийн утасны дугаар шаардлагатай",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicates (excluding current contract)
    const existingNumbers = contracts
      .filter(c => c.id !== contractId)
      .map(c => c.number);
    const similarContract = findSimilarValue(editingContractNumber.trim(), existingNumbers);
    
    if (similarContract) {
      setDuplicateValue(similarContract);
      setDuplicateDialogOpen(true);
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/contracts/${contractId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          number: editingContractNumber.trim(),
          company: editingCompany.trim(),
          companyId: editingCompanyId.trim(),
          companyPhone: editingCompanyPhone.trim(),
          description: editingDescription.trim() || undefined,
          startDate: editingStartDate.trim() || undefined,
          endDate: editingEndDate.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Гэрээ засахад алдаа гарлаа");
      }

      toast({
        title: "Амжилттай",
        description: "Гэрээ амжилттай шинэчлэгдлээ",
      });

      setEditingContract(null);
      setEditingContractNumber("");
      setEditingCompany("");
      setEditingCompanyId("");
      setEditingCompanyPhone("");
      setEditingDescription("");
      setEditingStartDate("");
      setEditingEndDate("");
      setAddDialogOpen(false);

      await loadContracts();
    } catch (error) {
      toast({
        title: "Алдаа",
        description: error instanceof Error ? error.message : "Гэрээ засахад алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = (contractId: string) => {
    setContractToDelete(contractId);
  };

  const handleDeleteConfirm = async () => {
    if (!contractToDelete) return;

    setIsDeleting(contractToDelete);
    try {
      const response = await fetch(`/api/contracts/${contractToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Гэрээ устгахад алдаа гарлаа");
      }

      toast({
        title: "Амжилттай",
        description: "Гэрээ амжилттай устгагдлаа",
      });

      setContractToDelete(null);

      await loadContracts();
    } catch (error) {
      toast({
        title: "Алдаа",
        description: error instanceof Error ? error.message : "Гэрээ устгахад алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
      setContractToDelete(null);
    }
  };

  const handleDoubleClick = (contract: Contract) => {
    setSelectedContract(contract);
    setInfoDialogOpen(true);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Гадаад худалдааны гэрээ
              </h2>
            </div>

            {/* Search and Add Section */}
            <div className="flex items-center gap-2 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Гэрээний дугаар, компани, регистер, утасны дугаараар хайх..."
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
                  setEditingContract(null);
                  setEditingContractNumber("");
                  setEditingCompany("");
                  setEditingCompanyId("");
                  setEditingCompanyPhone("");
                  setEditingDescription("");
                  setEditingStartDate("");
                  setEditingEndDate("");
                  setNewContractNumber("");
                  setNewCompany("");
                  setNewCompanyId("");
                  setNewCompanyPhone("");
                  setNewDescription("");
                  setNewStartDate("");
                  setNewEndDate("");
                  setAddDialogOpen(true);
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Нэмэх
              </Button>
            </div>

            {/* Table - only show contract number and company name */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Өгөгдөл ачаалж байна...</span>
              </div>
            ) : loadError ? (
              <p className="text-sm text-destructive text-center py-8">{loadError}</p>
            ) : filteredContracts.length > 0 ? (
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Гэрээний дугаар</TableHead>
                      <TableHead>Компани</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContracts.map((contract) => (
                      <TableRow
                        key={contract.id}
                        onDoubleClick={() => handleDoubleClick(contract)}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">
                          {contract.number}
                        </TableCell>
                        <TableCell>
                          {contract.company}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                {searchQuery ? "Хайлтын үр дүн олдсонгүй" : "Гэрээ байхгүй байна. Дээрх 'Нэмэх' товч дараад нэмнэ үү."}
              </p>
            )}
          </Card>

          {/* Delete Dialog */}
          <AlertDialog open={!!contractToDelete} onOpenChange={(open) => {
            if (!open) setContractToDelete(null);
          }}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Гэрээ устгах</AlertDialogTitle>
                <AlertDialogDescription>
                  Та энэ гэрээг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setContractToDelete(null)}>Цуцлах</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteConfirm}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                >
                  Устгах
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Duplicate Dialog */}
          <AlertDialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Давхардсан гэрээ</AlertDialogTitle>
                <AlertDialogDescription>
                  Ижил төстэй гэрээний дугаар аль хэдийн байна: <strong>"{duplicateValue}"</strong>. Өөр дугаар ашиглана уу.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => setDuplicateDialogOpen(false)}>
                  OK
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Add/Edit Dialog */}
          <Dialog open={addDialogOpen || !!editingContract} onOpenChange={(open) => {
            if (!open) {
              setAddDialogOpen(false);
              handleCancelEdit();
            }
          }}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingContract ? "Гэрээ засах" : "Шинэ гэрээ нэмэх"}
                </DialogTitle>
                <DialogDescription>
                  {editingContract ? "Гэрээний мэдээллийг засах" : "Шинэ гэрээний мэдээлэл оруулах"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="dialog-contract-number">Гэрээний дугаар *</Label>
                  <Input
                    id="dialog-contract-number"
                    value={editingContract ? editingContractNumber : newContractNumber}
                    onChange={(e) => {
                      if (editingContract) {
                        setEditingContractNumber(e.target.value);
                      } else {
                        setNewContractNumber(e.target.value);
                      }
                    }}
                    placeholder="Гэрээний дугаар оруулах"
                  />
                </div>
                <div>
                  <Label htmlFor="dialog-company">Компани *</Label>
                  <Input
                    id="dialog-company"
                    value={editingContract ? editingCompany : newCompany}
                    onChange={(e) => {
                      if (editingContract) {
                        setEditingCompany(e.target.value);
                      } else {
                        setNewCompany(e.target.value);
                      }
                    }}
                    placeholder="Компанийн нэр оруулах"
                  />
                </div>
                <div>
                  <Label htmlFor="dialog-company-id">Компанийн регистер *</Label>
                  <Input
                    id="dialog-company-id"
                    value={editingContract ? editingCompanyId : newCompanyId}
                    onChange={(e) => {
                      if (editingContract) {
                        setEditingCompanyId(e.target.value);
                      } else {
                        setNewCompanyId(e.target.value);
                      }
                    }}
                    placeholder="Компанийн регистрийн дугаар оруулах"
                  />
                </div>
                <div>
                  <Label htmlFor="dialog-company-phone">Компанийн утасны дугаар *</Label>
                  <Input
                    id="dialog-company-phone"
                    value={editingContract ? editingCompanyPhone : newCompanyPhone}
                    onChange={(e) => {
                      if (editingContract) {
                        setEditingCompanyPhone(e.target.value);
                      } else {
                        setNewCompanyPhone(e.target.value);
                      }
                    }}
                    placeholder="Компанийн утасны дугаар оруулах"
                  />
                </div>
                <div>
                  <Label htmlFor="dialog-description">Тайлбар</Label>
                  <Input
                    id="dialog-description"
                    value={editingContract ? editingDescription : newDescription}
                    onChange={(e) => {
                      if (editingContract) {
                        setEditingDescription(e.target.value);
                      } else {
                        setNewDescription(e.target.value);
                      }
                    }}
                    placeholder="Тайлбар оруулах (сонголттой)"
                  />
                </div>
                <div>
                  <Label htmlFor="dialog-start-date">Эхлэх огноо</Label>
                  <Input
                    id="dialog-start-date"
                    type="date"
                    value={editingContract ? editingStartDate : newStartDate}
                    onChange={(e) => {
                      if (editingContract) {
                        setEditingStartDate(e.target.value);
                      } else {
                        setNewStartDate(e.target.value);
                      }
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="dialog-end-date">Дуусах огноо</Label>
                  <Input
                    id="dialog-end-date"
                    type="date"
                    value={editingContract ? editingEndDate : newEndDate}
                    onChange={(e) => {
                      if (editingContract) {
                        setEditingEndDate(e.target.value);
                      } else {
                        setNewEndDate(e.target.value);
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
                >
                  Цуцлах
                </Button>
                <Button
                  onClick={() => {
                    if (editingContract) {
                      handleSaveEdit(editingContract);
                    } else {
                      handleAddContract();
                    }
                  }}
                  disabled={isAdding || isUpdating}
                >
                  {isAdding || isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Хадгалж байна...
                    </>
                  ) : (
                    "Хадгалах"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Info Dialog */}
          <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Гэрээний мэдээлэл</DialogTitle>
                <DialogDescription>
                  Гэрээний дэлгэрэнгүй мэдээлэл
                </DialogDescription>
              </DialogHeader>
              {selectedContract && (
                <div className="space-y-3 py-4">
                  <div>
                    <Label className="text-muted-foreground">Гэрээний дугаар</Label>
                    <p className="font-medium">{selectedContract.number}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Компани</Label>
                    <p className="font-medium">{selectedContract.company}</p>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={() => setInfoDialogOpen(false)}>Хаах</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}

