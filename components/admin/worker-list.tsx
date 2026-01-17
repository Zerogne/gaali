"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, UserCheck, Phone, Briefcase, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { createWorker } from "@/lib/admin/actions"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Worker {
  id: string
  fullName: string
  position: string | null
  phone: string | null
  status: string
  createdAt: Date | string
}

interface WorkerListProps {
  companyId: string
  workers: Worker[]
}

export function WorkerList({ companyId, workers }: WorkerListProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [deletingWorkerId, setDeletingWorkerId] = useState<string | null>(null)

  async function handleDeleteWorker(workerId: string) {
    setDeletingWorkerId(workerId)
    try {
      const response = await fetch(`/api/admin/workers/${workerId}/delete?companyId=${companyId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Worker deleted successfully")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to delete worker")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setDeletingWorkerId(null)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      formData.append("companyId", companyId)
      const result = await createWorker(formData)

      if (result.success) {
        toast.success("Worker created successfully")
        setOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to create worker")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Workers ({workers.length})</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Worker
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create Worker</DialogTitle>
                <DialogDescription>Add a new worker to this company</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input id="fullName" name="fullName" required placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position (Optional)</Label>
                  <Input id="position" name="position" placeholder="Driver, Loader, etc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="+1234567890" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select name="status" defaultValue="ACTIVE" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Worker"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {workers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserCheck className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No workers yet</h3>
            <p className="text-sm text-muted-foreground">Create the first worker for this company</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {workers.map((worker) => (
            <Card key={worker.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{worker.fullName}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      {worker.position && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {worker.position}
                        </span>
                      )}
                      {worker.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {worker.phone}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant={worker.status === "ACTIVE" ? "default" : "secondary"}>
                    {worker.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Created: {format(new Date(worker.createdAt), "PPp")}
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deletingWorkerId === worker.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Worker</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {worker.fullName}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteWorker(worker.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
