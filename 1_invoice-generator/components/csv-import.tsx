"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CSVRow {
  [key: string]: string
}

interface CSVImportProps {
  onImportData: (data: CSVRow[]) => void
  onClose: () => void
}

export function CSVImport({ onImportData, onClose }: CSVImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<CSVRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>("")
  const [previewData, setPreviewData] = useState<CSVRow[]>([])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile)
      setError("")
      parseCSV(selectedFile)
    } else {
      setError("Please select a valid CSV file")
      setFile(null)
    }
  }

  const parseCSV = async (file: File) => {
    setIsProcessing(true)
    try {
      const text = await file.text()
      const lines = text.split("\n").filter((line) => line.trim())

      if (lines.length < 2) {
        setError("CSV file must contain at least a header row and one data row")
        return
      }

      // Parse headers
      const headerLine = lines[0]
      const parsedHeaders = headerLine.split(",").map((header) => header.trim().replace(/"/g, ""))
      setHeaders(parsedHeaders)

      // Parse data rows
      const dataRows: CSVRow[] = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((value) => value.trim().replace(/"/g, ""))
        if (values.length === parsedHeaders.length) {
          const row: CSVRow = {}
          parsedHeaders.forEach((header, index) => {
            row[header] = values[index] || ""
          })
          dataRows.push(row)
        }
      }

      setCsvData(dataRows)
      setPreviewData(dataRows.slice(0, 5)) // Show first 5 rows for preview
      setError("")
    } catch (err) {
      setError("Error parsing CSV file. Please check the file format.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImport = () => {
    if (csvData.length > 0) {
      onImportData(csvData)
    }
  }

  const expectedHeaders = [
    "Customer Name",
    "Customer Type",
    "Customer Email",
    "Customer Address",
    "Product Name",
    "Category",
    "Product Type",
    "Quantity",
    "Price Per Unit",
    "Platform",
    "Status",
    "Production Cost",
    "Notes",
  ]

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <img src="/generic_logo.png" alt="Logo" className="h-5 w-5 object-contain" />
          Import Invoices from CSV
        </CardTitle>
        <CardDescription>
          Upload a CSV file to import multiple invoices at once. Make sure your CSV includes the required columns.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="csv-file">Select CSV File</Label>
          <div className="flex items-center gap-4">
            <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} className="flex-1" />
            <Button onClick={() => setFile(null)} variant="outline" disabled={!file}>
              Clear
            </Button>
          </div>
        </div>

        {/* Expected Format Info */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Expected CSV columns:</strong> {expectedHeaders.join(", ")}
            <br />
            <em>Note: Column names should match exactly (case-sensitive)</em>
          </AlertDescription>
        </Alert>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Processing CSV file...</p>
          </div>
        )}

        {/* Preview Data */}
        {previewData.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold">CSV Preview ({csvData.length} rows found)</h3>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      {headers.map((header, index) => (
                        <th key={index} className="px-3 py-2 text-left font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index} className="border-t">
                        {headers.map((header, cellIndex) => (
                          <td key={cellIndex} className="px-3 py-2 max-w-32 truncate">
                            {row[header] || "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {csvData.length > 5 && (
              <p className="text-sm text-muted-foreground text-center">
                Showing first 5 rows. {csvData.length - 5} more rows will be imported.
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={csvData.length === 0 || isProcessing}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Import {csvData.length} Invoice{csvData.length !== 1 ? "s" : ""}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
