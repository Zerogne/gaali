"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { History, Search, Filter, Download, ChevronLeft, ChevronRight } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const historyData = [
  {
    plate: "Б1234АВ",
    time: "14:32:15",
    driver: "Доржийн Баяр",
    cargo: "Industrial Equipment",
    weight: "24,500 kg",
    status: "verified",
  },
  {
    plate: "У5678ГД",
    time: "14:18:42",
    driver: "Ганбат Эрдэнэ",
    cargo: "Construction Materials",
    weight: "18,200 kg",
    status: "verified",
  },
  {
    plate: "Б9999ЗЗ",
    time: "14:05:23",
    driver: "Unknown",
    cargo: "Unidentified",
    weight: "—",
    status: "unrecognized",
  },
  {
    plate: "М3456ЕЁ",
    time: "13:47:08",
    driver: "Цэрэн Болд",
    cargo: "Agricultural Products",
    weight: "16,800 kg",
    status: "verified",
  },
  {
    plate: "Т7890ЖЗ",
    time: "13:29:51",
    driver: "Сайнбаяр Төмөр",
    cargo: "Consumer Goods",
    weight: "21,300 kg",
    status: "verified",
  },
  {
    plate: "Х2468ИЙ",
    time: "13:12:33",
    driver: "Батсүх Очир",
    cargo: "Electronics",
    weight: "12,500 kg",
    status: "verified",
  },
]

export function HistoryLog() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <History className="w-5 h-5 text-primary" />
            Scan History & Logs
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 border-border bg-transparent">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-2 border-border bg-transparent">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by plate, driver name, or cargo type..."
            className="pl-10 bg-secondary border-border"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary hover:bg-secondary">
                <TableHead className="text-muted-foreground font-semibold">Plate Number</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Time</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Driver</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Cargo</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Weight</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyData.map((entry, index) => (
                <TableRow key={index} className="hover:bg-secondary/50">
                  <TableCell className="font-mono font-medium text-card-foreground">{entry.plate}</TableCell>
                  <TableCell className="text-muted-foreground">{entry.time}</TableCell>
                  <TableCell className="text-card-foreground">{entry.driver}</TableCell>
                  <TableCell className="text-card-foreground">{entry.cargo}</TableCell>
                  <TableCell className="text-card-foreground">{entry.weight}</TableCell>
                  <TableCell>
                    {entry.status === "verified" ? (
                      <Badge className="bg-success/20 text-success border-success/30">Verified</Badge>
                    ) : (
                      <Badge className="bg-destructive/20 text-destructive border-destructive/30">Unrecognized</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">Showing 1-6 of 47 entries</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-border bg-transparent">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground border-primary">
              1
            </Button>
            <Button variant="outline" size="sm" className="border-border bg-transparent">
              2
            </Button>
            <Button variant="outline" size="sm" className="border-border bg-transparent">
              3
            </Button>
            <Button variant="outline" size="sm" className="border-border bg-transparent">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
