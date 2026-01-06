"use client"

import { useState, useEffect } from "react"
import { InvoiceHeader } from "@/components/invoice-header"
import { InvoiceBuilder } from "@/components/invoice-builder"
import { InvoicePreview } from "@/components/invoice-preview"
import { StripeCheckout } from "@/components/stripe-checkout"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, LinkIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { InvoiceData, InvoiceItem, AppSettings } from "@/lib/types/invoice"
import { DEFAULT_SETTINGS } from "@/lib/types/invoice"
import {
  formatInvoiceNumber,
  calculateSubtotal,
  calculateItemTotal,
  calculateTotalAmount,
  calculateRevenue,
  calculateRevenueRatio,
} from "@/lib/utils/invoice"
import { generateInvoicePDF } from "@/lib/utils/pdf"

const STORAGE_KEY = "invoices"
const SETTINGS_KEY = "app-settings"

export function InvoiceApp() {
  const { toast } = useToast()
  const [showHistory, setShowHistory] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [showPaymentLinkDialog, setShowPaymentLinkDialog] = useState(false)
  const [paymentLink, setPaymentLink] = useState("")
  const [savedInvoices, setSavedInvoices] = useState<InvoiceData[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

  const [invoice, setInvoice] = useState<InvoiceData>({
    invoiceNumber: formatInvoiceNumber(settings.invoicePrefix),
    date: new Date().toISOString().split("T")[0],
    customer: "",
    customerType: "individual",
    customerAddress: "",
    customerEmail: "",
    items: [
      {
        id: `item-${Date.now()}`,
        product: "",
        category: "",
        productType: "",
        quantity: 1,
        pricePerUnit: 0,
        total: 0,
      },
    ],
    subtotal: 0,
    totalAmount: 0,
    status: "draft",
  })

  // Load saved invoices and settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setSavedInvoices(JSON.parse(saved))
      } catch (error) {
        console.error("[v0] Error loading saved invoices:", error)
      }
    }

    const savedSettings = localStorage.getItem(SETTINGS_KEY)
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings)
        setSettings(parsedSettings)
      } catch (error) {
        console.error("[v0] Error loading settings:", error)
      }
    }
  }, [])

  // Recalculate totals whenever items or tax change
  useEffect(() => {
    const subtotal = calculateSubtotal(invoice.items)
    const tax = invoice.taxRate ? subtotal * (invoice.taxRate / 100) : 0
    const totalAmount = calculateTotalAmount(subtotal, invoice.taxRate || 0)
    const revenue = calculateRevenue(totalAmount, invoice.productionCost || 0)
    const revenueRatio = calculateRevenueRatio(totalAmount, invoice.productionCost || 0)

    setInvoice((prev) => ({
      ...prev,
      subtotal,
      tax,
      totalAmount,
      revenue,
      revenueRatio,
    }))
  }, [invoice.items, invoice.taxRate, invoice.productionCost])

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings)
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings))
    toast({
      title: "Settings Updated",
      description: "Your invoice preferences have been saved.",
    })
  }

  const handleUpdateInvoice = (field: keyof InvoiceData, value: any) => {
    setInvoice((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      product: "",
      category: "",
      productType: "",
      quantity: 1,
      pricePerUnit: 0,
      total: 0,
    }
    setInvoice((prev) => ({ ...prev, items: [...prev.items, newItem] }))
  }

  const handleRemoveItem = (itemId: string) => {
    if (invoice.items.length <= 1) {
      toast({
        title: "Cannot Remove",
        description: "At least one item is required.",
        variant: "destructive",
      })
      return
    }
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }))
  }

  const handleUpdateItem = (itemId: string, field: keyof InvoiceItem, value: any) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value }
          // Recalculate total when quantity or price changes
          if (field === "quantity" || field === "pricePerUnit") {
            updatedItem.total = calculateItemTotal(updatedItem.quantity, updatedItem.pricePerUnit)
          }
          return updatedItem
        }
        return item
      }),
    }))
  }

  const handleSaveInvoice = async () => {
    if (!invoice.customer || invoice.items.some((item) => !item.product)) {
      toast({
        title: "Missing Information",
        description: "Please fill in customer name and all product details.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const now = new Date().toISOString()
      const savedInvoice = {
        ...invoice,
        updatedAt: now,
        createdAt: invoice.createdAt || now,
      }

      // Check if invoice already exists
      const existingIndex = savedInvoices.findIndex((inv) => inv.invoiceNumber === invoice.invoiceNumber)

      let updatedInvoices: InvoiceData[]
      if (existingIndex >= 0) {
        // Update existing
        updatedInvoices = [...savedInvoices]
        updatedInvoices[existingIndex] = savedInvoice
      } else {
        // Add new
        updatedInvoices = [savedInvoice, ...savedInvoices]
      }

      setSavedInvoices(updatedInvoices)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedInvoices))

      toast({
        title: "Invoice Saved",
        description: `Invoice ${invoice.invoiceNumber} has been saved successfully.`,
      })
    } catch (error) {
      console.error("[v0] Error saving invoice:", error)
      toast({
        title: "Save Failed",
        description: "There was an error saving the invoice.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleGeneratePDF = async () => {
    if (!invoice.customer || invoice.items.some((item) => !item.product)) {
      toast({
        title: "Missing Information",
        description: "Please fill in customer name and all product details.",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingPDF(true)

    try {
      // First save the invoice
      await handleSaveInvoice()

      // Generate and download PDF
      await generateInvoicePDF(invoice, settings.currency)

      toast({
        title: "PDF Generated",
        description: "Your invoice PDF is ready to download.",
      })
    } catch (error) {
      console.error("[v0] Error generating PDF:", error)
      toast({
        title: "PDF Generation Failed",
        description: error instanceof Error ? error.message : "There was an error generating the PDF.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handlePayInvoice = () => {
    if (!invoice.customerEmail) {
      toast({
        title: "Email Required",
        description: "Customer email is required for payment.",
        variant: "destructive",
      })
      return
    }

    if (invoice.totalAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Invoice total must be greater than zero.",
        variant: "destructive",
      })
      return
    }

    setShowPayment(true)
  }

  const handleSendPaymentLink = () => {
    if (!invoice.customerEmail) {
      toast({
        title: "Email Required",
        description: "Customer email is required to send payment link.",
        variant: "destructive",
      })
      return
    }

    if (invoice.totalAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Invoice total must be greater than zero.",
        variant: "destructive",
      })
      return
    }

    // Generate payment link URL
    const link = `${window.location.origin}/payment/${encodeURIComponent(invoice.invoiceNumber)}`
    setPaymentLink(link)
    setShowPaymentLinkDialog(true)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(paymentLink)
      toast({
        title: "Link Copied",
        description: "Payment link copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link. Please copy manually.",
        variant: "destructive",
      })
    }
  }

  const handlePaymentSuccess = (paymentIntentId: string) => {
    // Update invoice status to paid
    const updatedInvoice = {
      ...invoice,
      status: "paid" as const,
      paidAt: new Date().toISOString(),
      stripePaymentIntentId: paymentIntentId,
    }

    setInvoice(updatedInvoice)

    // Save to localStorage
    const existingIndex = savedInvoices.findIndex((inv) => inv.invoiceNumber === invoice.invoiceNumber)
    const updatedInvoices = [...savedInvoices]
    if (existingIndex >= 0) {
      updatedInvoices[existingIndex] = updatedInvoice
    } else {
      updatedInvoices.unshift(updatedInvoice)
    }

    setSavedInvoices(updatedInvoices)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedInvoices))

    toast({
      title: "Payment Successful",
      description: `Invoice ${invoice.invoiceNumber} has been marked as paid.`,
    })
  }

  const handleNewInvoice = () => {
    setInvoice({
      invoiceNumber: formatInvoiceNumber(settings.invoicePrefix),
      date: new Date().toISOString().split("T")[0],
      customer: "",
      customerType: "individual",
      customerAddress: "",
      customerEmail: "",
      items: [
        {
          id: `item-${Date.now()}`,
          product: "",
          category: "",
          productType: "",
          quantity: 1,
          pricePerUnit: 0,
          total: 0,
        },
      ],
      subtotal: 0,
      totalAmount: 0,
      status: "draft",
    })
    setShowHistory(false)
    toast({
      title: "New Invoice Created",
      description: "Ready to create a new invoice.",
    })
  }

  const handleLoadInvoice = (loadedInvoice: InvoiceData) => {
    setInvoice(loadedInvoice)
    setShowHistory(false)
    toast({
      title: "Invoice Loaded",
      description: `Invoice ${loadedInvoice.invoiceNumber} loaded for editing.`,
    })
  }

  const handleDeleteInvoice = (invoiceNumber: string) => {
    const updatedInvoices = savedInvoices.filter((inv) => inv.invoiceNumber !== invoiceNumber)
    setSavedInvoices(updatedInvoices)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedInvoices))

    toast({
      title: "Invoice Deleted",
      description: `Invoice ${invoiceNumber} has been deleted.`,
    })
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <InvoiceHeader
          onNewInvoice={handleNewInvoice}
          onShowHistory={() => setShowHistory(true)}
          showHistory={showHistory}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
        />

        <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Two-panel layout */}
          <div className="grid gap-8 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_480px]">
            {/* Left: Invoice Builder */}
            <div className="min-w-0">
              <InvoiceBuilder
                invoice={invoice}
                onUpdate={handleUpdateInvoice}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
                onUpdateItem={handleUpdateItem}
                currency={settings.currency}
              />
            </div>

            {/* Right: Invoice Preview (sticky) */}
            <div className="lg:sticky lg:top-24 lg:h-fit">
              <InvoicePreview
                invoice={invoice}
                onSave={handleSaveInvoice}
                onGeneratePDF={handleGeneratePDF}
                onPayInvoice={handlePayInvoice}
                onSendPaymentLink={handleSendPaymentLink}
                isSaving={isSaving}
                isGeneratingPDF={isGeneratingPDF}
                currency={settings.currency}
              />
            </div>
          </div>
        </main>
      </div>

      {/* History Sidebar */}
      <Sheet open={showHistory} onOpenChange={setShowHistory}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Invoice History</SheetTitle>
            <SheetDescription>View and manage your saved invoices</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {savedInvoices.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No saved invoices yet. Create and save your first invoice to see it here.
                </AlertDescription>
              </Alert>
            ) : (
              savedInvoices.map((savedInvoice) => (
                <div key={savedInvoice.invoiceNumber} className="rounded-lg border bg-card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{savedInvoice.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground truncate">{savedInvoice.customer}</p>
                    </div>
                    <Badge
                      variant={
                        savedInvoice.status === "paid"
                          ? "default"
                          : savedInvoice.status === "sent"
                            ? "outline"
                            : "secondary"
                      }
                      className={
                        savedInvoice.status === "paid"
                          ? "bg-green-600"
                          : savedInvoice.status === "sent"
                            ? "border-blue-500 text-blue-700 bg-blue-50"
                            : ""
                      }
                    >
                      {savedInvoice.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-semibold">
                      {settings.currency.symbol}
                      {savedInvoice.totalAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadInvoice(savedInvoice)}
                      className="flex-1 gap-2"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteInvoice(savedInvoice.invoiceNumber)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Payment Link Dialog */}
      <Sheet open={showPaymentLinkDialog} onOpenChange={setShowPaymentLinkDialog}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Payment Link Generated</SheetTitle>
            <SheetDescription>Share this link with your customer or pay directly</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="break-all text-sm font-mono">{paymentLink}</p>
            </div>

            <div className="space-y-2">
              <Button onClick={handleCopyLink} variant="outline" className="w-full gap-2 bg-transparent">
                <LinkIcon className="h-4 w-4" />
                Copy Payment Link
              </Button>

              <Button
                onClick={() => {
                  setShowPaymentLinkDialog(false)
                  handlePayInvoice()
                }}
                className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white"
              >
                Pay Invoice
              </Button>
            </div>

            <Alert>
              <AlertDescription>
                Send this link to <strong>{invoice.customerEmail}</strong> to allow them to view the invoice and make a
                payment, or pay directly using the button above.
              </AlertDescription>
            </Alert>
          </div>
        </SheetContent>
      </Sheet>

      {/* Stripe Checkout Dialog */}
      <StripeCheckout
        invoice={invoice}
        open={showPayment}
        onClose={() => setShowPayment(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  )
}
