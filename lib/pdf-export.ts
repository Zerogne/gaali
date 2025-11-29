import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import type { TruckLog } from "./types"

/**
 * Fetch related data for the log (transport company, organizations)
 */
async function fetchRelatedData(log: TruckLog): Promise<{
  transportCompanyName?: string
  senderOrganizationName?: string
  receiverOrganizationName?: string
}> {
  const result: {
    transportCompanyName?: string
    senderOrganizationName?: string
    receiverOrganizationName?: string
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
    if (log.senderOrganizationId || log.receiverOrganizationId) {
      try {
        const response = await fetch("/api/organizations")
        if (response.ok) {
          const organizations = await response.json()
          
          if (log.senderOrganizationId) {
            const org = organizations.find((o: any) => o.id === log.senderOrganizationId)
            if (org) {
              result.senderOrganizationName = org.name
            }
          }
          
          if (log.receiverOrganizationId) {
            const org = organizations.find((o: any) => o.id === log.receiverOrganizationId)
            if (org) {
              result.receiverOrganizationName = org.name
            }
          }
        }
      } catch (error) {
        console.warn("Failed to fetch organizations:", error)
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
    const date = new Date(log.createdAt || Date.now())
    const fileDateStr = date.toISOString().split("T")[0]
    const filename = `truck-log-${log.plate || "unknown"}-${fileDateStr}.pdf`

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
 * Generate HTML content for the log
 */
function generateLogHTML(
  log: TruckLog,
  relatedData?: {
    transportCompanyName?: string
    senderOrganizationName?: string
    receiverOrganizationName?: string
  }
): string {
  const date = log.createdAt
    ? new Date(log.createdAt).toLocaleString("mn-MN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—"

  const transportTypes: Record<string, string> = {
    truck: "Ачааны машин",
    container: "Контейнер",
    tanker: "Тусгай зориулалтын машин",
    flatbed: "Хавтгай тавцант машин",
    refrigerated: "Хөргүүртэй машин",
    other: "Бусад",
  }

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
          line-height: 1.6;
          color: rgb(51, 51, 51);
          background: rgb(255, 255, 255);
          padding: 0;
          width: 210mm;
        }
        .header {
          background: rgb(41, 128, 185);
          color: rgb(255, 255, 255);
          padding: 20px;
          text-align: center;
        }
        .header h1 {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .header p {
          font-size: 14px;
          opacity: 0.9;
        }
        .content {
          padding: 20px;
        }
        .section {
          margin-bottom: 20px;
        }
        .section-title {
          background: rgb(245, 245, 245);
          padding: 10px 15px;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 15px;
          border-left: 4px solid rgb(41, 128, 185);
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 15px;
        }
        .info-item {
          display: flex;
          flex-direction: column;
        }
        .info-label {
          font-weight: bold;
          color: rgb(85, 85, 85);
          margin-bottom: 5px;
          font-size: 11px;
        }
        .info-value {
          color: rgb(51, 51, 51);
          font-size: 12px;
        }
        .status-badge {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 11px;
          margin-top: 20px;
        }
        .status-sent {
          background: rgb(46, 204, 113);
          color: rgb(255, 255, 255);
        }
        .status-saved {
          background: rgb(241, 196, 15);
          color: rgb(51, 51, 51);
        }
        .footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid rgb(238, 238, 238);
          text-align: center;
          font-size: 10px;
          color: rgb(136, 136, 136);
        }
        .full-width {
          grid-column: 1 / -1;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Тээврийн хэрэгслийн бүртгэл</h1>
        <p>Truck Log Report</p>
      </div>
      
      <div class="content">
        <div class="section">
          <div class="section-title">Үндсэн мэдээлэл</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Улсын дугаар:</span>
              <span class="info-value">${escapeHtml(log.plate || "—")}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Жолооч:</span>
              <span class="info-value">${escapeHtml(log.driverName || "—")}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Чиглэл:</span>
              <span class="info-value">${log.direction === "IN" ? "ОРОХ" : "ГАРАХ"}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Огноо:</span>
              <span class="info-value">${date}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Жин (кг):</span>
              <span class="info-value">${log.weightKg ? log.weightKg.toLocaleString() + " кг" : "—"}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Төлөв:</span>
              <span class="info-value">${log.sentToCustoms ? "Гаалид илгээсэн" : "Хадгалагдсан"}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Бүтээгдэхүүн:</span>
              <span class="info-value">${escapeHtml(log.cargoType || "—")}</span>
            </div>
          </div>
        </div>

        ${log.origin || log.destination ? `
        <div class="section">
          <div class="section-title">Маршрут</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Хаанаас:</span>
              <span class="info-value">${escapeHtml(log.origin || "—")}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Хаашаа:</span>
              <span class="info-value">${escapeHtml(log.destination || "—")}</span>
            </div>
          </div>
        </div>
        ` : ""}

        ${(log.senderOrganization || relatedData?.senderOrganizationName) || 
          (log.receiverOrganization || relatedData?.receiverOrganizationName) || 
          (log.transportCompanyId && relatedData?.transportCompanyName) ? `
        <div class="section">
          <div class="section-title">Байгууллага ба компани</div>
          <div class="info-grid">
            ${(log.senderOrganization || relatedData?.senderOrganizationName) ? `
            <div class="info-item">
              <span class="info-label">Илгээч байгууллага:</span>
              <span class="info-value">${escapeHtml(log.senderOrganization || relatedData?.senderOrganizationName || "—")}</span>
            </div>
            ` : ""}
            ${(log.receiverOrganization || relatedData?.receiverOrganizationName) ? `
            <div class="info-item">
              <span class="info-label">Хүлээн авагч байгууллага:</span>
              <span class="info-value">${escapeHtml(log.receiverOrganization || relatedData?.receiverOrganizationName || "—")}</span>
            </div>
            ` : ""}
            ${relatedData?.transportCompanyName ? `
            <div class="info-item">
              <span class="info-label">Тээврийн компани:</span>
              <span class="info-value">${escapeHtml(relatedData.transportCompanyName)}</span>
            </div>
            ` : ""}
          </div>
        </div>
        ` : ""}

        ${log.sealNumber || log.transportType || (log.hasTrailer && log.trailerPlate) || log.comments ? `
        <div class="section">
          <div class="section-title">Нэмэлт мэдээлэл</div>
          <div class="info-grid">
            ${log.sealNumber ? `
            <div class="info-item">
              <span class="info-label">Лацны дугаар:</span>
              <span class="info-value">${escapeHtml(log.sealNumber)}</span>
            </div>
            ` : ""}
            ${log.transportType ? `
            <div class="info-item">
              <span class="info-label">Тээврийн төрөл:</span>
              <span class="info-value">${transportTypes[log.transportType] || log.transportType}</span>
            </div>
            ` : ""}
            ${log.hasTrailer && log.trailerPlate ? `
            <div class="info-item">
              <span class="info-label">Чиргүүлийн дугаар:</span>
              <span class="info-value">${escapeHtml(log.trailerPlate)}</span>
            </div>
            ` : ""}
            ${log.comments ? `
            <div class="info-item full-width">
              <span class="info-label">Нэмэлт тайлбар:</span>
              <span class="info-value" style="margin-top: 5px; white-space: pre-wrap; color: rgb(51, 51, 51);">${escapeHtml(log.comments)}</span>
            </div>
            ` : ""}
          </div>
        </div>
        ` : ""}

        <div class="status-badge ${log.sentToCustoms ? "status-sent" : "status-saved"}">
          ${log.sentToCustoms ? "✓ Гаалид илгээсэн" : "Хадгалагдсан"}
        </div>

        <div class="footer">
          Generated on ${new Date().toLocaleString("mn-MN")}
        </div>
      </div>
    </body>
    </html>
  `
}
