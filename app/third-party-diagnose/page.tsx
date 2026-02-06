"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, CheckCircle2, XCircle, AlertCircle } from "lucide-react"

type TestResult = {
  name: string
  status: "pending" | "running" | "pass" | "fail"
  message?: string
  details?: unknown
}

export default function ThirdPartyDiagnosePage() {
  const [serverDiagnostic, setServerDiagnostic] = useState<Record<string, unknown> | null>(null)
  const [pullTest, setPullTest] = useState<TestResult>({ name: "Pull (3rd party fetches from Gaali)", status: "pending" })
  const [sendTest, setSendTest] = useState<TestResult>({ name: "Send (Gaali → 3rd party WebSocket)", status: "pending" })
  const [isRunning, setIsRunning] = useState(false)

  const runServerDiagnostic = useCallback(async () => {
    try {
      const res = await fetch("/api/third-party/diagnose")
      const data = await res.json()
      if (res.ok) {
        setServerDiagnostic(data)
      } else {
        setServerDiagnostic({ error: data.error || data.message || "Failed", status: res.status })
      }
    } catch (e) {
      setServerDiagnostic({ error: e instanceof Error ? e.message : "Network error" })
    }
  }, [])

  const runPullTest = useCallback(async () => {
    setPullTest((p) => ({ ...p, status: "running", message: undefined, details: undefined }))
    try {
      // Step 1: Get available codes
      const debugRes = await fetch("/api/third-party/debug")
      const debugData = await debugRes.json()
      if (!debugRes.ok) {
        setPullTest({
          name: "Pull (3rd party fetches from Gaali)",
          status: "fail",
          message: `Debug API failed: ${debugData.error || debugRes.status}`,
          details: debugData,
        })
        return
      }
      const codes = debugData.codes as { code: string }[] | undefined
      const firstCode = codes?.[0]?.code
      if (!firstCode) {
        setPullTest({
          name: "Pull (3rd party fetches from Gaali)",
          status: "fail",
          message: "No codes in third_party_data. Save an Out Session first to populate data.",
          details: { total: debugData.total, codes: debugData.codes },
        })
        return
      }
      // Step 2: Try to fetch data by code
      const dataRes = await fetch(`/api/third-party/data?number=${encodeURIComponent(firstCode)}`)
      const dataResult = await dataRes.json()
      if (!dataRes.ok) {
        setPullTest({
          name: "Pull (3rd party fetches from Gaali)",
          status: "fail",
          message: `Pull by code failed: ${dataResult.error || dataRes.status}`,
          details: { code: firstCode, response: dataResult },
        })
        return
      }
      setPullTest({
        name: "Pull (3rd party fetches from Gaali)",
        status: "pass",
        message: `Successfully fetched data for code ${firstCode}`,
        details: { code: firstCode, dataPreview: Array.isArray(dataResult) ? dataResult[0] : dataResult },
      })
    } catch (e) {
      setPullTest({
        name: "Pull (3rd party fetches from Gaali)",
        status: "fail",
        message: e instanceof Error ? e.message : "Unknown error",
        details: undefined,
      })
    }
  }, [])

  const runSendTest = useCallback(async () => {
    setSendTest((p) => ({ ...p, status: "running", message: undefined, details: undefined }))
    const wsUrl =
      (typeof window !== "undefined" && (window as any).__THIRD_PARTY_WS_URL__) ||
      process.env.NEXT_PUBLIC_THIRD_PARTY_WS_URL ||
      "ws://127.0.0.1:9000/service"
    try {
      const ws = new WebSocket(wsUrl)
      const timeout = 5000
      const result = await new Promise<TestResult>((resolve) => {
        const t = setTimeout(() => {
          try {
            ws.close()
          } catch {}
          resolve({
            name: "Send (Gaali → 3rd party WebSocket)",
            status: "fail",
            message: `Connection timeout (${timeout}ms). Is the 3rd party app running at ${wsUrl}?`,
            details: { wsUrl },
          })
        }, timeout)
        ws.onopen = () => {
          clearTimeout(t)
          const testData = [{ AKT: "DIAG-TEST-001", CAR: "Test", DRN: "Diagnostic", VNO: "TEST" }]
          try {
            ws.send(JSON.stringify(testData))
            ws.close()
            resolve({
              name: "Send (Gaali → 3rd party WebSocket)",
              status: "pass",
              message: `Connected and sent test data to ${wsUrl}`,
              details: { wsUrl },
            })
          } catch (e) {
            ws.close()
            resolve({
              name: "Send (Gaali → 3rd party WebSocket)",
              status: "fail",
              message: e instanceof Error ? e.message : "Send failed",
              details: { wsUrl },
            })
          }
        }
        ws.onerror = () => {
          clearTimeout(t)
          try {
            ws.close()
          } catch {}
          resolve({
            name: "Send (Gaali → 3rd party WebSocket)",
            status: "fail",
            message: `WebSocket error. Is the 3rd party app running at ${wsUrl}?`,
            details: { wsUrl },
          })
        }
        ws.onclose = (ev) => {
          if (ev.code !== 1000 && ev.code !== 1005) {
            clearTimeout(t)
            resolve({
              name: "Send (Gaali → 3rd party WebSocket)",
              status: "fail",
              message: `Connection closed (code ${ev.code}). ${ev.reason || "Check if 3rd party app is running."}`,
              details: { wsUrl, code: ev.code, reason: ev.reason },
            })
          }
        }
      })
      setSendTest(result)
    } catch (e) {
      setSendTest({
        name: "Send (Gaali → 3rd party WebSocket)",
        status: "fail",
        message: e instanceof Error ? e.message : "Unknown error",
        details: { wsUrl },
      })
    }
  }, [])

  const runAll = useCallback(async () => {
    setIsRunning(true)
    await runServerDiagnostic()
    await runPullTest()
    await runSendTest()
    setIsRunning(false)
  }, [runServerDiagnostic, runPullTest, runSendTest])

  useEffect(() => {
    runServerDiagnostic()
  }, [runServerDiagnostic])

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold">3rd Party Integration Diagnostics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Diagnose why the other site can&apos;t pull data or we can&apos;t send data to the 3rd party app.
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold">Run Diagnostics</h2>
          <Button onClick={runAll} disabled={isRunning} className="gap-2">
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Run All
              </>
            )}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={runPullTest} disabled={isRunning}>
              Test Pull
            </Button>
            <Button variant="outline" size="sm" onClick={runSendTest} disabled={isRunning}>
              Test Send
            </Button>
          </div>

          <TestResultRow result={pullTest} />
          <TestResultRow result={sendTest} />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold mb-4">Server Diagnostic</h2>
        {serverDiagnostic ? (
          <pre className="text-xs bg-muted/50 rounded-lg p-4 overflow-auto max-h-80">
            {JSON.stringify(serverDiagnostic, null, 2)}
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground">Run diagnostics to see server info.</p>
        )}
      </Card>

      <Card className="p-6 bg-muted/30">
        <h2 className="font-semibold mb-2">Data Flow</h2>
        <ul className="text-sm space-y-2 text-muted-foreground">
          <li>
            <strong>Pull:</strong> 3rd party fetches from{" "}
            <code className="bg-muted px-1 rounded">/api/third-party/data?number=X</code> (no auth). Data comes from{" "}
            <code className="bg-muted px-1 rounded">third_party_data</code> collection, populated when you save an Out
            Session.
          </li>
          <li>
            <strong>Send:</strong> Gaali sends JSON via WebSocket to the 3rd party app. The app must run a WebSocket
            server at <code className="bg-muted px-1 rounded">ws://127.0.0.1:9000/service</code> (or URL in Settings).
          </li>
        </ul>
      </Card>

      <Card className="p-6 border-amber-200 bg-amber-50/50">
        <h2 className="font-semibold mb-2">If other site still can&apos;t pull</h2>
        <p className="text-sm text-muted-foreground mb-2">Give them this exact URL (replace YOUR_DOMAIN and ACT_NUMBER):</p>
        <code className="block text-xs bg-white p-3 rounded border mb-3 break-all">
          https://YOUR_DOMAIN/api/third-party/data?number=ACT_NUMBER
        </code>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• Parameter must be <code className="bg-muted px-1">number</code> (spec requirement)</li>
          <li>• CORS is enabled (OPTIONS + Access-Control-Allow-Origin: *)</li>
          <li>• If CORS error in their console: check their server allows outbound HTTPS to your domain</li>
          <li>• Alternative: <code className="bg-muted px-1">/api/v1/api/service?number=ACT_NUMBER</code></li>
        </ul>
      </Card>
    </div>
  )
}

function TestResultRow({ result }: { result: TestResult }) {
  const Icon =
    result.status === "pass"
      ? CheckCircle2
      : result.status === "fail"
        ? XCircle
        : result.status === "running"
          ? Loader2
          : AlertCircle
  const color =
    result.status === "pass"
      ? "text-green-600"
      : result.status === "fail"
        ? "text-red-600"
        : result.status === "running"
          ? "text-amber-600 animate-spin"
          : "text-muted-foreground"
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="font-medium">{result.name}</span>
        <Badge
          variant={result.status === "pass" ? "default" : result.status === "fail" ? "destructive" : "secondary"}
          className="ml-auto"
        >
          {result.status}
        </Badge>
      </div>
      {result.message && (
        <p className="text-sm text-muted-foreground mt-2">{result.message}</p>
      )}
      {result.details !== undefined && result.details !== null && (
        <pre className="text-xs bg-muted/50 rounded p-2 mt-2 overflow-auto max-h-32 font-mono whitespace-pre">
          {JSON.stringify(result.details, null, 2)}
        </pre>
      )}
    </div>
  )
}
