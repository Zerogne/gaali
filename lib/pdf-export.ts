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
    driverPhone?: string
    driverRegistrationNumber?: string
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
          font-size: 13px;
          line-height: 1.7;
          color: rgb(33, 33, 33);
          background: rgb(255, 255, 255);
          padding: 0;
          width: 210mm;
          min-height: 100vh;
        }
        .header {
          background: linear-gradient(135deg, rgb(41, 128, 185) 0%, rgb(52, 152, 219) 100%);
          color: rgb(255, 255, 255);
          padding: 25px 20px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header h1 {
          font-size: 26px;
          font-weight: bold;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }
        .header p {
          font-size: 15px;
          opacity: 0.95;
        }
        .content {
          padding: 25px;
        }
        .section {
          margin-bottom: 25px;
          background: rgb(255, 255, 255);
          border: 1px solid rgb(230, 230, 230);
          border-radius: 6px;
          padding: 15px;
        }
        .section-title {
          background: rgb(245, 247, 250);
          padding: 12px 15px;
          font-size: 15px;
          font-weight: bold;
          margin: -15px -15px 15px -15px;
          border-left: 5px solid rgb(41, 128, 185);
          border-radius: 6px 6px 0 0;
          color: rgb(41, 128, 185);
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-bottom: 10px;
        }
        .info-item {
          display: flex;
          flex-direction: column;
          padding: 10px;
          background: rgb(250, 250, 250);
          border-radius: 4px;
          border: 1px solid rgb(240, 240, 240);
        }
        .info-label {
          font-weight: 600;
          color: rgb(100, 100, 100);
          margin-bottom: 6px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .info-value {
          color: rgb(33, 33, 33);
          font-size: 14px;
          font-weight: 500;
          word-break: break-word;
        }
        .status-badge {
          display: inline-block;
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: bold;
          font-size: 13px;
          margin-top: 25px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid rgb(230, 230, 230);
          text-align: center;
          font-size: 11px;
          color: rgb(120, 120, 120);
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
        <!-- Section 1: Cargo/Product and Destination -->
        <div class="section">
          <div class="section-title">Ачиж яваа зүйл ба очих газар</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Бүтээгдэхүүн:</span>
              <span class="info-value">${escapeHtml(log.cargoType || "—")}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Жин (кг):</span>
              <span class="info-value">${log.weightKg ? log.weightKg.toLocaleString() + " кг" : "—"}</span>
            </div>
            ${log.direction === "OUT" && log.netWeightKg ? `
            <div class="info-item">
              <span class="info-label">Цэвэр жин (кг):</span>
              <span class="info-value">${log.netWeightKg.toLocaleString() + " кг"}</span>
            </div>
            ` : ""}
            <div class="info-item">
              <span class="info-label">Хаанаас:</span>
              <span class="info-value">${escapeHtml(log.origin || "—")}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Хаашаа:</span>
              <span class="info-value">${escapeHtml(log.destination || "—")}</span>
            </div>
            ${log.comments ? `
            <div class="info-item full-width">
              <span class="info-label">Нэмэлт тайлбар:</span>
              <span class="info-value" style="margin-top: 5px; white-space: pre-wrap; color: rgb(33, 33, 33); line-height: 1.6;">${escapeHtml(log.comments)}</span>
            </div>
            ` : ""}
          </div>
        </div>

        <!-- Section 2: Companies and Organizations -->
        <div class="section">
          <div class="section-title">Байгууллага ба компани</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Илгээч байгууллага:</span>
              <span class="info-value">${escapeHtml(log.senderOrganization || relatedData?.senderOrganizationName || "—")}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Хүлээн авагч байгууллага:</span>
              <span class="info-value">${escapeHtml(log.receiverOrganization || relatedData?.receiverOrganizationName || "—")}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Тээврийн компани:</span>
              <span class="info-value">${escapeHtml(relatedData?.transportCompanyName || "—")}</span>
            </div>
          </div>
        </div>

        <!-- Section 3: Driver Information -->
        <div class="section">
          <div class="section-title">Жолоочийн мэдээлэл</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Бүтэн нэр:</span>
              <span class="info-value">${escapeHtml(log.driverName || "—")}</span>
            </div>
            ${relatedData?.driverPhone ? `
            <div class="info-item">
              <span class="info-label">Утасны дугаар:</span>
              <span class="info-value">${escapeHtml(relatedData.driverPhone)}</span>
            </div>
            ` : ""}
            ${relatedData?.driverRegistrationNumber ? `
            <div class="info-item">
              <span class="info-label">Регистэрийн дугаар:</span>
              <span class="info-value">${escapeHtml(relatedData.driverRegistrationNumber)}</span>
            </div>
            ` : ""}
          </div>
        </div>

        <!-- Section 4: Vehicle and Additional Info -->
        <div class="section">
          <div class="section-title">Тээврийн хэрэгсэл ба нэмэлт мэдээлэл</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Улсын дугаар:</span>
              <span class="info-value">${escapeHtml(log.plate || "—")}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Чиглэл:</span>
              <span class="info-value">${log.direction === "IN" ? "ОРОХ" : "ГАРАХ"}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Огноо:</span>
              <span class="info-value">${date}</span>
            </div>
            ${log.direction === "OUT" ? `
            <div class="info-item">
              <span class="info-label">Лацны дугаар:</span>
              <span class="info-value">${escapeHtml(log.sealNumber || "—")}</span>
            </div>
            ` : ""}
            ${log.transportType ? `
            <div class="info-item">
              <span class="info-label">Тээврийн төрөл:</span>
              <span class="info-value">${transportTypes[log.transportType] || log.transportType}</span>
            </div>
            ` : ""}
            ${log.hasTrailer ? `
            <div class="info-item">
              <span class="info-label">Чиргүүлтэй:</span>
              <span class="info-value">Тийм</span>
            </div>
            ` : ""}
            ${log.trailerPlate ? `
            <div class="info-item">
              <span class="info-label">Чиргүүлийн дугаар:</span>
              <span class="info-value">${escapeHtml(log.trailerPlate)}</span>
            </div>
            ` : ""}
          </div>
        </div>


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
