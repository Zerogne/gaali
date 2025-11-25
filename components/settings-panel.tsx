"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Camera, Bell, Save } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function SettingsPanel() {
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [alertNotifs, setAlertNotifs] = useState(true)
  const [autoExport, setAutoExport] = useState(false)

  return (
    <Tabs defaultValue="users" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
        <TabsTrigger value="users" className="gap-2">
          <Users className="w-4 h-4" />
          Users
        </TabsTrigger>
        <TabsTrigger value="camera" className="gap-2">
          <Camera className="w-4 h-4" />
          Camera
        </TabsTrigger>
        <TabsTrigger value="notifications" className="gap-2">
          <Bell className="w-4 h-4" />
          Notifications
        </TabsTrigger>
      </TabsList>

      <TabsContent value="users" className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">User Management</h2>
            <Button className="gap-2">
              <Users className="w-4 h-4" />
              Add User
            </Button>
          </div>

          <div className="space-y-4">
            {[
              {
                name: "xuji",
                email: "xuji@customs.mn",
                role: "Admin",
                status: "active",
              },
              {
                name: "dnii",
                email: "dnii@customs.mn",
                role: "Operator",
                status: "active",
              },
              {
                name: "bata",
                email: "bata@customs.mn",
                role: "Operator",
                status: "inactive",
              },
            ].map((user, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{user.role}</Badge>
                  <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                  <Button size="sm" variant="ghost">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </TabsContent>

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

      <TabsContent value="notifications" className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Notification Preferences</h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex-1">
                <Label htmlFor="email-notifs" className="font-semibold text-foreground">
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground mt-1">Receive email alerts for important events</p>
              </div>
              <Switch id="email-notifs" checked={emailNotifs} onCheckedChange={setEmailNotifs} />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex-1">
                <Label htmlFor="alert-notifs" className="font-semibold text-foreground">
                  Alert Notifications
                </Label>
                <p className="text-sm text-muted-foreground mt-1">Get notified about unrecognized plates and errors</p>
              </div>
              <Switch id="alert-notifs" checked={alertNotifs} onCheckedChange={setAlertNotifs} />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex-1">
                <Label htmlFor="auto-export" className="font-semibold text-foreground">
                  Auto Export Reports
                </Label>
                <p className="text-sm text-muted-foreground mt-1">Automatically generate and email daily reports</p>
              </div>
              <Switch id="auto-export" checked={autoExport} onCheckedChange={setAutoExport} />
            </div>

            <div className="border-t border-border pt-6">
              <Label htmlFor="email-address" className="text-sm font-medium mb-2 block">
                Notification Email
              </Label>
              <Input
                id="email-address"
                type="email"
                placeholder="operator@customs.mn"
                defaultValue="operator@customs.mn"
              />
            </div>

            <Button className="gap-2">
              <Save className="w-4 h-4" />
              Save Notification Settings
            </Button>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
