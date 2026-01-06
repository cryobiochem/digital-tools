"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Eye, Trash2, X } from "lucide-react"

interface InvoiceData {
  invoiceNumber: string
  date: string
  customer: string
  customerType: string
  customerAddress: string
  customerEmail: string
  product: string
  category: string
  productType: string
  quantity: number
  pricePerUnit: number
  totalSaleAmount: number
  productionCost: number
  revenue: number
  revenueRatio: number
  platform: string
  status: string
  notes: string
  createdAt?: string
  updatedAt?: string
}

interface InvoiceHistoryProps {
  invoices: InvoiceData[]
  onLoadInvoice: (invoice: InvoiceData) => void
  onDeleteInvoice: (invoiceNumber: string) => void
  onClose: () => void
}

export function InvoiceHistory({ invoices, onLoadInvoice, onDeleteInvoice, onClose }: InvoiceHistoryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800"
      case "Sent":
        return "bg-blue-100 text-blue-800"
      case "Overdue":
        return "bg-red-100 text-red-800"
      case "Cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.revenue, 0)
  const paidInvoices = invoices.filter((inv) => inv.status === "Paid")
  const pendingInvoices = invoices.filter((inv) => inv.status === "Sent")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <img src="/generic_logo.png" alt="Logo" className="h-5 w-5 object-contain" />
            Invoice History
          </span>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-muted p-4 rounded-lg text-center">
            <p className="text-2xl font-bold">{invoices.length}</p>
            <p className="text-sm text-muted-foreground">Total Invoices</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-700">{paidInvoices.length}</p>
            <p className="text-sm text-green-600">Paid</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-700">{pendingInvoices.length}</p>
            <p className="text-sm text-blue-600">Pending</p>
          </div>
          <div className="bg-primary/10 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-primary">€{totalRevenue.toFixed(2)}</p>
            <p className="text-sm text-primary/70">Total Revenue</p>
          </div>
        </div>

        <Separator />

        {/* Invoice List */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <img src="/generic_logo.png" alt="Logo" className="h-12 w-12 mx-auto mb-4 opacity-50 object-contain" />
              <p>No saved invoices yet</p>
              <p className="text-sm">Create and save your first invoice to see it here</p>
            </div>
          ) : (
            invoices.map((invoice) => (
              <Card key={invoice.invoiceNumber} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold">{invoice.invoiceNumber}</h4>
                      <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                      <p>
                        <span className="font-medium">Customer:</span> {invoice.customer}
                      </p>
                      <p>
                        <span className="font-medium">Product:</span> {invoice.product}
                      </p>
                      <p>
                        <span className="font-medium">Amount:</span> €{invoice.totalSaleAmount.toFixed(2)}
                      </p>
                      <p>
                        <span className="font-medium">Date:</span> {formatDate(invoice.date)}
                      </p>
                      <p>
                        <span className="font-medium">Revenue:</span> €{invoice.revenue.toFixed(2)}
                      </p>
                      <p>
                        <span className="font-medium">Platform:</span> {invoice.platform || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button onClick={() => onLoadInvoice(invoice)} variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Load
                    </Button>
                    <Button
                      onClick={() => onDeleteInvoice(invoice.invoiceNumber)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const STORAGE_KEY = "invoices"

export function useInvoices() {
  const [invoices, setInvoices] = React.useState<InvoiceData[]>([])

  React.useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      setInvoices(JSON.parse(saved))
    }
  }, [])

  const saveInvoices = (list: InvoiceData[]) => {
    setInvoices(list)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  }

  return { invoices, saveInvoices }
}
