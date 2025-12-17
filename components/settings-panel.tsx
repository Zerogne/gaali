"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Scale, Save, TestTube, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function SettingsPanel() {
  const { toast } = useToast()
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedStatus, setSeedStatus] = useState<"idle" | "success" | "error">("idle")
  const [seedMessage, setSeedMessage] = useState<string>("")

  const handleSeedDatabase = async () => {
    setIsSeeding(true)
    setSeedStatus("idle")
    setSeedMessage("")

    try {
      const response = await fetch("/api/seed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSeedStatus("success")
        setSeedMessage(data.message || "Database seeded successfully")
        toast({
          title: "Database seeded successfully",
          description: "All companies use password: password123",
          variant: "default",
        })
      } else {
        setSeedStatus("error")
        setSeedMessage(data.error || data.details || "Failed to seed database")
        toast({
          title: "Failed to seed database",
          description: data.error || data.details,
          variant: "destructive",
        })
      }
    } catch (error) {
      setSeedStatus("error")
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setSeedMessage(errorMessage)
      toast({
        title: "Error seeding database",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <Tabs defaultValue="camera" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 lg:w-[900px]">
        <TabsTrigger value="camera" className="gap-2">
          <Camera className="w-4 h-4" />
          Camera
        </TabsTrigger>
        <TabsTrigger value="weight" className="gap-2">
          <Scale className="w-4 h-4" />
          Weight
        </TabsTrigger>
        <TabsTrigger value="test" className="gap-2">
          <TestTube className="w-4 h-4" />
          Test
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

      <TabsContent value="test" className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Test & Sample Data</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Database Seeding</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Seed the database with sample data for testing. This will create:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground mb-6 space-y-2">
                <li>4 sample companies (Altan Logistics, Steppe Mining, BlueRoad Transport, Frontier Customs Partner)</li>
                <li>3 workers per company (12 total workers)</li>
                <li>Sample truck logs for testing</li>
                <li>All workers use password: <code className="bg-muted px-1 rounded">password123</code></li>
              </ul>

              <div className="space-y-4">
                <Button
                  onClick={handleSeedDatabase}
                  disabled={isSeeding}
                  className="gap-2"
                  variant="default"
                >
                  {isSeeding ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Seeding Database...
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4" />
                      Seed Sample Data
                    </>
                  )}
                </Button>

                {seedStatus !== "idle" && (
                  <div
                    className={`p-4 rounded-lg border ${
                      seedStatus === "success"
                        ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                        : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {seedStatus === "success" ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p
                          className={`font-medium ${
                            seedStatus === "success"
                              ? "text-green-900 dark:text-green-100"
                              : "text-red-900 dark:text-red-100"
                          }`}
                        >
                          {seedStatus === "success" ? "Success" : "Error"}
                        </p>
                        <p
                          className={`text-sm mt-1 ${
                            seedStatus === "success"
                              ? "text-green-700 dark:text-green-300"
                              : "text-red-700 dark:text-red-300"
                          }`}
                        >
                          {seedMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold text-foreground mb-4">Test WebSocket Connection</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Test the WebSocket connection to the 3rd party app. This allows you to verify that
                the integration is working correctly.
              </p>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  window.open("/test-websocket.html", "_blank")
                }}
              >
                <TestTube className="w-4 h-4" />
                Open WebSocket Test Page
              </Button>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold text-foreground mb-4">API Endpoints</h3>
              <div className="space-y-2 text-sm">
                <div className="bg-muted/30 rounded-lg p-3">
                  <code className="text-xs font-mono">POST /api/seed</code>
                  <p className="text-muted-foreground mt-1">Seed database with sample data</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <code className="text-xs font-mono">GET /api/truck-sessions/by-code/[code]</code>
                  <p className="text-muted-foreground mt-1">Get truck session by unique code</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <code className="text-xs font-mono">GET /api/truck-sessions/by-code/[code]?format=thirdparty</code>
                  <p className="text-muted-foreground mt-1">Get truck session in 3rd party app format</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
