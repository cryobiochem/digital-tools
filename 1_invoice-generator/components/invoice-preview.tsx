"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FileText, Download, Check, LinkIcon } from "lucide-react"
import type { InvoiceData, PaymentStatus, Currency } from "@/lib/types/invoice"
import { formatCurrency } from "@/lib/utils/invoice"

interface InvoicePreviewProps {
  invoice: InvoiceData
  onSave: () => void
  onGeneratePDF: () => void
  onPayInvoice: () => void
  onSendPaymentLink?: () => void
  isSaving?: boolean
  isGeneratingPDF?: boolean
  isProcessingPayment?: boolean
  currency: Currency
}

const statusConfig: Record<
  PaymentStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }
> = {
  draft: { label: "Draft", variant: "secondary" },
  sent: { label: "Sent", variant: "outline", className: "border-purple-500 text-purple-700 bg-purple-50" },
  paid: { label: "Paid", variant: "default", className: "bg-green-600 hover:bg-green-700" },
  overdue: { label: "Overdue", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "outline", className: "text-muted-foreground" },
}

export function InvoicePreview({
  invoice,
  onSave,
  onGeneratePDF,
  onPayInvoice,
  onSendPaymentLink,
  isSaving,
  isGeneratingPDF,
  isProcessingPayment,
  currency,
}: InvoicePreviewProps) {
  const statusStyle = statusConfig[invoice.status]
  const canSendPaymentLink = invoice.status === "sent" && invoice.totalAmount > 0
  const isPaid = invoice.status === "paid"

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <Card>
        <CardContent className="flex flex-col gap-3 pt-6">
          <Button onClick={onSave} disabled={isSaving} className="w-full gap-2">
            {isSaving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Save Invoice
              </>
            )}
          </Button>

          <Button
            onClick={onGeneratePDF}
            disabled={isGeneratingPDF}
            variant="outline"
            className="w-full gap-2 bg-transparent"
          >
            {isGeneratingPDF ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>

          {canSendPaymentLink && onSendPaymentLink && (
            <Button
              onClick={onSendPaymentLink}
              variant="default"
              className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <LinkIcon className="h-4 w-4" />
              Send Payment Link to Customer
            </Button>
          )}

          {isPaid && (
            <div className="flex items-center justify-center gap-2 rounded-md bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
              <Check className="h-4 w-4" />
              Invoice Paid
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Preview */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/30 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">INVOICE</h2>
              <p className="mt-1 text-sm text-muted-foreground">{invoice.invoiceNumber}</p>
            </div>
            <Badge variant={statusStyle.variant} className={statusStyle.className}>
              {statusStyle.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Company & Client Info */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">FROM</p>
              <p className="font-semibold">Your Business</p>
              <p className="text-sm text-muted-foreground">Professional billing solutions</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">BILL TO</p>
              <p className="font-semibold">{invoice.customer || "—"}</p>
              {invoice.customerEmail && <p className="text-sm text-muted-foreground">{invoice.customerEmail}</p>}
              {invoice.customerAddress && (
                <p className="text-sm text-muted-foreground whitespace-pre-line">{invoice.customerAddress}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Invoice Details */}
          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">ISSUE DATE</p>
              <p>{invoice.date ? new Date(invoice.date).toLocaleDateString() : "—"}</p>
            </div>
            {invoice.dueDate && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">DUE DATE</p>
                <p>{new Date(invoice.dueDate).toLocaleDateString()}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Line Items */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground">ITEMS</p>
            <div className="space-y-2">
              {invoice.items.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4 text-sm">
                  <div className="flex-1">
                    <p className="font-medium">{item.product || "Untitled Item"}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} × {formatCurrency(item.pricePerUnit, currency)}
                    </p>
                  </div>
                  <p className="font-semibold">{formatCurrency(item.total, currency)}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">Subtotal</p>
              <p className="font-medium">{formatCurrency(invoice.subtotal, currency)}</p>
            </div>

            {invoice.tax && invoice.tax > 0 && (
              <div className="flex items-center justify-between text-sm">
                <p className="text-muted-foreground">Tax ({invoice.taxRate}%)</p>
                <p className="font-medium">{formatCurrency(invoice.tax, currency)}</p>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold">Total</p>
              <p className="text-2xl font-bold">{formatCurrency(invoice.totalAmount, currency)}</p>
            </div>
          </div>

          {/* Revenue Metrics (Internal) */}
          {invoice.productionCost !== undefined && invoice.productionCost > 0 && (
            <>
              <Separator />
              <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                <p className="text-xs font-medium text-muted-foreground">INTERNAL METRICS</p>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">Production Cost</p>
                    <p className="font-medium">{formatCurrency(invoice.productionCost, currency)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">Revenue</p>
                    <p className="font-medium text-green-600">{formatCurrency(invoice.revenue || 0, currency)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">Revenue Ratio</p>
                    <p className="font-medium">{invoice.revenueRatio?.toFixed(2)}x</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {invoice.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">NOTES</p>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{invoice.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
