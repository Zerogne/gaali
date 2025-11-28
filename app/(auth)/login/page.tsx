"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { CompanySelector } from "@/components/auth/CompanySelector"
import { WorkerSelector } from "@/components/auth/WorkerSelector"
import { getAllCompanies } from "@/lib/companies/metadata"
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

  const selectedCompany = companies.find((c) => c.companyId === selectedCompanyId)

  // Load companies on mount
  useEffect(() => {
    async function loadCompanies() {
      try {
        const allCompanies = await getAllCompanies()
        setCompanies(allCompanies)
      } catch (error) {
        console.error("Error loading companies:", error)
      }
    }
    loadCompanies()
  }, [])

  // Load workers when company is selected
  useEffect(() => {
    async function loadWorkers() {
      if (!selectedCompanyId) {
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
  }, [selectedCompanyId])

  const handleCompanyContinue = () => {
    if (selectedCompanyId) {
      setStep("worker")
      setSelectedWorkerId(null) // Reset worker selection when moving to step 2
    }
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
              Step 1: Choose Company
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
              Step 2: Worker Login
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
            <CompanySelector
              companies={companies.map((c) => ({
                id: c.companyId,
                name: c.name,
                description: c.description || "",
                logoInitials: c.logoInitials || c.name.substring(0, 2).toUpperCase(),
              }))}
              selectedCompanyId={selectedCompanyId}
              onSelect={setSelectedCompanyId}
              onContinue={handleCompanyContinue}
            />
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

