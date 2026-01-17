"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DeleteCompanyDialog } from "./delete-company-dialog"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface Company {
  companyId: string
  name: string
  workerCount?: number
  notes?: string | null
}

interface CompanyCardWithDeleteProps {
  company: Company
}

export function CompanyCardWithDelete({ company }: CompanyCardWithDeleteProps) {
  return (
    <Card className="hover:bg-accent transition-colors h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link href={`/admin/companies/${company.companyId}`}>
              <CardTitle className="hover:underline cursor-pointer">{company.name}</CardTitle>
            </Link>
            <CardDescription>Slug: {company.companyId}</CardDescription>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <DeleteCompanyDialog companyId={company.companyId} companyName={company.name} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-1 text-sm">
          <div>
            <span className="font-medium">{company.workerCount || 0}</span> workers
          </div>
          {company.notes && (
            <div className="text-muted-foreground mt-2">
              {company.notes.length > 100 ? `${company.notes.substring(0, 100)}...` : company.notes}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
