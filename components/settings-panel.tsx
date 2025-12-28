"use client"

import { useState, useEffect } from "react"
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
  const [isSavingCamera, setIsSavingCamera] = useState(false)
  const [isTestingCamera, setIsTestingCamera] = useState(false)
  const [cameraStatus, setCameraStatus] = useState<"idle" | "connected" | "error">("idle")

  // Load saved camera settings on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cameraSettings")
      if (saved) {
        const settings = JSON.parse(saved)
        const connectorUrlInput = document.getElementById("connector-url") as HTMLInputElement
        if (connectorUrlInput && settings.connectorUrl) connectorUrlInput.value = settings.connectorUrl
      }
    } catch (error) {
      // Ignore errors loading settings
    }
  }, [])

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

  const handleSaveCameraSettings = async () => {
    setIsSavingCamera(true)
    
    try {
      const connectorUrlInput = document.getElementById("connector-url") as HTMLInputElement

      if (!connectorUrlInput) {
        throw new Error("Could not find settings inputs")
      }

      const connectorUrl = connectorUrlInput.value.trim()

      // Validate inputs
      if (!connectorUrl) {
        throw new Error("Connector URL is required")
      }

      // Validate URL format
      try {
        new URL(connectorUrl)
      } catch {
        throw new Error("Invalid URL format")
      }

      // Save to localStorage
      const settings = {
        connectorUrl: connectorUrl || "http://localhost:3000/events",
      }
      
      localStorage.setItem("cameraSettings", JSON.stringify(settings))
      
      toast({
        title: "Camera settings saved",
        description: `Connector URL saved. Please refresh the page to apply changes.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error saving camera settings:", error)
      toast({
        title: "Failed to save settings",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSavingCamera(false)
    }
  }

  const handleTestCameraConnection = async () => {
    setIsTestingCamera(true)
    setCameraStatus("idle")
    
    try {
      const bridgeIp = (document.getElementById("bridge-ip") as HTMLInputElement)?.value || "192.168.1.50"
      const bridgePort = (document.getElementById("bridge-port") as HTMLInputElement)?.value || "3001"
      
      // For local testing, use localhost instead of IP
      const testBridgeIp = bridgeIp === "192.168.1.50" || bridgeIp === "192.168.1.106" 
        ? "localhost" 
        : bridgeIp
      
      // Use our API endpoint to check bridge status (server-side can reach bridge)
      // For local testing, try localhost first
      const response = await fetch(
        `/api/camera/bridge-status?bridgeIp=${encodeURIComponent(testBridgeIp)}&bridgePort=${encodeURIComponent(bridgePort)}`,
        {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        }
      )
      
      const data = await response.json()
      
      if (data.ok && data.bridge?.accessible) {
        setCameraStatus("connected")
        toast({
          title: "Bridge service is running",
          description: data.message || "Bridge service is accessible and ready to receive camera data.",
          variant: "default",
        })
      } else if (data.ok && !data.bridge?.accessible) {
        // API is working but bridge not directly accessible
        setCameraStatus("idle")
        toast({
          title: "Bridge status unknown",
          description: data.message || "Cannot reach bridge service directly. Make sure it's running on your computer.",
          variant: "default",
        })
      } else {
        setCameraStatus("error")
        toast({
          title: "Connection test failed",
          description: data.message || "Cannot connect to bridge service. Make sure it's running on your computer.",
          variant: "destructive",
        })
      }
    } catch (error) {
      setCameraStatus("error")
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      toast({
        title: "Connection test failed",
        description: `Failed to check bridge status: ${errorMessage}. Make sure bridge service is running on your computer.`,
        variant: "destructive",
      })
    } finally {
      setIsTestingCamera(false)
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
              <Label htmlFor="connector-url" className="text-sm font-medium mb-2 block">
                Connector SSE URL
              </Label>
              <Input
                id="connector-url"
                placeholder="http://localhost:3000/events"
                defaultValue={typeof window !== "undefined" 
                  ? (process.env.NEXT_PUBLIC_CONNECTOR_SSE_URL || "http://localhost:3000/events")
                  : "http://localhost:3000/events"
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                SSE endpoint URL of the Windows connector app (default: http://localhost:3000/events)
              </p>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold text-foreground mb-4">Connection Instructions</h3>
              <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
                <p className="font-medium">Using Windows Connector App:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Make sure your Windows connector app is running on your local machine</li>
                  <li>The connector receives plate data from the camera via HTTP POST</li>
                  <li>The connector broadcasts plate data via SSE (Server-Sent Events) to this browser</li>
                  <li>Plate data will be automatically detected and auto-filled in the forms in real-time</li>
                  <li>Default SSE endpoint: <code className="bg-background px-1 rounded">http://localhost:3000/events</code></li>
                  <li>Use the test button below to verify the connection is working</li>
                </ol>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold text-foreground mb-4">Connection Status</h3>
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Windows App Connection</p>
                    <div className="flex items-center gap-2">
                      {cameraStatus === "connected" ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="font-semibold text-green-500">Connected</span>
                        </>
                      ) : cameraStatus === "error" ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <span className="font-semibold text-red-500">Error</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 rounded-full bg-yellow-500" />
                          <span className="font-semibold text-yellow-500">Not Checked</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestCameraConnection}
                    disabled={isTestingCamera}
                  >
                    {isTestingCamera ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Testing...
                      </>
                    ) : (
                      "Test Connection"
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                type="button"
                className="gap-2" 
                onClick={handleSaveCameraSettings}
                disabled={isSavingCamera}
              >
                {isSavingCamera ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Camera Settings
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={handleTestCameraConnection}
                disabled={isTestingCamera}
              >
                {isTestingCamera ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube className="w-4 h-4" />
                    Test Connection
                  </>
                )}
              </Button>
            </div>
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
