"use client"

import { useEffect, useState } from "react"
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import type { InvoiceData } from "@/lib/types/invoice"
import { createCheckoutSession, checkPaymentStatus } from "@/app/actions/stripe"

// Initialize Stripe outside component to avoid recreating
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripeCheckoutProps {
  invoice: InvoiceData
  open: boolean
  onClose: () => void
  onPaymentSuccess: (paymentIntentId: string) => void
}

export function StripeCheckout({ invoice, open, onClose, onPaymentSuccess }: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle")

  useEffect(() => {
    if (open && !clientSecret) {
      // Create checkout session when dialog opens
      createCheckoutSession(invoice)
        .then((result) => {
          if (result.success && result.clientSecret) {
            setClientSecret(result.clientSecret)
            setSessionId(result.sessionId || null)
            setError(null)
          } else {
            setError(result.error || "Failed to initialize payment")
          }
        })
        .catch((err) => {
          setError(err.message || "An unexpected error occurred")
        })
    }
  }, [open, invoice, clientSecret])

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setClientSecret(null)
      setSessionId(null)
      setError(null)
      setPaymentStatus("idle")
    }
  }, [open])

  const handlePaymentComplete = async () => {
    if (!sessionId) return

    setPaymentStatus("processing")

    try {
      const result = await checkPaymentStatus(sessionId)

      if (result.success && result.status === "paid" && result.paymentIntentId) {
        setPaymentStatus("success")
        // Wait a moment to show success state
        setTimeout(() => {
          onPaymentSuccess(result.paymentIntentId!)
          onClose()
        }, 1500)
      } else {
        setPaymentStatus("error")
        setError("Payment was not completed. Please try again.")
      }
    } catch (err) {
      setPaymentStatus("error")
      setError(err instanceof Error ? err.message : "Failed to verify payment")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pay Invoice {invoice.invoiceNumber}</DialogTitle>
          <DialogDescription>
            Complete your payment securely using Stripe. Total amount: ${invoice.totalAmount.toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {paymentStatus === "success" && (
            <Alert className="border-green-500 bg-green-50 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Payment completed successfully!</AlertDescription>
            </Alert>
          )}

          {paymentStatus === "processing" && (
            <div className="flex items-center justify-center gap-2 rounded-lg border bg-muted/50 p-8">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-sm font-medium">Verifying payment...</p>
            </div>
          )}

          {clientSecret && paymentStatus === "idle" && (
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ clientSecret, onComplete: handlePaymentComplete }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          )}

          {!clientSecret && !error && paymentStatus === "idle" && (
            <div className="flex items-center justify-center gap-2 rounded-lg border bg-muted/50 p-8">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-sm font-medium">Initializing payment...</p>
            </div>
          )}

          {error && (
            <div className="flex justify-end">
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
