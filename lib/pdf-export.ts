import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import type { TruckLog } from "./types"

/**
 * Fetch related data for the log (transport company, organizations, driver)
 */
async function fetchRelatedData(log: TruckLog): Promise<{
  transportCompanyName?: string
  senderOrganizationName?: string
  receiverOrganizationName?: string
  driverPhone?: string
  driverRegistrationNumber?: string
}> {
  const result: {
    transportCompanyName?: string
    senderOrganizationName?: string
    receiverOrganizationName?: string
    driverPhone?: string
    driverRegistrationNumber?: string
  } = {}

  try {
    // Fetch all transport companies and find the matching one
    if (log.transportCompanyId) {
      try {
        const response = await fetch("/api/transport-companies")
        if (response.ok) {
          const companies = await response.json()
          const company = companies.find((c: any) => c.id === log.transportCompanyId)
          if (company) {
            result.transportCompanyName = company.name
          }
        }
      } catch (error) {
        console.warn("Failed to fetch transport company:", error)
      }
    }

    // Fetch all organizations and find the matching ones
    if (log.senderOrganizationId) {
      try {
        const response = await fetch("/api/organizations?type=sender")
        if (response.ok) {
          const organizations = await response.json()
          const org = organizations.find((o: any) => o.id === log.senderOrganizationId)
          if (org) {
            result.senderOrganizationName = org.name
          }
        }
      } catch (error) {
        console.warn("Failed to fetch sender organization:", error)
      }
    }
    
    if (log.receiverOrganizationId) {
      try {
        const response = await fetch("/api/organizations?type=receiver")
        if (response.ok) {
          const organizations = await response.json()
          const org = organizations.find((o: any) => o.id === log.receiverOrganizationId)
          if (org) {
            result.receiverOrganizationName = org.name
          }
        }
      } catch (error) {
        console.warn("Failed to fetch receiver organization:", error)
      }
    }

    // Fetch driver details if driverId is present
    if (log.driverId) {
      try {
        const response = await fetch("/api/drivers")
        if (response.ok) {
          const drivers = await response.json()
          const driver = drivers.find((d: any) => d.id === log.driverId)
          if (driver) {
            result.driverPhone = driver.phone
            result.driverRegistrationNumber = driver.registrationNumber
          }
        }
      } catch (error) {
        console.warn("Failed to fetch driver:", error)
      }
    }
  } catch (error) {
    console.warn("Error fetching related data:", error)
  }

  return result
}

/**
 * Generate a responsive PDF for a single truck log using HTML rendering
 */
export async function exportLogToPDF(log: TruckLog): Promise<void> {
  // Fetch related data (transport company, organizations)
  const relatedData = await fetchRelatedData(log)
  
  // Create a temporary HTML element with the log data
  const htmlContent = generateLogHTML(log, relatedData)
  
  // Create an iframe to completely isolate styles
  const iframe = document.createElement("iframe")
  iframe.style.position = "fixed"
  iframe.style.left = "-9999px"
  iframe.style.top = "0"
  iframe.style.width = "794px"
  iframe.style.height = "1123px" // A4 height in pixels
  iframe.style.border = "none"
  document.body.appendChild(iframe)

  try {
    // Wait for iframe to load
    await new Promise<void>((resolve) => {
      iframe.onload = () => resolve()
      iframe.srcdoc = htmlContent
    })

    // Wait a bit for fonts and styles to load
    await new Promise((resolve) => setTimeout(resolve, 100))

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDoc) {
      throw new Error("Failed to access iframe document")
    }

    const body = iframeDoc.body

    // Convert HTML to canvas
    const canvas = await html2canvas(body, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 794,
      windowHeight: body.scrollHeight,
    })

    // Create PDF
    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 0

    // Add first page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Generate filename
    const receiptNumber = generateReceiptNumber(log)
    const filename = `${receiptNumber}.pdf`

    // Save PDF
    pdf.save(filename)
  } finally {
    // Clean up
    if (iframe.parentNode) {
      document.body.removeChild(iframe)
    }
  }
}

/**
 * Escape HTML to prevent XSS and rendering issues
 */
