"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface RequestLog {
  method: string
  url: string
  pathname: string
  queryParams: Record<string, string | null>
  headers: Record<string, string>
  body?: string
  contentType?: string
  userAgent?: string
  ipAddress?: string
  timestamp: string
  responseStatus?: number
  responseTime?: number
  error?: string
}

export default function ApiRequestsDebugPage() {
  const [logs, setLogs] = useState<RequestLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLog, setSelectedLog] = useState<RequestLog | null>(null)

  const fetchLogs = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/v1/api/service/debug?limit=100")
      if (!response.ok) {
        throw new Error("Failed to fetch logs")
      }
      const data = await response.json()
      setLogs(data.logs || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch logs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchLogs, 10000)
    return () => clearInterval(interval)
  }, [])

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getStatusColor = (status?: number) => {
    if (!status) return "secondary"
    if (status >= 200 && status < 300) return "default"
    if (status >= 400 && status < 500) return "destructive"
    return "destructive"
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">API Request Monitor</h1>
          <p className="text-muted-foreground mt-2">
            Monitor all requests to /api/v1/api/service endpoint
          </p>
        </div>
        <Button onClick={fetchLogs} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Request Logs ({logs.length})</CardTitle>
            <CardDescription>
              Recent requests to the API endpoint
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No requests logged yet
                </p>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                      selectedLog === log ? "bg-accent border-primary" : ""
                    }`}
                    onClick={() => setSelectedLog(log)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{log.method}</Badge>
                        <Badge variant={getStatusColor(log.responseStatus)}>
                          {log.responseStatus || "N/A"}
                        </Badge>
                        {log.error && (
                          <Badge variant="destructive">Error</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm font-mono truncate">{log.url}</p>
                    {log.responseTime && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Response time: {log.responseTime}ms
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
            <CardDescription>
              {selectedLog ? "Selected request details" : "Select a request to view details"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedLog ? (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="headers">Headers</TabsTrigger>
                  <TabsTrigger value="body">Body</TabsTrigger>
                  <TabsTrigger value="raw">Raw</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Request Info</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Method:</strong> {selectedLog.method}</p>
                      <p><strong>URL:</strong> <code className="text-xs">{selectedLog.url}</code></p>
                      <p><strong>Pathname:</strong> {selectedLog.pathname}</p>
                      <p><strong>IP Address:</strong> {selectedLog.ipAddress || "Unknown"}</p>
                      <p><strong>User Agent:</strong> {selectedLog.userAgent || "Unknown"}</p>
                      <p><strong>Content Type:</strong> {selectedLog.contentType || "N/A"}</p>
                      <p><strong>Timestamp:</strong> {formatTimestamp(selectedLog.timestamp)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Response Info</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Status:</strong> {selectedLog.responseStatus || "N/A"}</p>
                      <p><strong>Response Time:</strong> {selectedLog.responseTime ? `${selectedLog.responseTime}ms` : "N/A"}</p>
                      {selectedLog.error && (
                        <p className="text-destructive"><strong>Error:</strong> {selectedLog.error}</p>
                      )}
                    </div>
                  </div>
                  
                  {Object.keys(selectedLog.queryParams).length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Query Parameters</h3>
                      <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                        {JSON.stringify(selectedLog.queryParams, null, 2)}
                      </pre>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="headers">
                  <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-[500px]">
                    {JSON.stringify(selectedLog.headers, null, 2)}
                  </pre>
                </TabsContent>
                
                <TabsContent value="body">
                  {selectedLog.body ? (
                    <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-[500px]">
                      {typeof selectedLog.body === 'string' 
                        ? selectedLog.body 
                        : JSON.stringify(selectedLog.body, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-muted-foreground">No body data</p>
                  )}
                </TabsContent>
                
                <TabsContent value="raw">
                  <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-[500px]">
                    {JSON.stringify(selectedLog, null, 2)}
                  </pre>
                </TabsContent>
              </Tabs>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Select a request from the list to view details
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

