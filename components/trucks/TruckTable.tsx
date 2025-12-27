"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { sendTruckLogToCustoms } from "@/lib/api";
import { exportLogToPDF } from "@/lib/pdf-export";
import type { Direction, TruckLog } from "@/lib/types";
import { Edit, FileDown, Search, Send, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface TruckTableProps {
  logs: TruckLog[];
  onSend: (logId: string) => void;
  onUpdate?: () => void;
}

export function TruckTable({ logs, onSend, onUpdate }: TruckTableProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());
  const [uniqueCodes, setUniqueCodes] = useState<Map<string, string>>(new Map());

  const handleEdit = (log: TruckLog) => {
    // Redirect to the appropriate session page based on direction
    if (log.direction === "IN") {
      router.push(`/in-session?edit=${log.id}`);
    } else {
      router.push(`/out-session?edit=${log.id}`);
    }
  };

  const filteredLogs = logs;

  const inCount = filteredLogs.filter((log) => log.direction === "IN").length;
  const outCount = filteredLogs.filter((log) => log.direction === "OUT").length;

  const handleResend = async (log: TruckLog) => {
    setSendingIds((prev) => new Set(prev).add(log.id));
    try {
      const result = await sendTruckLogToCustoms(log.id);

      if (result.success) {
        onSend(log.id);
        toast({
          title: "Амжилттай",
          description: "Мэдээлэл Монголын гаалинд амжилттай илгээгдлээ",
        });
      } else {
        toast({
          title: "Алдаа",
          description: result.error || "Гаалинд илгээхэд алдаа гарлаа",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Алдаа",
        description: "Гаалинд илгээхэд алдаа гарлаа",
        variant: "destructive",
      });
    } finally {
      setSendingIds((prev) => {
        const next = new Set(prev);
        next.delete(log.id);
        return next;
      });
    }
  };

  // Fetch unique codes for logs
  const fetchUniqueCodesForLogs = async (logsToFetch: TruckLog[]) => {
    const codesMap = new Map<string, string>()
    
    await Promise.all(
      logsToFetch.map(async (log) => {
        try {
          const sessionsResponse = await fetch(
            `/api/truck-sessions?direction=${log.direction}&plateNumber=${encodeURIComponent(log.plate)}&limit=100`
          )

          if (sessionsResponse.ok) {
            const sessionsData = await sessionsResponse.json()
            
            if (sessionsData.sessions && sessionsData.sessions.length > 0) {
              const logDate = new Date(log.createdAt)
              
              const sortedSessions = sessionsData.sessions
                .map((s: any) => ({
                  ...s,
                  timeDiff: Math.abs(new Date(s.createdAt).getTime() - logDate.getTime())
                }))
                .sort((a: any, b: any) => a.timeDiff - b.timeDiff)
              
              const session = sortedSessions.find((s: any) => s.timeDiff < 24 * 60 * 60 * 1000) 
                || sortedSessions[0]

              if (session?.uniqueCode) {
                codesMap.set(log.id, session.uniqueCode)
              }
            }
          }
        } catch (error) {
          console.error(`❌ Error fetching unique code for log ${log.id}:`, error)
        }
      })
    )
    
    setUniqueCodes(codesMap)
  }

  // Fetch unique codes when logs change
  useEffect(() => {
    if (logs.length > 0) {
      fetchUniqueCodesForLogs(logs).catch(console.error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("mn-MN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="border-gray-200 bg-white shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-900">
            Тээврийн хэрэгслийн түүх
          </CardTitle>
          <Button
            onClick={() => router.push("/sessions")}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            Бүрэн түүх
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <Separator className="flex-shrink-0" />
      <CardContent className="pt-4 flex-1 min-h-0 overflow-hidden flex flex-col">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-base font-medium mb-1">
              Тээврийн хэрэгслийн бүртгэл олдсонгүй
            </p>
            <p className="text-sm text-gray-400">
              Хайлтын үр дүнд тохирох бүртгэл байхгүй байна. Шүүлтийг өөрчлөх
              эсвэл хайлтын үгсийг өөрчлөн үзнэ үү.
            </p>
          </div>
        ) : (
          <div className="flex flex-col h-full min-h-0">
            <div className="flex items-center justify-between flex-shrink-0 mb-3">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">
                  Нийт бүртгэл:
                </span>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  IN: {inCount}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  OUT: {outCount}
                </Badge>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-gray-700 font-semibold">
                      Улсын дугаар
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold">
                      Жолооч
                    </TableHead>
                    <TableHead className="text-gray-700 font-semibold">
                      Үйлдлүүд
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow 
                      key={log.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onDoubleClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log("🖱️ Double-clicked on log:", log.id)
                        handleEdit(log)
                      }}
                    >
                      <TableCell className="font-mono font-semibold text-gray-900">
                        {log.plate}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {log.driverName}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(log)}
                            title={
                              log.sentToCustoms
                                ? "Бүртгэлийг дахин засах"
                                : "Бүртгэл засах"
                            }
                            className="border-gray-300 hover:bg-gray-50"
                          >
                            <Edit className="w-3.5 h-3.5 mr-1.5" />
                            {log.sentToCustoms ? "Дахин засах" : "Засах"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                await exportLogToPDF(log);
                              } catch (error) {
                                console.error("Error exporting PDF:", error);
                              }
                            }}
                            title="PDF файл татах"
                            className="border-gray-300 hover:bg-gray-50"
                          >
                            <FileDown className="w-3.5 h-3.5 mr-1.5" />
                            PDF
                          </Button>
                          {log.sentToCustoms ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResend(log)}
                              disabled={sendingIds.has(log.id)}
                              className="bg-green-400 text-white border-green-500 hover:bg-green-500 disabled:bg-green-200 disabled:text-white"
                              title="Гаалинд дахин илгээх"
                            >
                              {sendingIds.has(log.id) ? (
                                "Илгээж байна..."
                              ) : (
                                <>
                                  <Send className="w-3.5 h-3.5 mr-1.5" />
                                  Дахин илгээх
                                </>
                              )}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResend(log)}
                              disabled={sendingIds.has(log.id)}
                              className="bg-green-500 text-white border-green-600 hover:bg-green-600 disabled:bg-green-300 disabled:text-white"
                              title="Гаалинд илгээх"
                            >
                              {sendingIds.has(log.id) ? (
                                "Илгээж байна..."
                              ) : (
                                <>
                                  <Send className="w-3.5 h-3.5 mr-1.5" />
                                  Илгээх
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>

    </Card>
  );
}
