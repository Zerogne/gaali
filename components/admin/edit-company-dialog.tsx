"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateCompany } from "@/lib/admin/actions";
import { Edit, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface Company {
  companyId: string;
  name: string;
  notes?: string | null;
  companyCode?: string | null;
  uniqueCodePrefix?: string | null;
  workerCount?: number;
}

interface EditCompanyDialogProps {
  company: Company;
}

export function EditCompanyDialog({ company }: EditCompanyDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(company.name);
  const [notes, setNotes] = useState(company.notes ?? "");
  const [companyCode, setCompanyCode] = useState(company.companyCode ?? "");
  const [uniqueCodePrefix, setUniqueCodePrefix] = useState(company.uniqueCodePrefix ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setName(company.name);
      setNotes(company.notes ?? "");
      setCompanyCode(company.companyCode ?? "");
      setUniqueCodePrefix(company.uniqueCodePrefix ?? "");
      setPassword("");
      setShowPassword(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.set("name", name.trim());
      formData.set("notes", notes.trim() || "");
      formData.set("companyCode", companyCode.trim());
      formData.set("uniqueCodePrefix", uniqueCodePrefix.trim());
      if (password.trim()) formData.set("password", password.trim());
      const result = await updateCompany(company.companyId, formData);
      if (result.success) {
        toast.success("Company updated");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Update failed");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          title="Edit company"
          aria-label="Edit company"
        >
          <Edit className="h-4 w-4 mr-1.5" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
          <DialogDescription>
            Update company details. Password: leave blank to keep current.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Company Name *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-slug">Slug</Label>
              <Input
                id="edit-slug"
                value={company.companyId}
                readOnly
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Slug cannot be changed after creation.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">New Password (optional)</Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Min 8 characters. Only set if changing password.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-companyCode">Company Code (4 digits)</Label>
                <Input
                  id="edit-companyCode"
                  value={companyCode}
                  onChange={(e) => setCompanyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="1001"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">For unique code generation.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-uniqueCodePrefix">Unique Code 1st Digit</Label>
                <Input
                  id="edit-uniqueCodePrefix"
                  value={uniqueCodePrefix}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 1);
                    if (v === "" || /^[3-9]$/.test(v)) setUniqueCodePrefix(v);
                  }}
                  placeholder="3"
                  className="font-mono w-14"
                />
                <p className="text-xs text-muted-foreground">4 digits (1001) or 6 digits (311028 for 108oil).</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes (optional)</Label>
              <Textarea
                id="edit-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional information"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
