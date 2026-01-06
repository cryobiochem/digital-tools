"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2 } from "lucide-react"
import type { InvoiceData, InvoiceItem, Currency } from "@/lib/types/invoice"

interface InvoiceBuilderProps {
  invoice: InvoiceData
  onUpdate: (field: keyof InvoiceData, value: any) => void
  onAddItem: () => void
  onRemoveItem: (itemId: string) => void
  onUpdateItem: (itemId: string, field: keyof InvoiceItem, value: any) => void
  currency: Currency
}

export function InvoiceBuilder({
  invoice,
  onUpdate,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  currency,
}: InvoiceBuilderProps) {
  return (
    <div className="space-y-6">
      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Client Information</CardTitle>
          <CardDescription>Enter your client's contact and billing details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customer">Client Name *</Label>
              <Input
                id="customer"
                placeholder="John Doe or Acme Corp"
                value={invoice.customer}
                onChange={(e) => onUpdate("customer", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerType">Client Type</Label>
              <Select value={invoice.customerType} onValueChange={(value) => onUpdate("customerType", value)}>
                <SelectTrigger id="customerType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="direct-order">Direct Order</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail">Email Address</Label>
            <Input
              id="customerEmail"
              type="email"
              placeholder="client@example.com"
              value={invoice.customerEmail}
              onChange={(e) => onUpdate("customerEmail", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerAddress">Billing Address</Label>
            <Textarea
              id="customerAddress"
              placeholder="123 Main St, City, State, ZIP"
              rows={3}
              value={invoice.customerAddress}
              onChange={(e) => onUpdate("customerAddress", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoice Details</CardTitle>
          <CardDescription>Set invoice dates and reference information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input id="invoiceNumber" value={invoice.invoiceNumber} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Issue Date</Label>
              <Input id="date" type="date" value={invoice.date} onChange={(e) => onUpdate("date", e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={invoice.dueDate || ""}
                onChange={(e) => onUpdate("dueDate", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform / Source</Label>
              <Input
                id="platform"
                placeholder="e.g., Website, Etsy, Direct"
                value={invoice.platform || ""}
                onChange={(e) => onUpdate("platform", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={invoice.status} onValueChange={(value) => onUpdate("status", value)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Line Items</CardTitle>
              <CardDescription>Add products or services to this invoice</CardDescription>
            </div>
            <Button onClick={onAddItem} size="sm" variant="outline" className="gap-2 bg-transparent">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {invoice.items.map((item, index) => (
            <div key={item.id} className="space-y-4">
              {index > 0 && <Separator />}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`product-${item.id}`}>Product / Service *</Label>
                        <Input
                          id={`product-${item.id}`}
                          placeholder="Product or Service Name"
                          value={item.product}
                          onChange={(e) => onUpdateItem(item.id, "product", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`category-${item.id}`}>Category</Label>
                        <Input
                          id={`category-${item.id}`}
                          placeholder="e.g., Consulting, Products"
                          value={item.category}
                          onChange={(e) => onUpdateItem(item.id, "category", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-4">
                      <div className="space-y-2">
                        <Label htmlFor={`productType-${item.id}`}>Type</Label>
                        <Input
                          id={`productType-${item.id}`}
                          placeholder="Variant or Type"
                          value={item.productType}
                          onChange={(e) => onUpdateItem(item.id, "productType", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
                        <Input
                          id={`quantity-${item.id}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => onUpdateItem(item.id, "quantity", Number.parseInt(e.target.value) || 1)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`pricePerUnit-${item.id}`}>Unit Price ({currency.symbol})</Label>
                        <Input
                          id={`pricePerUnit-${item.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={item.pricePerUnit}
                          onChange={(e) =>
                            onUpdateItem(item.id, "pricePerUnit", Number.parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`total-${item.id}`}>Total</Label>
                        <Input
                          id={`total-${item.id}`}
                          value={`${currency.symbol}${item.total.toFixed(2)}`}
                          disabled
                          className="bg-muted font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {invoice.items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(item.id)}
                      className="mt-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Additional Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Additional Details</CardTitle>
          <CardDescription>Production costs, taxes, and notes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="productionCost">Production Cost (Optional)</Label>
              <Input
                id="productionCost"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={invoice.productionCost || ""}
                onChange={(e) => onUpdate("productionCost", Number.parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">For internal tracking only</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="0.00"
                value={invoice.taxRate || ""}
                onChange={(e) => onUpdate("taxRate", Number.parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes / Terms</Label>
            <div className="mb-2 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  onUpdate(
                    "notes",
                    "Thank you for your business! We appreciate your trust and look forward to serving you again.",
                  )
                }
              >
                Thank You
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  onUpdate(
                    "notes",
                    "Payment is due within 30 days of invoice date. Late payments may incur additional fees. Please include invoice number with payment.",
                  )
                }
              >
                Payment Terms
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  onUpdate(
                    "notes",
                    "Please note: We are experiencing high volume during the holiday season. Delivery may take 3-5 additional business days. Thank you for your patience!",
                  )
                }
              >
                Holiday Delays
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  onUpdate(
                    "notes",
                    "NOTICE: High volume period. Current processing time is 7-10 business days. We appreciate your understanding and patience during this busy season.",
                  )
                }
              >
                High Volume
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  onUpdate(
                    "notes",
                    "⚠️ FRAGILE: This shipment contains delicate items. Please handle with care and inspect upon delivery. Report any damage within 48 hours.",
                  )
                }
              >
                Fragile Warning
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  onUpdate(
                    "notes",
                    "DISCLAIMER: All sales are final. No refunds or exchanges unless product is defective. Warranty terms apply as stated in our terms of service.",
                  )
                }
              >
                Disclaimer
              </Button>
            </div>
            <Textarea
              id="notes"
              placeholder="Payment terms, delivery notes, or special instructions..."
              rows={4}
              value={invoice.notes || ""}
              onChange={(e) => onUpdate("notes", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
