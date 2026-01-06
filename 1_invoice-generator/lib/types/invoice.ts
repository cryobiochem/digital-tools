export type PaymentStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled"
export type CustomerType = "individual" | "company" | "direct-order"

export interface InvoiceItem {
  id: string
  product: string
  category: string
  productType: string
  quantity: number
  pricePerUnit: number
  total: number
}

export interface InvoiceData {
  invoiceNumber: string
  date: string
  dueDate?: string
  customer: string
  customerType: CustomerType
  customerAddress: string
  customerEmail: string
  items: InvoiceItem[]
  subtotal: number
  tax?: number
  taxRate?: number
  totalAmount: number
  productionCost?: number
  revenue?: number
  revenueRatio?: number
  platform?: string
  status: PaymentStatus
  notes?: string
  createdAt?: string
  updatedAt?: string
  paidAt?: string
  stripePaymentIntentId?: string
  stripeCheckoutSessionId?: string
}

export interface InvoiceFormData extends Omit<InvoiceData, "subtotal" | "totalAmount"> {
  // Form-specific fields if needed
}

export interface AppSettings {
  currency: Currency
  invoicePrefix: string
}

export interface Currency {
  code: string
  symbol: string
  name: string
}

export const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "MXN", symbol: "$", name: "Mexican Peso" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "ZAR", symbol: "R", name: "South African Rand" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
  { code: "DKK", symbol: "kr", name: "Danish Krone" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "PLN", symbol: "zł", name: "Polish Zloty" },
]

export const DEFAULT_SETTINGS: AppSettings = {
  currency: CURRENCIES[0], // USD by default
  invoicePrefix: "TEST",
}
