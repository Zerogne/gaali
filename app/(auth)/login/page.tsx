"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { CompanyLoginForm } from "@/components/auth/CompanyLoginForm"
import { WorkerSelector } from "@/components/auth/WorkerSelector"
import { getCompanyWorkers } from "@/lib/companies/workers"
import type { CompanyMetadata } from "@/lib/companies/metadata"
import type { Worker } from "@/lib/auth/mockData"
import { Truck } from "lucide-react"

type LoginStep = "company" | "worker"

export default function LoginPage() {
  const [step, setStep] = useState<LoginStep>("company")
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null)
  const [companies, setCompanies] = useState<CompanyMetadata[]>([])
  const [companyWorkers, setCompanyWorkers] = useState<Worker[]>([])
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(false)
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true)

  const selectedCompany = companies.find((c) => c.companyId === selectedCompanyId)

  // Load companies on mount
  useEffect(() => {
    async function loadCompanies() {
      setIsLoadingCompanies(true)
      try {
        // Use API route instead of direct server action for better production compatibility
        const response = await fetch("/api/companies")
        if (response.ok) {
          const data = await response.json()
          setCompanies(data)
        } else {
          console.error("Failed to load companies:", response.statusText)
        }
      } catch (error) {
        console.error("Error loading companies:", error)
      } finally {
        setIsLoadingCompanies(false)
      }
    }
    loadCompanies()
  }, [])

  // Load workers when company is authenticated
  useEffect(() => {
    async function loadWorkers() {
      if (!selectedCompanyId || step !== "worker") {
        setCompanyWorkers([])
        return
      }

      setIsLoadingWorkers(true)
      try {
        const workers = await getCompanyWorkers(selectedCompanyId)
        setCompanyWorkers(workers)
      } catch (error) {
        console.error("Error loading workers:", error)
        setCompanyWorkers([])
      } finally {
        setIsLoadingWorkers(false)
      }
    }

    loadWorkers()
  }, [selectedCompanyId, step])

  const handleCompanyLoginSuccess = (companyId: string) => {
    // After company login is successful, move to worker selection
    setSelectedCompanyId(companyId)
    setStep("worker")
    setSelectedWorkerId(null) // Reset worker selection
  }

  const handleBackToCompany = () => {
    setStep("company")
    setSelectedWorkerId(null) // Reset worker selection when going back
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
              <Truck className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">XP Agency</h1>
          </div>
          <p className="text-sm text-gray-600">Logistics Platform</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${step === "company"
                  ? "bg-blue-600 text-white"
                  : "bg-green-500 text-white"
                }
              `}
            >
              {step === "company" ? "1" : "✓"}
            </div>
            <span
              className={`text-sm font-medium ${
                step === "company" ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Step 1: Company Login
            </span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300" />
          <div className="flex items-center gap-2">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${step === "worker"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-600"
                }
              `}
            >
              2
            </div>
            <span
              className={`text-sm font-medium ${
                step === "worker" ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Step 2: Select Worker
            </span>
          </div>
        </div>

        {/* Main Card */}
        <Card className="p-6 md:p-8 bg-white border-gray-200 shadow-lg">
          <div
            className={`
              transition-opacity duration-300
              ${step === "company" ? "opacity-100" : "hidden"}
            `}
          >
            {isLoadingCompanies ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading companies...</p>
              </div>
            ) : (
              <CompanyLoginForm
                companies={companies}
                onSuccess={handleCompanyLoginSuccess}
              />
            )}
          </div>

          <div
            className={`
              transition-opacity duration-300
              ${step === "worker" ? "opacity-100" : "hidden"}
            `}
          >
            {selectedCompany && (
              <WorkerSelector
                companyName={selectedCompany.name}
                workers={companyWorkers}
                selectedWorkerId={selectedWorkerId}
                onSelect={setSelectedWorkerId}
                onBack={handleBackToCompany}
                isLoading={isLoadingWorkers}
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

