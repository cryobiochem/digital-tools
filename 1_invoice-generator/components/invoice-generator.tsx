"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Download, Eye, Loader2, Plus, Save, History, Trash2, Upload, Sheet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { InvoiceHistory } from "./invoice-history"
import { CSVImport } from "./csv-import"
import { GoogleSheetsImport } from "./google-sheets-import"
import { DataMapping } from "./data-mapping"

interface ProductItem {
  id: string
  product: string
  category: string
  productType: string
  quantity: number
  pricePerUnit: number
  total: number
}

interface InvoiceData {
  invoiceNumber: string
  date: string
  customer: string
  customerType: string
  customerAddress: string
  customerEmail: string
  products: ProductItem[]
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

const translations = {
  en: {
    invoice: "INVOICE",
    billTo: "Bill To",
    description: "Description",
    qty: "Qty",
    unitPrice: "Unit Price",
    total: "Total",
    totalAmountDue: "Total Amount",
    additionalNotes: "Additional Notes",
    thankYou: "Thank you for choosing Invoice Generator for your generic business needs!",
    status: "Status of your order",
    platform: "Platform",
    services: "Generic Business Official Store",
    tagline: "Professional Business Solutions",
    // Status translations
    draft: "Draft",
    sent: "Sent",
    paid: "Paid",
    // Customer type translations
    individual: "Individual",
    company: "Company",
    directOrder: "Direct Order",
  },
  pt: {
    invoice: "FATURA",
    billTo: "Faturar a",
    description: "Descrição",
    qty: "Qtd",
    unitPrice: "Preço Unitário",
    total: "Total",
    totalAmountDue: "Valor Total",
    additionalNotes: "Notas Adicionais",
    thankYou: "Obrigado por escolher a Invoice Generator para as suas necessidades de negócio genérico!",
    status: "Estado do seu pedido",
    platform: "Plataforma",
    services: "Loja Oficial - Empresa Genérica",
    tagline: "Soluções Profissionais",
    // Status translations
    draft: "Rascunho",
    sent: "Enviado",
    paid: "Pago",
    // Customer type translations
    individual: "Individual",
    company: "Empresa",
    directOrder: "Pedido Direto",
  },
}

const STORAGE_KEY = "invoices"
// app settings key
const SETTINGS_KEY = "app-settings"

export default function InvoiceGenerator() {
  const [isEditingExisting, setIsEditingExisting] = useState(false)
  const [originalInvoiceNumber, setOriginalInvoiceNumber] = useState<string | null>(null)
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: `INV-${Date.now()}`,
    date: new Date().toISOString().split("T")[0],
    customer: "",
    customerType: "",
    customerAddress: "",
    customerEmail: "",
    products: [
      {
        id: `product-${Date.now()}`,
        product: "",
        category: "",
        productType: "",
        quantity: 1,
        pricePerUnit: 0,
        total: 0,
      },
    ],
    totalSaleAmount: 0,
    productionCost: 0,
    revenue: 0,
    revenueRatio: 0,
    platform: "",
    status: "Draft",
    notes: "",
  })

  const [showPreview, setShowPreview] = useState(false)
  const [isGeneratingEnglishPDF, setIsGeneratingEnglishPDF] = useState(false)
  const [isGeneratingPortuguesePDF, setIsGeneratingPortuguesePDF] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [savedInvoices, setSavedInvoices] = useState<InvoiceData[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [selectedNoteOption, setSelectedNoteOption] = useState<string>("")
  const [customNote, setCustomNote] = useState<string>("")
  const [showImportModal, setShowImportModal] = useState(false)
  const [importType, setImportType] = useState<"csv" | "sheets" | null>(null)
  const [importData, setImportData] = useState<any[]>([])
  const [importHeaders, setImportHeaders] = useState<string[]>([])
  const [showMapping, setShowMapping] = useState(false)
  const [isProcessingImport, setIsProcessingImport] = useState(false)
  const [isImportFlowActive, setIsImportFlowActive] = useState(false)

  const invoiceRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const language = "en" // Assuming English as default language for simplicity

  const predefinedNotes = {
    en: [
      { value: "thank-you", label: "Thank You Message", text: "Thank you for shopping with us.\n- Invoice Generator" },
      {
        value: "high-demand",
        label: "High Demand Notice",
        text: "Due to high demand, your order may experience a slight delay in processing and shipping. We appreciate your patience and will keep you updated on your order status.\n- Invoice Generator",
      },
      {
        value: "seasonal",
        label: "Seasonal Delays",
        text: "Please note that due to the holiday season, shipping times may be extended. We recommend placing orders early to ensure timely delivery. Thank you for your understanding.\n- Invoice Generator",
      },
      {
        value: "customization",
        label: "Custom Order Notice",
        text: "Your custom order requires additional production time for personalization. We will contact you within 24-48 hours to confirm design details and provide an updated timeline.\n- Invoice Generator",
      },
      {
        value: "quality-assurance",
        label: "Quality Assurance",
        text: "Each item undergoes thorough quality inspection before shipping. This ensures you receive the highest quality products that meet our standards.\n- Invoice Generator",
      },
      {
        value: "care-instructions",
        label: "Care Instructions",
        text: "Please handle your items with care. Avoid exposure to extreme temperatures and direct sunlight. For cleaning, use mild soap and water only.\n- Invoice Generator",
      },
      {
        value: "warranty",
        label: "Warranty Information",
        text: "Your purchase is covered by our 30-day quality guarantee. If you experience any issues with your order, please contact us immediately for assistance.\n- Invoice Generator",
      },
      { value: "custom", label: "Custom Note", text: "" },
    ],
    pt: [
      { value: "thank-you", label: "Mensagem de Agradecimento", text: "Obrigado por comprar conosco.\n- Invoice Generator" },
      {
        value: "high-demand",
        label: "Aviso de Alta Demanda",
        text: "Devido à alta demanda, seu pedido pode sofrer um pequeno atraso no processamento e envio. Agradecemos sua paciência e manteremos você atualizado sobre o status do seu pedido.\n- Invoice Generator",
      },
      {
        value: "seasonal",
        label: "Atrasos Sazonais",
        text: "Observe que devido à temporada de feriados, os prazos de envio podem ser estendidos. Recomendamos fazer pedidos com antecedência para garantir a entrega pontual. Obrigado pela compreensão.\n- Invoice Generator",
      },
      {
        value: "customization",
        label: "Aviso de Pedido Personalizado",
        text: "Seu pedido personalizado requer tempo adicional de produção para personalização. Entraremos em contato em 24-48 horas para confirmar detalhes do design e fornecer um cronograma atualizado.\n- Invoice Generator",
      },
      {
        value: "quality-assurance",
        label: "Garantia de Qualidade",
        text: "Cada item passa por inspeção rigorosa de qualidade antes do envio. Isso garante que você receba produtos da mais alta qualidade que atendem aos nossos padrões.\n- Invoice Generator",
      },
      {
        value: "care-instructions",
        label: "Instruções de Cuidado",
        text: "Manuseie seus itens com cuidado. Evite exposição a temperaturas extremas e luz solar direta. Para limpeza, use apenas sabão neutro e água.\n- Invoice Generator",
      },
      {
        value: "warranty",
        label: "Informações de Garantia",
        text: "Sua compra está coberta por nossa garantia de qualidade de 30 dias. Se você tiver algum problema com seu pedido, entre em contato conosco imediatamente para assistência.\n- Invoice Generator",
      },
      { value: "custom", label: "Nota Personalizada", text: "" },
    ],
  }

  useEffect(() => {
    const saved = localStorage.getItem("invoices")
    if (saved) {
      try {
        setSavedInvoices(JSON.parse(saved))
      } catch (error) {
        console.error("Error loading saved invoices:", error)
      }
    }
  }, [])

  useEffect(() => {
    setIsImportFlowActive(showImportModal || showMapping)
  }, [showImportModal, showMapping])

  const updateCalculations = (data: Partial<InvoiceData>) => {
    const products = data.products ?? invoiceData.products
    const productionCost = data.productionCost ?? invoiceData.productionCost

    const totalSaleAmount = products.reduce((sum, product) => sum + product.total, 0)
    const revenue = totalSaleAmount - productionCost
    const revenueRatio = productionCost > 0 ? totalSaleAmount / productionCost : 0

    return {
      ...data,
      totalSaleAmount,
      revenue,
      revenueRatio: Math.round(revenueRatio * 100) / 100,
    }
  }

  const handleInputChange = (field: keyof InvoiceData, value: string | number | ProductItem[]) => {
    const updates = { [field]: value }
    const calculatedData = updateCalculations(updates)
    setInvoiceData((prev) => ({ ...prev, ...calculatedData }))
  }

  const handleNoteSelection = (value: string) => {
    setSelectedNoteOption(value)
    const currentNotes = predefinedNotes[language as keyof typeof predefinedNotes]
    const selectedNote = currentNotes.find((note) => note.value === value)

    if (value === "custom") {
      handleInputChange("notes", customNote)
    } else if (selectedNote) {
      handleInputChange("notes", selectedNote.text)
      setCustomNote("")
    } else {
      handleInputChange("notes", "")
      setCustomNote("")
    }
  }

  const handleCustomNoteChange = (value: string) => {
    setCustomNote(value)
    if (selectedNoteOption === "custom") {
      handleInputChange("notes", value)
    }
  }

  const addProduct = () => {
    const newProduct: ProductItem = {
      id: `product-${Date.now()}`,
      product: "",
      category: "",
      productType: "",
      quantity: 1,
      pricePerUnit: 0,
      total: 0,
    }
    const updatedProducts = [...invoiceData.products, newProduct]
    handleInputChange("products", updatedProducts)
  }

  const removeProduct = (productId: string) => {
    if (invoiceData.products.length <= 1) {
      toast({
        title: "Cannot Remove",
        description: "At least one product is required.",
        variant: "destructive",
      })
      return
    }
    const updatedProducts = invoiceData.products.filter((p) => p.id !== productId)
    handleInputChange("products", updatedProducts)
  }

  const updateProduct = (productId: string, field: keyof ProductItem, value: string | number) => {
    const updatedProducts = invoiceData.products.map((product) => {
      if (product.id === productId) {
        const updatedProduct = { ...product, [field]: value }
        // Recalculate total for this product
        if (field === "quantity" || field === "pricePerUnit") {
          updatedProduct.total = updatedProduct.quantity * updatedProduct.pricePerUnit
        }
        return updatedProduct
      }
      return product
    })
    handleInputChange("products", updatedProducts)
  }

  const saveInvoice = async () => {
    if (!invoiceData.customer || invoiceData.products.some((p) => !p.product)) {
      toast({
        title: "Missing Information",
        description: "Please fill in customer name and product details before saving.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const now = new Date().toISOString()

      let invoiceToSave
      let updatedInvoices

      if (isEditingExisting && originalInvoiceNumber) {
        // Update existing invoice
        invoiceToSave = {
          ...invoiceData,
          invoiceNumber: originalInvoiceNumber,
          updatedAt: now,
        }

        updatedInvoices = savedInvoices.map((inv) =>
          inv.invoiceNumber === originalInvoiceNumber ? invoiceToSave : inv,
        )

        toast({
          title: "Invoice Updated",
          description: `Invoice ${originalInvoiceNumber} has been updated successfully.`,
        })
      } else {
        // Create new invoice
        const newInvoiceNumber = `INV-${Date.now()}`
        invoiceToSave = {
          ...invoiceData,
          invoiceNumber: newInvoiceNumber,
          createdAt: invoiceData.createdAt || now,
          updatedAt: now,
        }

        updatedInvoices = [invoiceToSave, ...savedInvoices]
        setInvoiceData((prev) => ({ ...prev, invoiceNumber: newInvoiceNumber }))

        toast({
          title: "Invoice Saved",
          description: `Invoice ${newInvoiceNumber} has been saved successfully.`,
        })
      }

      setSavedInvoices(updatedInvoices)
      localStorage.setItem("invoices", JSON.stringify(updatedInvoices))
    } catch (error) {
      console.error("Error saving invoice:", error)
      toast({
        title: "Save Failed",
        description: "There was an error saving the invoice. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const createNewInvoice = () => {
    setIsEditingExisting(false)
    setOriginalInvoiceNumber(null)
    setInvoiceData({
      invoiceNumber: `INV-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      customer: "",
      customerType: "",
      customerAddress: "",
      customerEmail: "",
      products: [
        {
          id: `product-${Date.now()}`,
          product: "",
          category: "",
          productType: "",
          quantity: 1,
          pricePerUnit: 0,
          total: 0,
        },
      ],
      totalSaleAmount: 0,
      productionCost: 0,
      revenue: 0,
      revenueRatio: 0,
      platform: "",
      status: "Draft",
      notes: "",
    })
    setSelectedNoteOption("")
    setCustomNote("")
    setShowPreview(false)
    toast({
      title: "New Invoice Created",
      description: `Invoice ${invoiceData.invoiceNumber} is ready for editing.`,
    })
  }

  const loadInvoice = (invoice: InvoiceData) => {
    setIsEditingExisting(true)
    setOriginalInvoiceNumber(invoice.invoiceNumber)

    const productsArray = Array.isArray(invoice.products)
      ? invoice.products
      : [
          {
            product: invoice.product || "",
            category: invoice.category || "",
            productType: invoice.productType || "",
            quantity: invoice.quantity || 1,
            pricePerUnit: invoice.pricePerUnit || 0,
            total: invoice.total || 0,
          },
        ]

    const loadedInvoiceData = {
      ...invoice,
      products: productsArray,
    }

    setInvoiceData(loadedInvoiceData)
    setSelectedNoteOption("")
    setCustomNote("")
    setShowHistory(false)

    toast({
      title: "Invoice Loaded",
      description: `Invoice ${invoice.invoiceNumber} has been loaded for editing.`,
    })
  }

  const deleteInvoice = (invoiceNumber: string) => {
    const updatedInvoices = savedInvoices.filter((inv) => inv.invoiceNumber !== invoiceNumber)
    setSavedInvoices(updatedInvoices)
    localStorage.setItem("invoices", JSON.stringify(updatedInvoices))

    toast({
      title: "Invoice Deleted",
      description: `Invoice ${invoiceNumber} has been deleted.`,
    })
  }

  const generatePDF = async (language: "en" | "pt" = "en") => {
    console.log("Starting PDF generation ...")

    if (!invoiceData.customer || invoiceData.products.some((p) => !p.product)) {
      toast({
        title: "Missing Information",
        description: "Please fill in customer name and all product details before generating PDF.",
        variant: "destructive",
      })
      return
    }

    if (language === "en") {
      setIsGeneratingEnglishPDF(true)
    } else {
      setIsGeneratingPortuguesePDF(true)
    }

    try {
      const tempInvoiceElement = createInvoiceHTML(language)
      document.body.appendChild(tempInvoiceElement)

      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([import("jspdf"), import("html2canvas")])


      const canvas = await html2canvas(tempInvoiceElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (clonedDoc) => {
          const allElements = clonedDoc.querySelectorAll("*")
          allElements.forEach((element: Element) => {
            const htmlElement = element as HTMLElement
            if (htmlElement.style) {
              htmlElement.style.backgroundColor = "#ffffff"
              htmlElement.style.color = "#000000"

              if (htmlElement.classList.contains("text-green-700")) {
                htmlElement.style.color = "#15803d"
              }
              if (htmlElement.classList.contains("text-green-600")) {
                htmlElement.style.color = "#16a34a"
              }
              if (htmlElement.classList.contains("text-gray-600")) {
                htmlElement.style.color = "#4b5563"
              }
              if (htmlElement.classList.contains("text-gray-500")) {
                htmlElement.style.color = "#6b7280"
              }
              if (htmlElement.classList.contains("text-gray-800")) {
                htmlElement.style.color = "#1f2937"
              }
              if (htmlElement.classList.contains("bg-green-50")) {
                htmlElement.style.backgroundColor = "#f0fdf4"
              }
            }
          })
        },
      })

      document.body.removeChild(tempInvoiceElement)


      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      const langSuffix = language === "pt" ? "_PT" : ""
      const fileName = `Invoice_${invoiceData.invoiceNumber}${langSuffix}.pdf`
      pdf.save(fileName)

      console.log("PDF saved successfully ...")

      if (invoiceData.status === "Draft") {
        handleInputChange("status", "Sent")
      }
      await saveInvoice()

      toast({
        title: "PDF Generated Successfully",
        description: `Invoice ${invoiceData.invoiceNumber} has been downloaded and saved in ${language === "pt" ? "Portuguese" : "English"}.`,
      })
    } catch (error) {
      console.error("Error generating PDF ...", error)
      toast({
        title: "PDF Generation Failed",
        description:
          error instanceof Error ? error.message : "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      if (language === "en") {
        setIsGeneratingEnglishPDF(false)
      } else {
        setIsGeneratingPortuguesePDF(false)
      }
    }
  }

  const createInvoiceHTML = (language: "en" | "pt") => {
    const t = translations[language]

    const translateValue = (value: string, language: "en" | "pt") => {
      const lowerValue = value.toLowerCase()
      const translations = {
        draft: language === "pt" ? "Rascunho" : "Draft",
        sent: language === "pt" ? "Enviado" : "Sent",
        paid: language === "pt" ? "Pago" : "Paid",
        individual: language === "pt" ? "Individual" : "Individual",
        company: language === "pt" ? "Empresa" : "Company",
        "direct order": language === "pt" ? "Pedido Direto" : "Direct Order",
      }
      return translations[lowerValue as keyof typeof translations] || value
    }

    const tempDiv = document.createElement("div")
    tempDiv.style.position = "absolute"
    tempDiv.style.left = "-9999px"
    tempDiv.style.top = "-9999px"
    tempDiv.style.width = "800px"
    tempDiv.style.backgroundColor = "#ffffff"
    tempDiv.style.fontFamily = "Arial, sans-serif"
    tempDiv.style.fontSize = "14px"
    tempDiv.style.lineHeight = "1.4"
    tempDiv.style.color = "#000000"

    tempDiv.innerHTML = `
      <div style="padding: 40px; background: white;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
          <div>
            <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 8px 0; color: #000;">Invoice Generator</h1>
            <p style="margin: 4px 0; color: #666;">${t.services}</p>
            <p style="margin: 4px 0; color: #666;">${t.tagline}</p>
            <p style="margin: 4px 0; color: #666;">Email: contact@invoicegenerator.com</p>
            <p style="margin: 4px 0; color: #666;">Socials: @invoicegenerator</p>
            <p style="margin: 4px 0; color: #666;">Website: www.invoicegenerator.com</p>
          </div>
          <div style="text-align: right;">
            <h2 style="font-size: 20px; margin: 0; color: #000;">${t.invoice}</h2>
            <p style="margin: 4px 0; color: #666;">#${invoiceData.invoiceNumber}</p>
            <p style="margin: 4px 0; color: #666;">${new Date(invoiceData.date).toLocaleDateString()}</p>
          </div>
        </div>

        <div style="margin-bottom: 40px;">
          <h3 style="color: #000; margin-bottom: 10px; font-size: 16px;">${t.billTo}:</h3>
          <p style="margin: 4px 0; color: #000;"><strong>${invoiceData.customer}</strong></p>
          <p style="margin: 4px 0; color: #666;">(${translateValue(invoiceData.customerType, language)})</p>
          ${invoiceData.customerEmail ? `<p style="margin: 4px 0; color: #666;">${invoiceData.customerEmail}</p>` : ""}
          ${invoiceData.customerAddress ? `<p style="margin: 4px 0; color: #666;">${invoiceData.customerAddress.replace(/\n/g, "<br>")}</p>` : ""}
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
          <thead>
            <tr style="background: #f0fdf4;">
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">${t.description}</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">${t.qty}</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">${t.unitPrice}</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">${t.total}</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceData.products
              .map(
                (product) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px;">
                  <strong>${product.product}</strong><br>
                  <small style="color: #666;">${product.category} - ${product.productType}</small>
                  ${invoiceData.platform ? `<br><small style="color: #666;">${t.platform}: ${invoiceData.platform}</small>` : ""}
                </td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${product.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">€${(product.pricePerUnit || 0).toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: right;"><strong>€${(product.total || 0).toFixed(2)}</strong></td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
          <div style="width: 300px;">
            <div style="display: flex; justify-content: space-between; padding: 15px 0; border-top: 2px solid #16a34a; font-size: 18px; font-weight: bold; color: #16a34a;">
              <span>${t.totalAmountDue}:</span>
              <span>€${(invoiceData.totalSaleAmount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-bottom: 40px;">
          <div style="width: 300px;">
            <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 16px; font-weight: bold; color: #16a34a;">
              <span>${t.status}:</span>
              <span>${translateValue(invoiceData.status, language)}</span>
            </div>
          </div>
        </div>

        ${
          invoiceData.notes
            ? `
        <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-bottom: 20px;">
          <h4 style="color: #000; margin-bottom: 10px;">${t.additionalNotes}:</h4>
          <p style="color: #666; margin: 0;">${invoiceData.notes.replace(/\n/g, "<br>")}</p>
        </div>
        `
            : ""
        }

        <div style="text-align: center; font-size: 12px; color: #666; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
          <p>${t.thankYou}</p>
        </div>
      </div>
    `

    return tempDiv
  }

  const createBulkInvoices = async (data: any[], mapping: any) => {
    setIsProcessingImport(true)
    const newInvoices: InvoiceData[] = []

    try {
      for (const row of data) {
        const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        const newInvoice: InvoiceData = {
          invoiceNumber,
          date: new Date().toISOString().split("T")[0],
          customer: row[mapping.customer] || "",
          customerType: row[mapping.customerType] || "",
          customerEmail: row[mapping.customerEmail] || "",
          customerAddress: row[mapping.customerAddress] || "",
          products: [
            {
              id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              product: row[mapping.product] || "",
              category: row[mapping.category] || "",
              productType: row[mapping.productType] || "",
              quantity: Number.parseInt(row[mapping.quantity]) || 1,
              pricePerUnit: Number.parseFloat(row[mapping.pricePerUnit]) || 0,
              total:
                (Number.parseInt(row[mapping.quantity]) || 1) * (Number.parseFloat(row[mapping.pricePerUnit]) || 0),
            },
          ],
          totalSaleAmount:
            (Number.parseInt(row[mapping.quantity]) || 1) * (Number.parseFloat(row[mapping.pricePerUnit]) || 0),
          productionCost: Number.parseFloat(row[mapping.productionCost]) || 0,
          revenue: 0,
          revenueRatio: 0,
          platform: row[mapping.platform] || "",
          status: row[mapping.status] || "Draft",
          notes: row[mapping.notes] || "",
          createdAt: new Date().toISOString(),
        }

        // Calculate revenue and ratio
        newInvoice.revenue = newInvoice.totalSaleAmount - newInvoice.productionCost
        newInvoice.revenueRatio =
          newInvoice.totalSaleAmount > 0 ? (newInvoice.revenue / newInvoice.totalSaleAmount) * 100 : 0

        newInvoices.push(newInvoice)
      }

      // Save all invoices to localStorage
      const existingInvoices = JSON.parse(localStorage.getItem("invoices") || "[]")
      const updatedInvoices = [...existingInvoices, ...newInvoices]
      localStorage.setItem("invoices", JSON.stringify(updatedInvoices))
      setSavedInvoices(updatedInvoices)

      // Show success message
      toast({
        title: "Import Successful",
        description: `Successfully imported ${newInvoices.length} invoices.`,
      })

      // Reset import state
      setShowImportModal(false)
      setImportType(null)
      setImportData([])
      setImportHeaders([])
      setShowMapping(false)
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "There was an error importing the invoices. Please check your data and try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessingImport(false)
    }
  }

  const handleImportData = (data: any[]) => {
    setImportData(data)
    if (data.length > 0) {
      setImportHeaders(Object.keys(data[0]))
      setShowMapping(true)
    }
  }

  const handleMappingComplete = (mapping: any) => {
    createBulkInvoices(importData, mapping)
  }

  const handleBackToImport = () => {
    setShowMapping(false)
    setImportData([])
    setImportHeaders([])
  }

  if (isImportFlowActive) {
    if (showImportModal && !showMapping) {
      return (
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowImportModal(false)
                setImportType(null)
              }}
              className="mb-4"
            >
              ← Back to Invoice Generator
            </Button>
          </div>

          {!importType ? (
            <Card className="w-full max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Import Invoices</CardTitle>
                <CardDescription>Choose how you'd like to import your invoice data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => setImportType("csv")}
                  className="w-full h-20 flex flex-col gap-2"
                  variant="outline"
                >
                  <img src="/generic_logo.png" alt="Logo" className="h-6 w-6 object-contain" />
                  <span className="font-medium">Upload CSV File</span>
                  <span className="text-sm text-muted-foreground">Import from a CSV file</span>
                </Button>

                <Button
                  onClick={() => setImportType("sheets")}
                  className="w-full h-20 flex flex-col gap-2"
                  variant="outline"
                >
                  <Sheet className="h-6 w-6" />
                  <span className="font-medium">Google Sheets</span>
                  <span className="text-sm text-muted-foreground">Connect to Google Sheets</span>
                </Button>
              </CardContent>
            </Card>
          ) : importType === "csv" ? (
            <CSVImport
              onImportData={handleImportData}
              onClose={() => {
                setShowImportModal(false)
                setImportType(null)
              }}
            />
          ) : (
            <GoogleSheetsImport
              onImportData={handleImportData}
              onClose={() => {
                setShowImportModal(false)
                setImportType(null)
              }}
            />
          )}
        </div>
      )
    }

    if (showMapping) {
      return (
        <div className="container mx-auto p-6">
          <DataMapping
            sourceHeaders={importHeaders}
            sampleData={importData.slice(0, 3)}
            onMappingComplete={handleMappingComplete}
            onBack={handleBackToImport}
          />
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f0f9ff" }}>
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <img
              src="/generic_logo.png"
              alt="Your Name"
              className="h-12 w-12 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none"
                e.currentTarget.nextElementSibling!.style.display = "block"
              }}
            />
            <div style={{ display: "none" }}>
              <h1 className="text-3xl font-bold">Invoice Generator</h1>
            </div>
          </div>

          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold text-foreground">Professional Invoice Generator</h1>
            <p className="text-lg text-muted-foreground">Generic Business</p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="h-4 w-4" />
              Import Invoices
            </Button>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <img src="/generic_logo.png" alt="Logo" className="h-5 w-5 object-contain" />
                Invoice Management
              </span>
              <div className="flex gap-2">
                <Button onClick={createNewInvoice} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Invoice
                </Button>
                <Button onClick={() => setShowHistory(!showHistory)} variant="outline" size="sm">
                  <History className="h-4 w-4 mr-2" />
                  History ({savedInvoices.length})
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {showHistory && (
          <div className="mb-8">
            <InvoiceHistory
              invoices={savedInvoices}
              onLoadInvoice={loadInvoice}
              onDeleteInvoice={deleteInvoice}
              onClose={() => setShowHistory(false)}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <img src="/generic_logo.png" alt="Logo" className="h-5 w-5 object-contain" />
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={invoiceData.invoiceNumber}
                    onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
                    className="bg-muted"
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={invoiceData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer">Customer Name *</Label>
                    <Input
                      id="customer"
                      value={invoiceData.customer}
                      onChange={(e) => handleInputChange("customer", e.target.value)}
                      placeholder="Enter customer name"
                      required
                      style={{ backgroundColor: "#f8fafc" }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerType">Customer Type</Label>
                    <Select
                      value={invoiceData.customerType}
                      onValueChange={(value) => handleInputChange("customerType", value)}
                    >
                      <SelectTrigger style={{ backgroundColor: "#f8fafc" }}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Individual">Individual</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Educational">Educational</SelectItem>
                        <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={invoiceData.customerEmail}
                    onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                    placeholder="customer@example.com"
                    style={{ backgroundColor: "#f8fafc" }}
                  />
                </div>
                <div>
                  <Label htmlFor="customerAddress">Address</Label>
                  <Textarea
                    id="customerAddress"
                    value={invoiceData.customerAddress}
                    onChange={(e) => handleInputChange("customerAddress", e.target.value)}
                    placeholder="Enter customer address"
                    rows={3}
                    style={{ backgroundColor: "#f8fafc" }}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Product Information</h3>
                  <Button onClick={addProduct} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>

                {invoiceData.products.map((product, index) => (
                  <div key={product.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Product {index + 1}</h4>
                      {invoiceData.products.length > 1 && (
                        <Button
                          onClick={() => removeProduct(product.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Product Name *</Label>
                        <Input
                          value={product.product}
                          onChange={(e) => updateProduct(product.id, "product", e.target.value)}
                          placeholder="Enter product name"
                          required
                          style={{ backgroundColor: "#f8fafc" }}
                        />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Select
                          value={product.category}
                          onValueChange={(value) => updateProduct(product.id, "category", value)}
                        >
                          <SelectTrigger style={{ backgroundColor: "#f8fafc" }}>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Prototypes">Prototypes</SelectItem>
                            <SelectItem value="Miniatures">Miniatures</SelectItem>
                            <SelectItem value="Functional Parts">Functional Parts</SelectItem>
                            <SelectItem value="Decorative Items">Decorative Items</SelectItem>
                            <SelectItem value="Custom Design">Custom Design</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Product Type</Label>
                        <Select
                          value={product.productType}
                          onValueChange={(value) => updateProduct(product.id, "productType", value)}
                        >
                          <SelectTrigger style={{ backgroundColor: "#f8fafc" }}>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PLA Print">PLA Print</SelectItem>
                            <SelectItem value="ABS Print">ABS Print</SelectItem>
                            <SelectItem value="PETG Print">PETG Print</SelectItem>
                            <SelectItem value="Resin Print">Resin Print</SelectItem>
                            <SelectItem value="Multi-Material">Multi-Material</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={product.quantity}
                          onChange={(e) => updateProduct(product.id, "quantity", Number.parseInt(e.target.value) || 1)}
                          style={{ backgroundColor: "#f8fafc" }}
                        />
                      </div>
                      <div>
                        <Label>Price per Unit (€)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={product.pricePerUnit}
                          onChange={(e) =>
                            updateProduct(product.id, "pricePerUnit", Number.parseFloat(e.target.value) || 0)
                          }
                          style={{ backgroundColor: "#f8fafc" }}
                        />
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-medium">Product Total: €{(product.total || 0).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="platform">Platform</Label>
                    <Select
                      value={invoiceData.platform}
                      onValueChange={(value) => handleInputChange("platform", value)}
                    >
                      <SelectTrigger style={{ backgroundColor: "#f8fafc" }}>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Direct Order">Direct Order</SelectItem>
                        <SelectItem value="Etsy">Etsy</SelectItem>
                        <SelectItem value="Website">Website</SelectItem>
                        <SelectItem value="Referral">Referral</SelectItem>
                        <SelectItem value="Social Media">Social Media</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status of your order</Label>
                    <Select value={invoiceData.status} onValueChange={(value) => handleInputChange("status", value)}>
                      <SelectTrigger style={{ backgroundColor: "#f8fafc" }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Sent">Sent</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Overdue">Overdue</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="productionCost">Production Cost (€)</Label>
                  <Input
                    id="productionCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={invoiceData.productionCost}
                    onChange={(e) => handleInputChange("productionCost", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Total Sale Amount:</span>
                  <span className="font-bold">€{(invoiceData.totalSaleAmount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Revenue:</span>
                  <span className={`font-bold ${invoiceData.revenue >= 0 ? "text-green-600" : "text-red-600"}`}>
                    €{(invoiceData.revenue || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Revenue Ratio:</span>
                  <span className="font-bold">{(invoiceData.revenueRatio || 0).toFixed(2)}x</span>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Select value={selectedNoteOption} onValueChange={handleNoteSelection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a predefined note or choose custom..." />
                  </SelectTrigger>
                  <SelectContent>
                    {predefinedNotes[language as keyof typeof predefinedNotes].map((note) => (
                      <SelectItem key={note.value} value={note.value}>
                        {note.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedNoteOption === "custom" && (
                  <Textarea
                    className="mt-2"
                    value={customNote}
                    onChange={(e) => handleCustomNoteChange(e.target.value)}
                    placeholder="Enter your custom note..."
                    rows={3}
                  />
                )}

                {selectedNoteOption && selectedNoteOption !== "custom" && selectedNoteOption !== "" && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-md border">
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {
                        predefinedNotes[language as keyof typeof predefinedNotes].find(
                          (note) => note.value === selectedNoteOption,
                        )?.text
                      }
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => setShowPreview(!showPreview)} variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? "Hide Preview" : "Preview"}
                </Button>
                <Button onClick={saveInvoice} disabled={isSaving} variant="outline">
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {isSaving ? "Saving..." : "Save Invoice"}
                </Button>
                <Button
                  onClick={() => generatePDF("en")}
                  disabled={isGeneratingEnglishPDF || isGeneratingPortuguesePDF}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isGeneratingEnglishPDF ? "Generating..." : "Generate PDF (English)"}
                </Button>
                <Button
                  onClick={() => generatePDF("pt")}
                  disabled={isGeneratingEnglishPDF || isGeneratingPortuguesePDF}
                  className="text-white hover:bg-green-800"
                  style={{ backgroundColor: "#15803d" }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isGeneratingPortuguesePDF ? "Generating..." : "Generate PDF (Portuguese)"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {showPreview && (
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Invoice Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  ref={invoiceRef}
                  data-invoice-preview
                  className="bg-white text-black p-6 rounded-lg border text-sm"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <img src="/generic_logo.png" alt="Your Name" className="w-32 h-32 object-contain mb-3" />
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Generic Business Official Store</p>
                        <p className="text-gray-500 text-xs">Professional Business Solutions</p>
                        <p className="text-gray-500 text-xs mt-1">
                          Email: contact@invoicegenerator.com
                          <br />
                          Socials: @invoicegenerator
                          <br />
                          Website: www.invoicegenerator.com
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <h2 className="text-xl font-bold text-gray-800">INVOICE</h2>
                      <p className="text-gray-600 text-sm">#{invoiceData.invoiceNumber}</p>
                      <p className="text-gray-600 text-sm">{new Date(invoiceData.date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Bill To:</h3>
                    <div className="text-gray-700 text-sm">
                      <p className="font-medium">{invoiceData.customer || "Customer Name"}</p>
                      <p className="text-xs text-gray-600">({invoiceData.customerType || "Customer Type"})</p>
                      {invoiceData.customerEmail && <p className="text-xs">{invoiceData.customerEmail}</p>}
                      {invoiceData.customerAddress && (
                        <p className="whitespace-pre-line text-xs">{invoiceData.customerAddress}</p>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-green-50">
                          <th className="border border-gray-300 px-2 py-1 text-left">Description</th>
                          <th className="border border-gray-300 px-2 py-1 text-center">Qty</th>
                          <th className="border border-gray-300 px-2 py-1 text-right">Unit Price</th>
                          <th className="border border-gray-300 px-2 py-1 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceData.products.map((product) => (
                          <tr key={product.id}>
                            <td className="border border-gray-300 px-2 py-1">
                              <div>
                                <p className="font-medium text-xs">{product.product || "Product Name"}</p>
                                <p className="text-xs text-gray-600">
                                  {product.category} - {product.productType}
                                </p>
                                {invoiceData.platform && (
                                  <p className="text-xs text-gray-500">Platform: {invoiceData.platform}</p>
                                )}
                              </div>
                            </td>
                            <td className="border border-gray-300 px-2 py-1 text-center">{product.quantity}</td>
                            <td className="border border-gray-300 px-2 py-1 text-right">
                              €{(product.pricePerUnit || 0).toFixed(2)}
                            </td>
                            <td className="border border-gray-300 px-2 py-1 text-right font-medium">
                              €{(product.total || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end mb-6">
                    <div className="w-48">
                      <div className="flex justify-between py-2 border-t border-gray-300">
                        <span className="font-bold text-base">Total Amount:</span>
                        <span className="font-bold text-base text-green-700">
                          €{(invoiceData.totalSaleAmount || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="font-medium text-sm">Status of your order:</span>
                        <span className="font-medium text-sm text-blue-700">{invoiceData.status}</span>
                      </div>
                    </div>
                  </div>

                  {invoiceData.notes && (
                    <div className="border-t border-gray-300 pt-4">
                      <h4 className="font-semibold text-gray-800 mb-2 text-sm">Additional Notes:</h4>
                      <p className="text-xs text-gray-600 whitespace-pre-line">{invoiceData.notes}</p>
                    </div>
                  )}

                  <div className="text-center text-xs text-gray-500 mt-6 pt-3 border-t border-gray-200">
                    <p>Thank you for choosing Invoice Generator for your 3D printing needs!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}