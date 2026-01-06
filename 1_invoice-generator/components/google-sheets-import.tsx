"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, RefreshCw, AlertCircle, CheckCircle, ExternalLink } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface GoogleSheetsRow {
  [key: string]: string
}

interface GoogleSheetsImportProps {
  onImportData: (data: GoogleSheetsRow[]) => void
  onClose: () => void
}

export function GoogleSheetsImport({ onImportData, onClose }: GoogleSheetsImportProps) {
  const [sheetUrl, setSheetUrl] = useState("")
  const [sheetId, setSheetId] = useState("")
  const [sheetName, setSheetName] = useState("Sheet1")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [sheetsData, setSheetsData] = useState<GoogleSheetsRow[]>([])
  const [previewData, setPreviewData] = useState<GoogleSheetsRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState(false)

  const extractSheetId = (url: string) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
    return match ? match[1] : ""
  }

  const handleUrlChange = (url: string) => {
    setSheetUrl(url)
    const id = extractSheetId(url)
    setSheetId(id)
    setError("")
  }

  const connectToSheet = async () => {
    if (!sheetId) {
      setError("Please enter a valid Google Sheets URL")
      return
    }

    setIsConnecting(true)
    setError("")

    try {
      // Convert to CSV export URL
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`

      const response = await fetch(csvUrl)
      if (!response.ok) {
        throw new Error("Failed to access Google Sheet. Make sure it's publicly accessible.")
      }

      const csvText = await response.text()
      const lines = csvText.split("\n").filter((line) => line.trim())

      if (lines.length < 2) {
        throw new Error("Sheet must contain at least a header row and one data row")
      }

      // Parse CSV data
      const parsedHeaders = lines[0].split(",").map((header) => header.trim().replace(/"/g, ""))
      setHeaders(parsedHeaders)

      const dataRows: GoogleSheetsRow[] = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((value) => value.trim().replace(/"/g, ""))
        if (values.length === parsedHeaders.length) {
          const row: GoogleSheetsRow = {}
          parsedHeaders.forEach((header, index) => {
            row[header] = values[index] || ""
          })
          dataRows.push(row)
        }
      }

      setSheetsData(dataRows)
      setPreviewData(dataRows.slice(0, 5))
      setIsConnected(true)
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to Google Sheets")
      setIsConnected(false)
    } finally {
      setIsConnecting(false)
    }
  }

  const refreshData = async () => {
    if (!isConnected) return
    setIsLoading(true)
    await connectToSheet()
    setIsLoading(false)
  }

  const handleImport = () => {
    if (sheetsData.length > 0) {
      onImportData(sheetsData)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sheet className="h-5 w-5" />
          Import from Google Sheets
        </CardTitle>
        <CardDescription>
          Connect to your Google Sheets to import invoice data. The sheet must be publicly accessible.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Setup */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sheet-url">Google Sheets URL</Label>
            <Input
              id="sheet-url"
              value={sheetUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/your-sheet-id/edit"
              disabled={isConnected}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sheet-name">Sheet Name</Label>
              <Input
                id="sheet-name"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                placeholder="Sheet1"
                disabled={isConnected}
              />
            </div>
            <div className="flex items-end">
              {!isConnected ? (
                <Button onClick={connectToSheet} disabled={!sheetId || isConnecting} className="w-full">
                  {isConnecting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Sheet className="h-4 w-4 mr-2" />
                      Connect
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={refreshData} disabled={isLoading} variant="outline" className="w-full bg-transparent">
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Data
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        {!isConnected && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Setup Instructions:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Open your Google Sheet</li>
                <li>Click "Share" → "Change to anyone with the link"</li>
                <li>Set permission to "Viewer"</li>
                <li>Copy the sheet URL and paste it above</li>
              </ol>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success and Preview */}
        {isConnected && previewData.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">Connected ({sheetsData.length} rows found)</h3>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.open(sheetUrl, "_blank")}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Sheet
              </Button>
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

            {sheetsData.length > 5 && (
              <p className="text-sm text-muted-foreground text-center">
                Showing first 5 rows. {sheetsData.length - 5} more rows will be imported.
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {isConnected && (
            <Button onClick={handleImport} disabled={sheetsData.length === 0} className="flex items-center gap-2">
              <Sheet className="h-4 w-4" />
              Import {sheetsData.length} Invoice{sheetsData.length !== 1 ? "s" : ""}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
