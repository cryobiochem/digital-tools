"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, MapPin, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DataMappingProps {
  sourceHeaders: string[]
  sampleData: { [key: string]: string }[]
  onMappingComplete: (mapping: FieldMapping) => void
  onBack: () => void
}

interface FieldMapping {
  [invoiceField: string]: string // Maps invoice field to source column
}

interface InvoiceField {
  key: string
  label: string
  required: boolean
  type: "text" | "number" | "email" | "select"
  options?: string[]
}

const invoiceFields: InvoiceField[] = [
  { key: "customer", label: "Customer Name", required: true, type: "text" },
  {
    key: "customerType",
    label: "Customer Type",
    required: false,
    type: "select",
    options: ["Individual", "Business", "Educational", "Non-Profit"],
  },
  { key: "customerEmail", label: "Customer Email", required: false, type: "email" },
  { key: "customerAddress", label: "Customer Address", required: false, type: "text" },
  { key: "product", label: "Product Name", required: true, type: "text" },
  {
    key: "category",
    label: "Product Category",
    required: false,
    type: "select",
    options: ["Prototypes", "Miniatures", "Functional Parts", "Decorative Items", "Custom Design"],
  },
  {
    key: "productType",
    label: "Product Type",
    required: false,
    type: "select",
    options: ["PLA Print", "ABS Print", "PETG Print", "Resin Print", "Multi-Material"],
  },
  { key: "quantity", label: "Quantity", required: true, type: "number" },
  { key: "pricePerUnit", label: "Price per Unit", required: true, type: "number" },
  {
    key: "platform",
    label: "Platform",
    required: false,
    type: "select",
    options: ["Direct Order", "Etsy", "Website", "Referral", "Social Media"],
  },
  {
    key: "status",
    label: "Status",
    required: false,
    type: "select",
    options: ["Draft", "Sent", "Paid", "Overdue", "Cancelled"],
  },
  { key: "productionCost", label: "Production Cost", required: false, type: "number" },
  { key: "notes", label: "Additional Notes", required: false, type: "text" },
]

export function DataMapping({ sourceHeaders, sampleData, onMappingComplete, onBack }: DataMappingProps) {
  const [mapping, setMapping] = useState<FieldMapping>({})
  const [autoMapped, setAutoMapped] = useState<string[]>([])

  // Auto-map fields based on similar names
  useEffect(() => {
    const autoMapping: FieldMapping = {}
    const mapped: string[] = []

    invoiceFields.forEach((field) => {
      const similarHeader = sourceHeaders.find((header) => {
        const headerLower = header.toLowerCase()
        const fieldLower = field.label.toLowerCase()
        return (
          headerLower.includes(fieldLower.split(" ")[0]) ||
          fieldLower.includes(headerLower.split(" ")[0]) ||
          headerLower === fieldLower
        )
      })

      if (similarHeader) {
        autoMapping[field.key] = similarHeader
        mapped.push(field.key)
      }
    })

    setMapping(autoMapping)
    setAutoMapped(mapped)
  }, [sourceHeaders])

  const handleMappingChange = (invoiceField: string, sourceColumn: string) => {
    setMapping((prev) => ({
      ...prev,
      [invoiceField]: sourceColumn === "none" ? "" : sourceColumn,
    }))
  }

  const getRequiredFieldsStatus = () => {
    const requiredFields = invoiceFields.filter((field) => field.required)
    const mappedRequired = requiredFields.filter((field) => mapping[field.key])
    return {
      total: requiredFields.length,
      mapped: mappedRequired.length,
      missing: requiredFields.filter((field) => !mapping[field.key]),
    }
  }

  const canProceed = () => {
    const { mapped, total } = getRequiredFieldsStatus()
    return mapped === total
  }

  const handleProceed = () => {
    if (canProceed()) {
      onMappingComplete(mapping)
    }
  }

  const requiredStatus = getRequiredFieldsStatus()

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Map Data Fields
        </CardTitle>
        <CardDescription>
          Map your spreadsheet columns to invoice fields. Required fields must be mapped to proceed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Alert */}
        {requiredStatus.missing.length > 0 ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Missing required fields:</strong> {requiredStatus.missing.map((f) => f.label).join(", ")}
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              All required fields are mapped! {autoMapped.length > 0 && `(${autoMapped.length} fields auto-mapped)`}
            </AlertDescription>
          </Alert>
        )}

        {/* Mapping Interface */}
        <div className="grid gap-4">
          {invoiceFields.map((field) => (
            <div key={field.key} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Label className="font-medium">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  {autoMapped.includes(field.key) && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Auto-mapped</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {field.type === "number"
                    ? "Numeric value"
                    : field.type === "email"
                      ? "Email address"
                      : field.type === "select"
                        ? `Options: ${field.options?.join(", ")}`
                        : "Text value"}
                </p>
              </div>

              <ArrowRight className="h-4 w-4 text-muted-foreground" />

              <div className="flex-1">
                <Select
                  value={mapping[field.key] || "none"}
                  onValueChange={(value) => handleMappingChange(field.key, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="text-muted-foreground">Don't map</span>
                    </SelectItem>
                    {sourceHeaders.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Show sample data */}
                {mapping[field.key] && sampleData.length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <strong>Sample:</strong> {sampleData[0][mapping[field.key]] || "Empty"}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Preview Section */}
        {sampleData.length > 0 && Object.keys(mapping).length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Preview Mapped Data</h3>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      {invoiceFields
                        .filter((field) => mapping[field.key])
                        .map((field) => (
                          <th key={field.key} className="px-3 py-2 text-left font-medium">
                            {field.label}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sampleData.slice(0, 3).map((row, index) => (
                      <tr key={index} className="border-t">
                        {invoiceFields
                          .filter((field) => mapping[field.key])
                          .map((field) => (
                            <td key={field.key} className="px-3 py-2 max-w-32 truncate">
                              {row[mapping[field.key]] || "-"}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {requiredStatus.mapped}/{requiredStatus.total} required fields mapped
            </span>
            <Button onClick={handleProceed} disabled={!canProceed()} className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Continue to Import
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