function escapeHtml(text: string): string {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

/**
 * Generate receipt number from log
 */
function generateReceiptNumber(log: TruckLog): string {
  const logDate = log.createdAt ? new Date(log.createdAt) : new Date()
  const dateStr = logDate.toISOString().slice(0, 10).replace(/-/g, "")
  const timeStr = logDate.toTimeString().slice(0, 8).replace(/:/g, "")
  return `${dateStr}${timeStr}${log.id.slice(-5)}`
}

/**
 * Generate HTML content for the log in receipt format
 */
function generateLogHTML(
  log: TruckLog,
  relatedData?: {
    transportCompanyName?: string
    senderOrganizationName?: string
    receiverOrganizationName?: string
    driverPhone?: string
    driverRegistrationNumber?: string
  }
): string {
  // Generate receipt number from log ID and date
  const receiptNumber = generateReceiptNumber(log)

  // Format dates in YYYY-MM-DD HH:MM format
  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }

  const createdDate = log.createdAt
    ? formatDate(new Date(log.createdAt))
    : "—"

  const entryDate = log.direction === "IN" && log.createdAt
    ? formatDate(new Date(log.createdAt))
    : "—"

  const exitDate = log.direction === "OUT" && log.createdAt
    ? formatDate(new Date(log.createdAt))
    : "—"

  // Calculate unloaded weight (if we have loaded and net weight)
  const unloadedWeight = log.weightKg && log.netWeightKg 
    ? log.weightKg - log.netWeightKg 
    : null

  // Get organization names
  const senderOrg = log.senderOrganization || relatedData?.senderOrganizationName || "—"
  const receiverOrg = log.receiverOrganization || relatedData?.receiverOrganizationName || "—"
  const transportCompany = relatedData?.transportCompanyName || "—"

  // Format driver info
  const driverInfo = log.driverName || "—"
  const driverFullInfo = relatedData?.driverPhone && relatedData?.driverRegistrationNumber
    ? `${driverInfo} ${relatedData.driverPhone} ${relatedData.driverRegistrationNumber}`
    : driverInfo

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-size: 12px;
          line-height: 1.5;
          color: rgb(0, 0, 0);
          background: rgb(255, 255, 255);
          padding: 15px;
          width: 210mm;
        }
        .header-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          font-size: 11px;
        }
        .header-left {
          text-align: left;
        }
        .header-center {
          text-align: center;
          font-weight: bold;
          font-size: 13px;
        }
        .header-right {
          text-align: right;
        }
        .main-title {
          text-align: center;
          font-size: 16px;
          font-weight: bold;
          margin: 15px 0;
        }
        .carrier-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          font-size: 11px;
        }
        .carrier-left {
          flex: 1;
        }
        .carrier-right {
          text-align: right;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
          font-size: 11px;
          border: 1px solid rgb(0, 0, 0);
        }
        .data-table td {
          padding: 8px 10px;
          border: 1px solid rgb(0, 0, 0);
          vertical-align: top;
        }
        .data-table .label-cell {
          background-color: rgb(255, 255, 255);
          font-weight: 600;
          width: 18%;
        }
        .data-table .value-cell {
          width: 15%;
          text-align: left;
          background-color: rgb(255, 255, 255);
        }
        .data-table .empty-cell {
          background-color: rgb(255, 255, 255);
          border: 1px solid rgb(0, 0, 0);
        }
      </style>
    </head>
    <body>
      <!-- Header with three columns -->
      <div class="header-row">
        <div class="header-left">
          Илгээгч байгууллага: ${escapeHtml(senderOrg)}
        </div>
        <div class="header-center">
          ${escapeHtml(transportCompany !== "—" ? transportCompany : "ТЭЭВРИЙН КОМПАНИ")}
        </div>
        <div class="header-right">
          Хүлээн авагч: ${escapeHtml(receiverOrg)}
        </div>
      </div>

      <!-- Main title -->
      <div class="main-title">
        ПҮҮНИЙ БАРИМТ: ${receiptNumber}
      </div>

      <!-- Carrier and date info -->
      <div class="carrier-info">
        <div class="carrier-left">
          Тээвэрлэгч байгууллага: ${escapeHtml(transportCompany)}
        </div>
        <div class="carrier-right">
          Үүссэн огноо: ${createdDate}<br>
          Гэрээ: —
        </div>
      </div>

      <!-- Data table -->
      <table class="data-table">
        <!-- Row 1: Vehicle and weight info -->
        <tr>
          <td class="label-cell">Улсын дугаар:</td>
          <td class="value-cell">${escapeHtml(log.plate || "—")}</td>
          <td class="label-cell">Чиргүүлийн дугаар:</td>
          <td class="value-cell">${escapeHtml(log.trailerPlate || "—")}</td>
          <td class="label-cell">Гаалийн лац:</td>
          <td class="value-cell">${escapeHtml(log.sealNumber || "—")}</td>
        </tr>
        <tr>
          <td class="label-cell">Ачаатай жин/кг/:</td>
          <td class="value-cell">${log.weightKg ? log.weightKg.toLocaleString() : "—"}</td>
          <td class="label-cell">Ачаагүй жин /кг/:</td>
          <td class="value-cell">${unloadedWeight ? unloadedWeight.toLocaleString() : "—"}</td>
          <td class="label-cell">Цэвэр жин/кг/:</td>
          <td class="value-cell">${log.netWeightKg ? log.netWeightKg.toLocaleString() : "—"}</td>
        </tr>
        <!-- Row 2: Product and dates -->
        <tr>
          <td class="label-cell">Бүтээгдэхүүн:</td>
          <td class="value-cell">${escapeHtml(log.cargoType || "—")}</td>
          <td class="label-cell">Орсон огноо:</td>
          <td class="value-cell">${entryDate}</td>
          <td class="label-cell">Гарсан огноо:</td>
          <td class="value-cell">${exitDate}</td>
        </tr>
        <tr>
          <td class="label-cell">Ачих газрын код:</td>
          <td class="value-cell">${escapeHtml(log.origin || "—")}</td>
          <td class="label-cell">Хүрэх газрын код:</td>
          <td class="value-cell">${escapeHtml(log.destination || "—")}</td>
          <td class="empty-cell"></td>
          <td class="empty-cell"></td>
        </tr>
        <!-- Row 3: Container and exchange -->
        <tr>
          <td class="label-cell">Чингэлэг дугаар:</td>
          <td class="value-cell">—</td>
          <td class="label-cell">Бирж дугаар:</td>
          <td class="value-cell">—</td>
          <td class="empty-cell"></td>
          <td class="empty-cell"></td>
        </tr>
        <!-- Row 4: Loader, Driver, Approval -->
        <tr>
          <td class="label-cell">Пүүлэгч:</td>
          <td class="value-cell">—</td>
          <td class="label-cell">Жолооч:</td>
          <td class="value-cell" colspan="3">${escapeHtml(driverFullInfo)}</td>
        </tr>
        <tr>
          <td class="label-cell">С Зөвшөөрөл:</td>
          <td class="value-cell">—</td>
          <td class="empty-cell" colspan="4"></td>
        </tr>
      </table>
    </body>
    </html>
  `
}
