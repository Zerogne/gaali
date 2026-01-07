"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Company } from "@/lib/auth/mockData"

interface CompanySelectorProps {
  companies: Company[]
  selectedCompanyId: string | null
  onSelect: (companyId: string) => void
  onContinue: () => void
}

export function CompanySelector({
  companies,
  selectedCompanyId,
  onSelect,
  onContinue,
}: CompanySelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Select Company Account</h2>
        <p className="text-sm text-gray-600">
          Choose the logistics company you're working under.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {companies.map((company) => {
          const isSelected = selectedCompanyId === company.id
          return (
            <Card
              key={company.id}
              onClick={() => onSelect(company.id)}
              className={`
                p-5 cursor-pointer transition-all duration-200
                ${isSelected
                  ? "border-2 border-blue-600 bg-blue-50 shadow-md"
                  : "border border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg hover:scale-[1.02]"
                }
              `}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`
                    w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg
                    ${isSelected ? "bg-blue-600" : "bg-gray-400"}
                  `}
                >
                  {company.logoInitials}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{company.name}</h3>
                  <p className="text-sm text-gray-600">{company.description}</p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <Button
          onClick={onContinue}
          disabled={!selectedCompanyId}
          className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </Button>
        <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          Switch environment
        </button>
      </div>
    </div>
  )
}

