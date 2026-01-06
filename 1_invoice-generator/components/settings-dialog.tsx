"use client"

import { useState } from "react"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AppSettings } from "@/lib/types/invoice"
import { CURRENCIES } from "@/lib/types/invoice"

interface SettingsDialogProps {
  settings: AppSettings
  onUpdateSettings: (settings: AppSettings) => void
}

export function SettingsDialog({ settings, onUpdateSettings }: SettingsDialogProps) {
  const [open, setOpen] = useState(false)
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings)

  const handleSave = () => {
    onUpdateSettings(localSettings)
    setOpen(false)
  }

  const handleCancel = () => {
    setLocalSettings(settings)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invoice Settings</DialogTitle>
          <DialogDescription>
            Customize your invoice preferences including currency and invoice number prefix.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Currency Selection */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={localSettings.currency.code}
              onValueChange={(code) => {
                const currency = CURRENCIES.find((c) => c.code === code)
                if (currency) {
                  setLocalSettings({ ...localSettings, currency })
                }
              }}
            >
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Select the currency for your invoices</p>
          </div>

          {/* Invoice Prefix */}
          <div className="space-y-2">
            <Label htmlFor="prefix">Invoice Number Prefix</Label>
            <Input
              id="prefix"
              value={localSettings.invoicePrefix}
              onChange={(e) => {
                const value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "")
                setLocalSettings({ ...localSettings, invoicePrefix: value })
              }}
              placeholder="TEST"
              maxLength={10}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              This prefix will be used for all new invoice numbers (e.g., {localSettings.invoicePrefix || "TEST"}
              -2024-001)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
