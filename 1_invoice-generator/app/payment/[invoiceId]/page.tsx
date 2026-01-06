"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, CheckCircle } from "lucide-react"
import { StripeCheckout } from "@/components/stripe-checkout"
import type { InvoiceData, PaymentStatus, Currency } from "@/lib/types/invoice"
import { formatCurrency } from "@/lib/utils/invoice"
import { DEFAULT_SETTINGS } from "@/lib/types/invoice"

const STORAGE_KEY = "daxx-invoices"
const SETTINGS_KEY = "daxx-settings"

const statusConfig: Record<
  PaymentStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }
> = {
  draft: { label: "Draft", variant: "secondary" },
  sent: { label: "Sent", variant: "outline", className: "border-blue-500 text-blue-700 bg-blue-50" },
  paid: { label: "Paid", variant: "default", className: "bg-green-600 hover:bg-green-700" },
  overdue: { label: "Overdue", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "outline", className: "text-muted-foreground" },
}

export default function PaymentPage() {
  const params = useParams()
  const invoiceId = params.invoiceId as string
  const [invoice, setInvoice] = useState<InvoiceData | null>(null)
  const [currency, setCurrency] = useState<Currency>(DEFAULT_SETTINGS.currency)
  const [showPayment, setShowPayment] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load invoice from localStorage
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const invoices: InvoiceData[] = JSON.parse(saved)
        const foundInvoice = invoices.find((inv) => inv.invoiceNumber === invoiceId)
        setInvoice(foundInvoice || null)
      } catch (error) {
        console.error("[v0] Error loading invoice:", error)
      }
    }

    // Load settings for currency
    const savedSettings = localStorage.getItem(SETTINGS_KEY)
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings)
        setCurrency(settings.currency || DEFAULT_SETTINGS.currency)
      } catch (error) {
        console.error("[v0] Error loading settings:", error)
      }
    }

    setLoading(false)
  }, [invoiceId])

  const handlePaymentSuccess = (paymentIntentId: string) => {
    if (!invoice) return

    // Update invoice status to paid
    const updatedInvoice = {
      ...invoice,
      status: "paid" as const,
      paidAt: new Date().toISOString(),
      stripePaymentIntentId: paymentIntentId,
    }

    setInvoice(updatedInvoice)

    // Save to localStorage
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const invoices: InvoiceData[] = JSON.parse(saved)
        const updatedInvoices = invoices.map((inv) =>
          inv.invoiceNumber === invoice.invoiceNumber ? updatedInvoice : inv,
        )
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedInvoices))
      } catch (error) {
        console.error("[v0] Error updating invoice:", error)
      }
    }

    setShowPayment(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Alert className="max-w-md">
          <AlertDescription>Invoice not found. Please check the link and try again.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const statusStyle = statusConfig[invoice.status]
  const isPaid = invoice.status === "paid"
  const canPay = invoice.status === "sent" && invoice.totalAmount > 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <CreditCard className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">Personalized Invoice Generator</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Pay Invoice Button - Top */}
          {canPay && !isPaid && (
            <div className="mb-8">
              <Button onClick={() => setShowPayment(true)} size="lg" className="w-full gap-2 text-base">
                <CreditCard className="h-5 w-5" />
                Pay Invoice
              </Button>
            </div>
          )}

          {/* Paid Status Banner */}
          {isPaid && (
            <div className="mb-8 flex items-center justify-center gap-3 rounded-lg bg-green-50 px-6 py-4 text-green-700">
              <CheckCircle className="h-6 w-6" />
              <span className="text-lg font-semibold">This invoice has been paid</span>
            </div>
          )}

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
                  <p className="text-sm text-muted-foreground">Template created by: linkedin.com/in/bmguerreiro</p>
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
      </main>

      {/* Stripe Checkout Dialog */}
      {invoice && (
        <StripeCheckout
          invoice={invoice}
          open={showPayment}
          onClose={() => setShowPayment(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}
