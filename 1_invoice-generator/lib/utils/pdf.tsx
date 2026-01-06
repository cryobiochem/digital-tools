import type { InvoiceData, Currency } from "@/lib/types/invoice"
import { formatCurrency } from "./invoice"

export async function generateInvoicePDF(invoice: InvoiceData, currency: Currency): Promise<void> {
  // Try to fetch and embed the generic logo from public folder
  let logoDataUrl: string | null = null
  try {
    const resp = await fetch("/generic_logo.png")
    if (resp.ok) {
      const blob = await resp.blob()
      const reader = new FileReader()
      logoDataUrl = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(blob)
      })
    }
  } catch (e) {
    // ignore - we'll fall back to text logo
  }

  // Create a printable HTML version
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    throw new Error("Popup blocked. Please allow popups to download PDF.")
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 40px;
          color: #000000ff;
          line-height: 1.6;
        }
        .container { max-width: 800px; margin: 0 auto; }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e2e8f0;
        }
        .logo { font-size: 24px; font-weight: 700; color: #27837C; }
        .invoice-title { font-size: 32px; font-weight: 700; text-align: right; }
        .invoice-number { color: #64748b; font-size: 14px; margin-top: 5px; }
        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          margin-top: 8px;
        }
        .badge-paid { background: #22c55e; color: white; }
        .badge-sent { background: #3b82f6; color: white; }
        .badge-draft { background: #94a3b8; color: white; }
        .info-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
        }
        .info-block { }
        .info-label {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .info-value { font-size: 14px; margin-bottom: 4px; }
        .info-value.large { font-size: 16px; font-weight: 600; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 30px 0;
        }
        th {
          background: #f1f5f9;
          padding: 12px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 14px;
        }
        .item-name { font-weight: 600; }
        .item-details { color: #64748b; font-size: 12px; }
        .text-right { text-align: right; }
        .totals {
          margin-left: auto;
          width: 300px;
          margin-top: 20px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }
        .total-row.final {
          border-top: 2px solid #e2e8f0;
          margin-top: 8px;
          padding-top: 12px;
          font-size: 18px;
          font-weight: 700;
        }
        .notes {
          margin-top: 40px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 8px;
        }
        .footer {
          margin-top: 60px;
          text-align: center;
          color: #94a3b8;
          font-size: 12px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div>
            ${logoDataUrl ? `<img src="${logoDataUrl}" alt="Logo" style="max-height:64px; display:block; margin-bottom:8px;"/>` : `<div class="logo">Personalized Invoice Generator</div>`}
            <div style="color: #64748b; font-size: 13px; margin-top: 4px;">Template created by: linkedin.com/in/bmguerreiro</div>
          </div>
          <div style="text-align: right;">
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-number">${invoice.invoiceNumber}</div>
            <div class="badge badge-${invoice.status}">${invoice.status.toUpperCase()}</div>
          </div>
        </div>

        <div class="info-section">
          <div class="info-block">
            <div class="info-label">Bill To</div>
            <div class="info-value large">${invoice.customer}</div>
            ${invoice.customerEmail ? `<div class="info-value">${invoice.customerEmail}</div>` : ""}
            ${invoice.customerAddress ? `<div class="info-value" style="white-space: pre-line;">${invoice.customerAddress}</div>` : ""}
          </div>
          <div>
            <div class="info-block" style="margin-bottom: 20px;">
              <div class="info-label">Issue Date</div>
              <div class="info-value">${new Date(invoice.date).toLocaleDateString()}</div>
            </div>
            ${
              invoice.dueDate
                ? `
            <div class="info-block">
              <div class="info-label">Due Date</div>
              <div class="info-value">${new Date(invoice.dueDate).toLocaleDateString()}</div>
            </div>
            `
                : ""
            }
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th class="text-right">Quantity</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items
              .map(
                (item) => `
              <tr>
                <td>
                  <div class="item-name">${item.product}</div>
                  ${item.category || item.productType ? `<div class="item-details">${[item.category, item.productType].filter(Boolean).join(" • ")}</div>` : ""}
                </td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">${formatCurrency(item.pricePerUnit, currency)}</td>
                <td class="text-right">${formatCurrency(item.total, currency)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal</span>
            <span>${formatCurrency(invoice.subtotal, currency)}</span>
          </div>
          ${
            invoice.tax && invoice.tax > 0
              ? `
          <div class="total-row">
            <span>Tax (${invoice.taxRate}%)</span>
            <span>${formatCurrency(invoice.tax, currency)}</span>
          </div>
          `
              : ""
          }
          <div class="total-row final">
            <span>Total</span>
            <span>${formatCurrency(invoice.totalAmount, currency)}</span>
          </div>
        </div>

        ${
          invoice.notes
            ? `
        <div class="notes">
          <div class="info-label" style="margin-bottom: 8px;">Notes</div>
          <div style="white-space: pre-line; font-size: 14px; color: #475569;">${invoice.notes}</div>
        </div>
        `
            : ""
        }

      </div>
      
      <script>
        window.onload = () => {
          setTimeout(() => {
            window.print();
          }, 250);
        };
        
        window.onafterprint = () => {
          window.close();
        };
      </script>
    </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
}
