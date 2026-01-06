import type { InvoiceItem, Currency } from "@/lib/types/invoice"

export function calculateSubtotal(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => sum + item.total, 0)
}

export function calculateItemTotal(quantity: number, pricePerUnit: number): number {
  return quantity * pricePerUnit
}

export function calculateTotalAmount(subtotal: number, taxRate = 0): number {
  const tax = subtotal * (taxRate / 100)
  return subtotal + tax
}

export function calculateRevenue(totalAmount: number, productionCost = 0): number {
  return totalAmount - productionCost
}

export function calculateRevenueRatio(totalAmount: number, productionCost = 0): number {
  if (productionCost === 0) return 0
  return Number((totalAmount / productionCost).toFixed(2))
}

export function formatCurrency(amount: number, currency?: Currency): string {
  const curr = currency || { code: "USD", symbol: "$", name: "US Dollar" }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: curr.code,
  }).format(amount)
}

export function formatInvoiceNumber(prefix = "TEST"): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `${prefix}-${year}${month}-${random}`
}

export function generateInvoiceId(): string {
  return `invoice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
