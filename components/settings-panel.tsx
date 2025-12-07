"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Scale, Save } from "lucide-react"
export function SettingsPanel() {
  return (
    <Tabs defaultValue="camera" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 lg:w-[600px]">
        <TabsTrigger value="camera" className="gap-2">
          <Camera className="w-4 h-4" />
          Camera
        </TabsTrigger>
        <TabsTrigger value="weight" className="gap-2">
          <Scale className="w-4 h-4" />
          Weight
        </TabsTrigger>
      </TabsList>

      <TabsContent value="camera" className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Camera Integration Settings</h2>

          <div className="space-y-6">
            <div>
              <Label htmlFor="api-endpoint" className="text-sm font-medium mb-2 block">
                API Endpoint
              </Label>
              <Input
                id="api-endpoint"
                placeholder="https://api.madar.mn/camera/stream"
                defaultValue="https://api.madar.mn/camera/stream"
              />
            </div>

            <div>
              <Label htmlFor="api-key" className="text-sm font-medium mb-2 block">
                API Key
              </Label>
              <Input id="api-key" type="password" placeholder="Enter API key..." defaultValue="••••••••••••••••" />
            </div>

            <div>
              <Label htmlFor="webhook-url" className="text-sm font-medium mb-2 block">
                Webhook URL
              </Label>
              <Input
                id="webhook-url"
                placeholder="https://madar.mn/webhook/plate-recognition"
                defaultValue="https://madar.mn/webhook/plate-recognition"
              />
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold text-foreground mb-4">Camera Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Connection Status</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-semibold text-green-500">Connected</span>
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Recognition Rate</p>
                  <p className="text-2xl font-bold text-primary">94.7%</p>
                </div>
              </div>
            </div>

            <Button className="gap-2">
              <Save className="w-4 h-4" />
              Save Camera Settings
            </Button>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="weight" className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Weight Settings</h2>

          <div className="space-y-6">
            <div>
              <Label htmlFor="scale-endpoint" className="text-sm font-medium mb-2 block">
                Scale API Endpoint
                </Label>
              <Input
                id="scale-endpoint"
                placeholder="https://api.scale.com/weight"
                defaultValue="https://api.scale.com/weight"
              />
            </div>

            <div>
              <Label htmlFor="scale-api-key" className="text-sm font-medium mb-2 block">
                API Key
                </Label>
              <Input id="scale-api-key" type="password" placeholder="Enter API key..." defaultValue="••••••••••••••••" />
            </div>

            <div>
              <Label htmlFor="weight-unit" className="text-sm font-medium mb-2 block">
                Default Weight Unit
              </Label>
              <Input
                id="weight-unit"
                placeholder="kg"
                defaultValue="kg"
              />
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold text-foreground mb-4">Scale Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Connection Status</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-semibold text-green-500">Connected</span>
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Last Reading</p>
                  <p className="text-2xl font-bold text-primary">0.00 kg</p>
                </div>
              </div>
            </div>

            <Button className="gap-2">
              <Save className="w-4 h-4" />
              Save Weight Settings
            </Button>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
