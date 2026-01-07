"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileDown, FileText, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ReportsGenerator() {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [truckType, setTruckType] = useState("")
  const [cargoType, setCargoType] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [showAlert, setShowAlert] = useState(false)

  const handleGenerate = () => {
    if (!dateFrom || !dateTo) {
      setShowAlert(true)
      setShowPreview(false)
      return
    }
    setShowAlert(false)
    setShowPreview(true)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="p-6 lg:col-span-1">
        <h2 className="text-xl font-semibold text-foreground mb-6">Report Configuration</h2>

        <div className="space-y-5">
          <div>
            <Label htmlFor="date-from" className="text-sm font-medium mb-2 block">
              Date From
            </Label>
            <Input id="date-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="date-to" className="text-sm font-medium mb-2 block">
              Date To
            </Label>
            <Input id="date-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="truck-type" className="text-sm font-medium mb-2 block">
              Truck Type
            </Label>
            <Select value={truckType} onValueChange={setTruckType}>
              <SelectTrigger id="truck-type">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="semi">Semi-Trailer</SelectItem>
                <SelectItem value="box">Box Truck</SelectItem>
                <SelectItem value="flatbed">Flatbed</SelectItem>
                <SelectItem value="tanker">Tanker</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="cargo-type" className="text-sm font-medium mb-2 block">
              Cargo Type
            </Label>
            <Select value={cargoType} onValueChange={setCargoType}>
              <SelectTrigger id="cargo-type">
                <SelectValue placeholder="All cargo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cargo</SelectItem>
                <SelectItem value="construction">Construction Materials</SelectItem>
                <SelectItem value="food">Food Products</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="textiles">Textiles</SelectItem>
                <SelectItem value="steel">Steel & Metal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 space-y-3">
            <Button onClick={handleGenerate} className="w-full gap-2">
              <FileText className="w-4 h-4" />
              Generate Report
            </Button>
            <Button variant="outline" className="w-full gap-2 bg-transparent" disabled={!showPreview}>
              <FileDown className="w-4 h-4" />
              Download PDF
            </Button>
            <Button variant="outline" className="w-full gap-2 bg-transparent" disabled={!showPreview}>
              <FileDown className="w-4 h-4" />
              Download CSV
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 lg:col-span-2">
        <h2 className="text-xl font-semibold text-foreground mb-6">Report Preview</h2>

        {showAlert && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please select both start and end dates to generate a report</AlertDescription>
          </Alert>
        )}

        {!showPreview && !showAlert && (
          <div className="flex items-center justify-center h-[500px] bg-muted/30 rounded-lg border-2 border-dashed border-border">
            <div className="text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Configure and generate a report to see preview</p>
            </div>
          </div>
        )}

        {showPreview && (
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-6 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Customs Truck Report</h3>
              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div>
                  <span className="text-muted-foreground">Period:</span>
                  <span className="ml-2 text-foreground font-medium">
                    {dateFrom} to {dateTo}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Truck Type:</span>
                  <span className="ml-2 text-foreground font-medium">{truckType || "All"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Cargo Type:</span>
                  <span className="ml-2 text-foreground font-medium">{cargoType || "All"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Records:</span>
                  <span className="ml-2 text-foreground font-medium">142</span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="font-semibold text-foreground mb-3">Summary Statistics</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-background rounded-lg p-4">
                    <p className="text-2xl font-bold text-primary">142</p>
                    <p className="text-xs text-muted-foreground mt-1">Total Trucks</p>
                  </div>
                  <div className="bg-background rounded-lg p-4">
                    <p className="text-2xl font-bold text-green-500">2,847.3 т</p>
                    <p className="text-xs text-muted-foreground mt-1">Total Weight</p>
                  </div>
                  <div className="bg-background rounded-lg p-4">
                    <p className="text-2xl font-bold text-orange-500">8</p>
                    <p className="text-xs text-muted-foreground mt-1">Alerts</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-4">
                <h4 className="font-semibold text-foreground mb-3">Top Records</h4>
                <div className="space-y-2">
                  {[
                    { plate: "Б1234АВ", weight: "24.5 т", cargo: "Steel Pipes" },
                    { plate: "У5678ГД", weight: "22.1 т", cargo: "Construction Materials" },
                    { plate: "М9012ЕЖ", weight: "19.8 т", cargo: "Food Products" },
                  ].map((record, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-background rounded p-3 text-sm">
                      <span className="font-mono font-semibold">{record.plate}</span>
                      <span className="text-muted-foreground">{record.cargo}</span>
                      <span className="font-semibold text-primary">{record.weight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
