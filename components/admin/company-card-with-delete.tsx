"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { DeleteCompanyDialog } from "./delete-company-dialog";
import { EditCompanyDialog } from "./edit-company-dialog";

interface Company {
  companyId: string;
  name: string;
  workerCount?: number;
  notes?: string | null;
}

interface CompanyCardWithDeleteProps {
  company: Company;
}

export function CompanyCardWithDelete({ company }: CompanyCardWithDeleteProps) {
  return (
    <Card className="hover:bg-accent transition-colors h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link href={`/admin/companies/${company.companyId}`}>
              <CardTitle className="hover:underline cursor-pointer truncate">
                {company.name}
              </CardTitle>
            </Link>
            <CardDescription className="truncate">
              Slug: {company.companyId}
            </CardDescription>
          </div>
          <div
            className="flex gap-2 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <EditCompanyDialog company={company} />
            <DeleteCompanyDialog
              companyId={company.companyId}
              companyName={company.name}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">{company.workerCount ?? 0}</span>{" "}
            workers
          </div>
          {company.notes && (
            <div className="text-muted-foreground text-xs line-clamp-2">
              {company.notes.length > 100
                ? `${company.notes.substring(0, 100)}...`
                : company.notes}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
