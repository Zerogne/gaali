"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { handleCompanyLogin } from "@/lib/auth/authClient"
import type { CompanyMetadata } from "@/lib/companies/metadata"

interface CompanyLoginFormProps {
  companies: CompanyMetadata[]
  onSuccess: (companyId: string) => void
}

export function CompanyLoginForm({
  companies,
  onSuccess,
}: CompanyLoginFormProps) {
  const [companyInput, setCompanyInput] = useState<string>("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!companyInput.trim() || !password.trim()) {
      setError("Please enter company name and password")
      return
    }

    // Find company by name or companyId (case-insensitive)
    const company = companies.find(
      (c) =>
        c.name.toLowerCase() === companyInput.trim().toLowerCase() ||
        c.companyId.toLowerCase() === companyInput.trim().toLowerCase()
    )

    if (!company) {
      setError("Компани байхгүй байна. Компанийн нэрийг шалгана уу.")
      setPassword("") // Clear password on error
      return
    }

    setError(null)
    setIsLoggingIn(true)

    try {
      const result = await handleCompanyLogin({
        companyId: company.companyId,
        password: password.trim(),
      })

      if (!result.success) {
        setError(result.error || "Нэвтрэхэд алдаа гарлаа")
        setPassword("") // Clear password on error
      } else {
        // Success - call onSuccess with companyId
        onSuccess(company.companyId)
      }
    } catch (err) {
      setError("Таармагдсан алдаа гарлаа")
      setPassword("")
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Нэвтрэх
        </h2>
        <p className="text-sm text-gray-600">
          Компанийн нэр болон нууц үгээ оруулна уу.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="company" className="text-sm font-medium text-gray-700">
            Компанийн нэр
          </Label>
          <Input
            id="company"
            type="text"
            value={companyInput}
            onChange={(e) => {
              setCompanyInput(e.target.value)
              setError(null) // Clear error when typing
            }}
            disabled={isLoggingIn}
            className="mt-1 h-8 text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Компанийн нэр"
            autoFocus
          />
        </div>

        <div>
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            Нууц үг
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(null) // Clear error when typing
              }}
              disabled={isLoggingIn}
              className="mt-1 h-8 text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
              placeholder="******"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute right-0 top-1 h-8 px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoggingIn}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Button
            type="submit"
            disabled={!companyInput.trim() || !password.trim() || isLoggingIn}
            className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Нэвтрэж байна...
              </>
            ) : (
              "Үргэлжлүүлэх"
            )}
          </Button>
          <button
            type="button"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Нууц үгээ мартсан уу?
          </button>
        </div>
      </form>
    </div>
  )
}
