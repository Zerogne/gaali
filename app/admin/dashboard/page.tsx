import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth/admin"
import { getCompanies } from "@/lib/admin/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Plus } from "lucide-react"
import Link from "next/link"

export default async function AdminDashboardPage() {
  await requireAdmin()

  const companies = await getCompanies()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage companies and workers</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Companies ({companies.length})
          </CardTitle>
          <CardDescription>View and manage all companies</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/admin/companies">
            <Button>Manage Companies</Button>
          </Link>
        </CardContent>
      </Card>

      {companies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {companies.slice(0, 5).map((company) => (
                <Link
                  key={company.companyId}
                  href={`/admin/companies/${company.companyId}`}
                  className="block p-3 rounded-md hover:bg-accent transition-colors border"
                >
                  <div className="font-medium">{company.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {company.workerCount || 0} workers
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
