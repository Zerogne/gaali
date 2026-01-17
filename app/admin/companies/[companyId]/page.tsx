import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth/admin"
import { getCompanyWithWorkers } from "@/lib/admin/actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { WorkerList } from "@/components/admin/worker-list"
import { DeleteCompanyDialog } from "@/components/admin/delete-company-dialog"

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ companyId: string }>
}) {
  await requireAdmin()

  const { companyId } = await params
  const company = await getCompanyWithWorkers(companyId)

  if (!company) {
    redirect("/admin/companies")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href="/admin/companies">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Companies
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{company.name}</h1>
            <p className="text-muted-foreground mt-2">Company ID: {company.companyId}</p>
            {company.notes && <p className="text-muted-foreground mt-1">{company.notes}</p>}
          </div>
          <DeleteCompanyDialog companyId={company.companyId} companyName={company.name} />
        </div>
      </div>

      <WorkerList companyId={company.companyId} workers={company.workers} />
    </div>
  )
}
