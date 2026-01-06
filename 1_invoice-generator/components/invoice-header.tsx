"use client"

import { Plus, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SettingsDialog } from "@/components/settings-dialog"
import type { AppSettings } from "@/lib/types/invoice"

interface InvoiceHeaderProps {
  onNewInvoice: () => void
  onShowHistory: () => void
  showHistory: boolean
  settings: AppSettings
  onUpdateSettings: (settings: AppSettings) => void
}

export function InvoiceHeader({
  onNewInvoice,
  onShowHistory,
  showHistory,
  settings,
  onUpdateSettings,
}: InvoiceHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and brand */}
        <div className="flex items-center gap-3">
          <img src="/generic_logo.png" alt="Logo" className="h-10 w-10 object-contain" />
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold leading-none tracking-tight text-foreground">
              Personalized Invoice Generator
            </h1>
            <p className="text-xs text-muted-foreground">Template created by: linkedin.com/in/bmguerreiro</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="hidden sm:flex items-center gap-1.5 px-2.5 py-1">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
              <path d="M12 6c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z" />
            </svg>
            <span className="text-xs font-medium">Powered by Stripe (integration only available in Live Production Build)</span>
          </Badge>

          <SettingsDialog settings={settings} onUpdateSettings={onUpdateSettings} />

          <Button variant="outline" size="sm" onClick={onShowHistory} className="gap-2 bg-transparent">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">{showHistory ? "Close" : "History"}</span>
          </Button>

          <Button size="sm" onClick={onNewInvoice} className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Invoice</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
