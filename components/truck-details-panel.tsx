"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, User, Package, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function TruckDetailsPanel() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Truck className="w-5 h-5 text-primary" />
            Vehicle & Driver Details
          </CardTitle>
          <Button size="sm" variant="outline" className="gap-2 border-border bg-transparent">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-secondary rounded-lg p-4 border border-border">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Plate Number</p>
              <p className="text-xl font-mono font-bold text-card-foreground">Б1234АВ</p>
            </div>
            <Badge variant="outline" className="bg-success/10 text-success border-success/30">
              Verified
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Vehicle Type</p>
              <p className="font-medium text-card-foreground">Heavy Truck</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Gross Weight</p>
              <p className="font-medium text-card-foreground">24,500 kg</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Registration</p>
              <p className="font-medium text-card-foreground">Active</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Model Year</p>
              <p className="font-medium text-card-foreground">2021</p>
            </div>
          </div>
        </div>

        <div className="bg-secondary rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm text-card-foreground">Driver Information</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium text-card-foreground">Доржийн Баяр</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">License ID</span>
              <span className="font-mono text-card-foreground">DL-789456123</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">License Valid Until</span>
              <span className="text-card-foreground">Dec 2026</span>
            </div>
          </div>
        </div>

        <div className="bg-secondary rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm text-card-foreground">Cargo Details</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cargo Type</span>
              <span className="font-medium text-card-foreground">Industrial Equipment</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Declaration ID</span>
              <span className="font-mono text-card-foreground">CDL-2025-001234</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Origin</span>
              <span className="text-card-foreground">Улаанбаатар</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Destination</span>
              <span className="text-card-foreground">Замын-Үүд</span>
            </div>
          </div>
        </div>

        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          <FileText className="w-4 h-4 mr-2" />
          Generate Full Report
        </Button>
      </CardContent>
    </Card>
  )
}
