import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/lib/auth/admin"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Only /admin page doesn't require auth (handled by middleware)
  // All other routes are protected by middleware
  return <>{children}</>
}
