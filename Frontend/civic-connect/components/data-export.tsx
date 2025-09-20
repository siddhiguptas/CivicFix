"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, FileText, Table, BarChart3 } from "lucide-react"

interface ExportOptions {
  format: "csv" | "excel" | "pdf" | "json"
  dateRange: string
  includeFields: string[]
  filterBy?: string
}

interface DataExportProps {
  data: any[]
  filename: string
  availableFields: { key: string; label: string }[]
  onExport: (options: ExportOptions) => void
}

export function DataExport({ data, filename, availableFields, onExport }: DataExportProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "csv",
    dateRange: "all",
    includeFields: availableFields.map((f) => f.key),
  })
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await onExport(exportOptions)
    } finally {
      setIsExporting(false)
    }
  }

  const handleFieldToggle = (fieldKey: string, checked: boolean) => {
    setExportOptions((prev) => ({
      ...prev,
      includeFields: checked ? [...prev.includeFields, fieldKey] : prev.includeFields.filter((f) => f !== fieldKey),
    }))
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "csv":
        return <Table className="w-4 h-4" />
      case "excel":
        return <BarChart3 className="w-4 h-4" />
      case "pdf":
        return <FileText className="w-4 h-4" />
      case "json":
        return <FileText className="w-4 h-4" />
      default:
        return <Download className="w-4 h-4" />
    }
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Download className="w-5 h-5 mr-2" />
          Export Data
        </CardTitle>
        <CardDescription className="text-slate-400">
          Export {data.length} records in your preferred format
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Export Format</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { value: "csv", label: "CSV", desc: "Comma-separated values" },
              { value: "excel", label: "Excel", desc: "Microsoft Excel format" },
              { value: "pdf", label: "PDF", desc: "Portable document format" },
              { value: "json", label: "JSON", desc: "JavaScript object notation" },
            ].map((format) => (
              <button
                key={format.value}
                onClick={() => setExportOptions((prev) => ({ ...prev, format: format.value as any }))}
                className={`p-3 rounded-lg border transition-all hover-lift ${
                  exportOptions.format === format.value
                    ? "border-blue-500 bg-blue-500/20 text-blue-400"
                    : "border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500"
                }`}
              >
                <div className="flex items-center justify-center mb-1">{getFormatIcon(format.value)}</div>
                <div className="text-sm font-medium">{format.label}</div>
                <div className="text-xs opacity-70">{format.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Date Range</label>
          <Select
            value={exportOptions.dateRange}
            onValueChange={(value) => setExportOptions((prev) => ({ ...prev, dateRange: value }))}
          >
            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Field Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Include Fields</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {availableFields.map((field) => (
              <div key={field.key} className="flex items-center space-x-2">
                <Checkbox
                  id={field.key}
                  checked={exportOptions.includeFields.includes(field.key)}
                  onCheckedChange={(checked) => handleFieldToggle(field.key, checked as boolean)}
                  className="border-slate-600"
                />
                <label htmlFor={field.key} className="text-sm text-slate-300 cursor-pointer">
                  {field.label}
                </label>
              </div>
            ))}
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setExportOptions((prev) => ({
                  ...prev,
                  includeFields: availableFields.map((f) => f.key),
                }))
              }
              className="text-slate-400 hover:text-white"
            >
              Select All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExportOptions((prev) => ({ ...prev, includeFields: [] }))}
              className="text-slate-400 hover:text-white"
            >
              Clear All
            </Button>
          </div>
        </div>

        {/* Export Button */}
        <Button
          onClick={handleExport}
          disabled={isExporting || exportOptions.includeFields.length === 0}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white btn-animate"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export {exportOptions.format.toUpperCase()}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
