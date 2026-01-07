"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, CheckCircle2, Clock, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PlateRecognitionPanel() {
  return (
    <Card className="border-border/50 bg-card hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2.5 text-card-foreground text-lg">
            <div className="p-2 rounded-lg bg-primary/10">
              <Camera className="w-5 h-5 text-primary" />
            </div>
            Real-Time License Plate Recognition
          </CardTitle>
          <Badge className="bg-success/20 text-success border-success/30 px-2.5 py-1">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Recognized
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="aspect-video bg-secondary/50 rounded-xl overflow-hidden relative border-2 border-border/50 group">
          <img 
            src="/truck-front-view-license-plate.jpg" 
            alt="Truck camera feed" 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-md rounded-xl p-4 border border-primary/30 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Detected Plate</p>
                <p className="text-2xl font-mono font-bold text-primary tracking-wider">Б1234АВ</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Confidence</p>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-success" />
                  <p className="text-lg font-bold text-success">98.5%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary/50 rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium">Captured</span>
            </div>
            <p className="text-sm font-semibold text-card-foreground">
              {new Date().toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div className="bg-secondary/50 rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-colors">
            <p className="text-xs font-medium text-muted-foreground mb-2">Processing Time</p>
            <p className="text-sm font-semibold text-card-foreground">0.82s</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all">
            Capture New Scan
          </Button>
          <Button 
            variant="outline" 
            className="border-border/50 bg-transparent hover:bg-secondary/50 hover:border-primary/50 transition-colors"
          >
            View Image
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
