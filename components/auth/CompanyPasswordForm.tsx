"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { handleCompanyLogin } from "@/lib/auth/authClient"

interface CompanyPasswordFormProps {
  companyName: string
  companyId: string
  onSuccess: () => void
  onBack: () => void
}

export function CompanyPasswordForm({
  companyName,
  companyId,
  onSuccess,
  onBack,
}: CompanyPasswordFormProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password.trim()) {
      return
    }

    setError(null)
    setIsLoggingIn(true)

    try {
      const result = await handleCompanyLogin({
        companyId,
        password: password.trim(),
      })

      if (!result.success) {
        setError(result.error || "Login failed")
        setPassword("") // Clear password on error
      } else {
        // Success - call onSuccess to proceed to worker selection
        onSuccess()
      }
    } catch (err) {
      setError("An unexpected error occurred")
      setPassword("")
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to company selection
      </button>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Login to {companyName}
        </h2>
        <p className="text-sm text-gray-600">
          Enter the company password to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            Company Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError(null) // Clear error when typing
            }}
            disabled={isLoggingIn}
            className="mt-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter company password"
            autoFocus
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Button
            type="submit"
            disabled={!password.trim() || isLoggingIn}
            className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Logging in...
              </>
            ) : (
              "Continue"
            )}
          </Button>
          <button
            type="button"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Forgot password?
          </button>
        </div>
      </form>
    </div>
  )
}

