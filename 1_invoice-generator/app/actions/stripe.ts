"use server"

import { stripe } from "@/lib/stripe"
import type { InvoiceData } from "@/lib/types/invoice"

export async function createCheckoutSession(invoice: InvoiceData) {
  try {
    // Validate invoice has required data
    if (!invoice.customer || !invoice.customerEmail) {
      throw new Error("Customer name and email are required")
    }

    if (!invoice.items || invoice.items.length === 0) {
      throw new Error("Invoice must have at least one item")
    }

    if (invoice.totalAmount <= 0) {
      throw new Error("Invoice total must be greater than zero")
    }

    // Create line items from invoice items
    const lineItems = invoice.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product,
          description: item.category
            ? `${item.category}${item.productType ? ` - ${item.productType}` : ""}`
            : undefined,
        },
        unit_amount: Math.round(item.pricePerUnit * 100), // Convert to cents
      },
      quantity: item.quantity,
    }))

    // Add tax as a separate line item if applicable
    if (invoice.tax && invoice.tax > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Tax",
            description: `${invoice.taxRate}% tax`,
          },
          unit_amount: Math.round(invoice.tax * 100),
        },
        quantity: 1,
      })
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      redirect_on_completion: "never",
      line_items: lineItems,
      mode: "payment",
      customer_email: invoice.customerEmail,
      metadata: {
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customer,
      },
      // Configure payment collection
      payment_intent_data: {
        metadata: {
          invoiceNumber: invoice.invoiceNumber,
        },
        description: `Invoice ${invoice.invoiceNumber} for ${invoice.customer}`,
      },
    })

    return {
      success: true,
      clientSecret: session.client_secret,
      sessionId: session.id,
    }
  } catch (error) {
    console.error("[v0] Error creating checkout session:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create checkout session",
    }
  }
}

export async function checkPaymentStatus(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    return {
      success: true,
      status: session.payment_status,
      paymentIntentId: session.payment_intent as string,
    }
  } catch (error) {
    console.error("[v0] Error checking payment status:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to check payment status",
    }
  }
}
