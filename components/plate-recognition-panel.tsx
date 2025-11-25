"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, CheckCircle2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PlateRecognitionPanel() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Camera className="w-5 h-5 text-primary" />
            Real-Time License Plate Recognition
          </CardTitle>
          <Badge className="bg-success/20 text-success border-success/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Recognized
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video bg-secondary rounded-lg overflow-hidden relative border border-border">
          <img src="/truck-front-view-license-plate.jpg" alt="Truck camera feed" className="w-full h-full object-cover" />
          <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 border border-primary/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Detected Plate</p>
                <p className="text-2xl font-mono font-bold text-primary">Б1234АВ</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                <p className="text-lg font-semibold text-success">98.5%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary rounded-lg p-3 border border-border">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Captured</span>
            </div>
            <p className="text-sm font-medium text-card-foreground">
              {new Date().toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div className="bg-secondary rounded-lg p-3 border border-border">
            <p className="text-xs text-muted-foreground mb-1">Processing Time</p>
            <p className="text-sm font-medium text-card-foreground">0.82s</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">Capture New Scan</Button>
          <Button variant="outline" className="border-border bg-transparent">
            View Image
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
