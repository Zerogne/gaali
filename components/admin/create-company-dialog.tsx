"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createCompany } from "@/lib/admin/actions"
import { generateSecurePasswordClient } from "@/lib/utils/password-client"
import { Plus, Copy, Check, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "sonner"

export function CreateCompanyDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)
  const [passwordCopied, setPasswordCopied] = useState(false)
  const [initialPassword, setInitialPassword] = useState<string>("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setGeneratedPassword(null)
    setPasswordCopied(false)

    try {
      const formData = new FormData(e.currentTarget)
      // Add password to formData if provided (use trimmed value or empty string)
      const passwordValue = initialPassword.trim()
      if (passwordValue) {
        formData.set("password", passwordValue)
      } else {
        // If empty, don't set it - server will auto-generate
        formData.delete("password")
      }
      const result = await createCompany(formData)

      if (result.success && result.data) {
        setGeneratedPassword(result.data.password)
        toast.success("Company created successfully")
        // Don't close dialog yet - show password first
      } else {
        toast.error(result.error || "Failed to create company")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  function handleCopyPassword() {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword)
      setPasswordCopied(true)
      toast.success("Password copied to clipboard")
      setTimeout(() => setPasswordCopied(false), 2000)
    }
  }

  function handleClose() {
    setOpen(false)
    setGeneratedPassword(null)
    setPasswordCopied(false)
    router.refresh()
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) {
      // Dialog is being closed
      handleClose()
    } else {
      // Dialog is being opened - reset state and generate initial password
      setOpen(true)
      setGeneratedPassword(null)
      setPasswordCopied(false)
      // Generate a new password as initial value
      setInitialPassword(generateSecurePasswordClient(12))
    }
  }

  function handleGenerateNewPassword() {
    setInitialPassword(generateSecurePasswordClient(12))
    toast.success("New password generated")
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Company
        </Button>
      </DialogTrigger>
      <DialogContent>
        {generatedPassword ? (
          <>
            <DialogHeader>
              <DialogTitle>Company Created Successfully</DialogTitle>
              <DialogDescription>
                The company has been created. Please save the password below and share it with the company.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Generated Password</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={generatedPassword}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopyPassword}
                    title="Copy password"
                  >
                    {passwordCopied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-amber-600 font-medium">
                  ⚠️ Save this password now - it won't be shown again!
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleClose}>
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Create Company</DialogTitle>
              <DialogDescription>Add a new company to the platform</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input id="name" name="name" required placeholder="Acme Corporation" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  name="slug"
                  required
                  placeholder="acme-corp"
                  pattern="[a-z0-9-]+"
                  title="Lowercase letters, numbers, and hyphens only"
                />
                <p className="text-xs text-muted-foreground">URL-safe identifier (lowercase, alphanumeric, hyphens)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="password"
                    name="password"
                    type="text"
                    value={initialPassword}
                    onChange={(e) => setInitialPassword(e.target.value)}
                    placeholder="Leave empty to auto-generate"
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleGenerateNewPassword}
                    title="Generate new password"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Leave empty to auto-generate a secure password. You can customize it or click the refresh icon to generate a new one.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyCode">Company Code (4 digits)</Label>
                  <Input
                    id="companyCode"
                    name="companyCode"
                    placeholder="1001"
                    maxLength={4}
                    pattern="\d{4}"
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">e.g. 1001, 1002. For unique code generation.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uniqueCodePrefix">Unique Code 1st Digit</Label>
                  <Input
                    id="uniqueCodePrefix"
                    name="uniqueCodePrefix"
                    placeholder="3"
                    maxLength={1}
                    pattern="[3-9]"
                    className="font-mono w-14"
                  />
                  <p className="text-xs text-muted-foreground">3=108oil, 4,5,6 for others. Single digit.</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" name="notes" placeholder="Additional information about the company" rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Company"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
