import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth/admin"
import { getCompanies } from "@/lib/admin/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2 } from "lucide-react"
import Link from "next/link"
import { CreateCompanyDialog } from "@/components/admin/create-company-dialog"
import { CompanyCardWithDelete } from "@/components/admin/company-card-with-delete"

export default async function CompaniesPage() {
  await requireAdmin()

  const companies = await getCompanies()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Companies</h1>
          <p className="text-muted-foreground mt-2">Manage all companies</p>
        </div>
        <CreateCompanyDialog />
      </div>

      {companies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No companies yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first company to get started</p>
            <CreateCompanyDialog />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <CompanyCardWithDelete key={company.companyId} company={company} />
          ))}
        </div>
      )}
    </div>
  )
}
