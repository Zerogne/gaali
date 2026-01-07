import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { TruckLog } from "./types";

/**
 * Fetch related data for the log (transport company, organizations, driver)
 */
async function fetchRelatedData(log: TruckLog): Promise<{
  transportCompanyName?: string;
  senderOrganizationName?: string;
  receiverOrganizationName?: string;
  driverPhone?: string;
  driverRegistrationNumber?: string;
}> {
  const result: {
    transportCompanyName?: string;
    senderOrganizationName?: string;
    receiverOrganizationName?: string;
    driverPhone?: string;
    driverRegistrationNumber?: string;
  } = {};

  try {
    // Fetch all transport companies and find the matching one
    if (log.transportCompanyId) {
      try {
        const response = await fetch("/api/transport-companies");
        if (response.ok) {
          const companies = await response.json();
          const company = companies.find(
            (c: any) => c.id === log.transportCompanyId
          );
          if (company) {
            result.transportCompanyName = company.name;
          }
        }
      } catch (error) {
        console.warn("Failed to fetch transport company:", error);
      }
    }

    // Fetch all organizations and find the matching ones
    if (log.senderOrganizationId) {
      try {
        const response = await fetch("/api/organizations?type=sender");
        if (response.ok) {
          const organizations = await response.json();
          const org = organizations.find(
            (o: any) => o.id === log.senderOrganizationId
          );
          if (org) {
            result.senderOrganizationName = org.name;
          }
        }
      } catch (error) {
        console.warn("Failed to fetch sender organization:", error);
      }
    }

    if (log.receiverOrganizationId) {
      try {
        const response = await fetch("/api/organizations?type=receiver");
        if (response.ok) {
          const organizations = await response.json();
          const org = organizations.find(
            (o: any) => o.id === log.receiverOrganizationId
          );
          if (org) {
            result.receiverOrganizationName = org.name;
          }
        }
      } catch (error) {
        console.warn("Failed to fetch receiver organization:", error);
      }
    }

    // Fetch driver details if driverId is present
    if (log.driverId) {
      try {
        const response = await fetch("/api/drivers");
        if (response.ok) {
          const drivers = await response.json();
          const driver = drivers.find((d: any) => d.id === log.driverId);
          if (driver) {
            result.driverPhone = driver.phone;
            result.driverRegistrationNumber = driver.registrationNumber;
          }
        }
      } catch (error) {
        console.warn("Failed to fetch driver:", error);
      }
    }
  } catch (error) {
    console.warn("Error fetching related data:", error);
  }

  return result;
}

/**
 * Fetch the session's unique code (AKT) for a log
 */
async function fetchSessionUniqueCode(log: TruckLog): Promise<string | null> {
  try {
    const sessionsResponse = await fetch(
      `/api/truck-sessions?direction=${log.direction}&plateNumber=${encodeURIComponent(log.plate)}&limit=10`
    );

    if (!sessionsResponse.ok) {
      return null;
    }

    const sessionsData = await sessionsResponse.json();
    // Find session that matches the log's date/time (closest match)
    const session = sessionsData.sessions?.find((s: any) => {
      const sessionDate = new Date(s.createdAt);
      const logDate = new Date(log.createdAt);
      // Match if within 1 hour of each other
      return Math.abs(sessionDate.getTime() - logDate.getTime()) < 3600000;
    }) || sessionsData.sessions?.[0]; // Fallback to first session

    return session?.uniqueCode || null;
  } catch (error) {
    console.warn("Failed to fetch session unique code:", error);
    return null;
  }
}

/**
 * Open browser print dialog for a truck log
 * @param log - The truck log data
 * @param providedUniqueCode - Optional unique code to use instead of fetching
 */
export async function printLog(log: TruckLog, providedUniqueCode?: string | null): Promise<void> {
  // Fetch related data (transport company, organizations)
  const relatedData = await fetchRelatedData(log);

  // Fetch current user (loader) information and company name
  let loaderName: string | undefined;
  let companyName: string = "ТЭЭВРИЙН КОМПАНИ";
  try {
    const userResponse = await fetch("/api/user");
    if (userResponse.ok) {
      const userData = await userResponse.json();
      loaderName = userData.name;
      companyName = userData.companyName || userData.organizationName || "ТЭЭВРИЙН КОМПАНИ";
    }
  } catch (error) {
    console.warn("Failed to fetch current user:", error);
  }

  // Use provided unique code, or fetch session's unique code (AKT)
  const uniqueCode = providedUniqueCode !== undefined ? providedUniqueCode : await fetchSessionUniqueCode(log);

  // Create HTML content with the log data
  const htmlContent = generateLogHTML(log, relatedData, loaderName, uniqueCode, companyName);

  // Create a new window for printing
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    throw new Error("Failed to open print window. Please allow popups for this site.");
  }

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
}

/**
 * Generate a responsive PDF for a single truck log using HTML rendering
 * @param log - The truck log data
 * @param providedUniqueCode - Optional unique code to use instead of fetching
 */
export async function exportLogToPDF(log: TruckLog, providedUniqueCode?: string | null): Promise<void> {
  // Fetch related data (transport company, organizations)
  const relatedData = await fetchRelatedData(log);

  // Fetch current user (loader) information
  let loaderName: string | undefined;
  try {
    const userResponse = await fetch("/api/user");
    if (userResponse.ok) {
      const userData = await userResponse.json();
      loaderName = userData.name;
    }
  } catch (error) {
    console.warn("Failed to fetch current user:", error);
  }

  // Use provided unique code, or fetch session's unique code (AKT)
  const uniqueCode = providedUniqueCode !== undefined ? providedUniqueCode : await fetchSessionUniqueCode(log);

  // Fetch company name
  let companyName: string = "ТЭЭВРИЙН КОМПАНИ";
  try {
    const userResponse2 = await fetch("/api/user");
    if (userResponse2.ok) {
      const userData2 = await userResponse2.json();
      companyName = userData2.companyName || userData2.organizationName || "ТЭЭВРИЙН КОМПАНИ";
    }
  } catch (error) {
    console.warn("Failed to fetch company name:", error);
  }

  // Create a temporary HTML element with the log data
  const htmlContent = generateLogHTML(log, relatedData, loaderName, uniqueCode, companyName);

  // Create an iframe to completely isolate styles
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-9999px";
  iframe.style.top = "0";
  iframe.style.width = "794px";
  iframe.style.height = "1123px"; // A4 height in pixels
  iframe.style.border = "none";
  document.body.appendChild(iframe);

  try {
    // Wait for iframe to load
    await new Promise<void>((resolve) => {
      iframe.onload = () => resolve();
      iframe.srcdoc = htmlContent;
    });

    // Wait a bit for fonts and styles to load
    await new Promise((resolve) => setTimeout(resolve, 100));

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error("Failed to access iframe document");
    }

    const body = iframeDoc.body;

    // Convert HTML to canvas
    const canvas = await html2canvas(body, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 794,
      windowHeight: body.scrollHeight,
    });

    // Create PDF
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    // Add first page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Generate filename - use unique code if available, otherwise use receipt number
    const filename = uniqueCode ? `${uniqueCode}.pdf` : `${generateReceiptNumber(log)}.pdf`;

    // Save PDF
    pdf.save(filename);
  } finally {
    // Clean up
    if (iframe.parentNode) {
      document.body.removeChild(iframe);
    }
  }
}

/**
 * Escape HTML to prevent XSS and rendering issues
 */
function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Generate receipt number from log
 */
function generateReceiptNumber(log: TruckLog): string {
  const logDate = log.createdAt ? new Date(log.createdAt) : new Date();
  const dateStr = logDate.toISOString().slice(0, 10).replace(/-/g, "");
  const timeStr = logDate.toTimeString().slice(0, 8).replace(/:/g, "");
  return `${dateStr}${timeStr}${log.id.slice(-5)}`;
}

/**
 * Generate HTML content for the log in receipt format
 */
function generateLogHTML(
  log: TruckLog,
  relatedData?: {
    transportCompanyName?: string;
    senderOrganizationName?: string;
    receiverOrganizationName?: string;
    driverPhone?: string;
    driverRegistrationNumber?: string;
  },
  loaderName?: string,
  uniqueCode?: string | null,
  companyName?: string
): string {
  // Use unique code (AKT) if available, otherwise generate receipt number
  const receiptNumber = uniqueCode || generateReceiptNumber(log);

  // Format dates in YYYY-MM-DD HH:MM format
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const createdDate = log.createdAt ? formatDate(new Date(log.createdAt)) : "—";

  // For merged logs (IN with netWeightKg), we have both entry and exit
  // For IN-only: entry date is creation date, exit date is empty
  // For OUT-only: entry date is empty, exit date is creation date
  // For merged (IN with OUT data): entry date is IN creation date, exit date is OUT creation date (if available)
  const hasOutData = log.netWeightKg !== undefined && log.netWeightKg !== null;
  const isMergedLog = log.direction === "IN" && hasOutData;
  
  const entryDate =
    (log.direction === "IN" || isMergedLog) && log.createdAt
      ? formatDate(new Date(log.createdAt))
      : "—";

  const exitDate =
    (log.direction === "OUT" || isMergedLog) && log.createdAt
      ? formatDate(new Date(log.createdAt))
      : "—";

  // Calculate unloaded weight (tare weight)
  // For OUT or merged logs: if we have loaded weight and net weight, unloaded = loaded - net
  // For IN-only: unloaded weight is typically not available at entry
  const unloadedWeight =
    (log.direction === "OUT" || isMergedLog) && log.weightKg && log.netWeightKg
      ? log.weightKg - log.netWeightKg
      : null;

  // Get organization names
  const senderOrg =
    log.senderOrganization || relatedData?.senderOrganizationName || "—";
  const receiverOrg =
    log.receiverOrganization || relatedData?.receiverOrganizationName || "—";
  const transportCompany = relatedData?.transportCompanyName || "—";

  // Format driver info
  const driverInfo = log.driverName || "—";
  const driverFullInfo =
    relatedData?.driverPhone && relatedData?.driverRegistrationNumber
      ? `${driverInfo} ${relatedData.driverPhone} ${relatedData.driverRegistrationNumber}`
      : driverInfo;

  // Use provided company name or default
  const displayCompanyName = companyName || "ТЭЭВРИЙН КОМПАНИ";

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
          font-size: 11px;
          line-height: 1.5;
          color: rgb(0, 0, 0);
          background: rgb(255, 255, 255);
          padding: 12mm 10mm;
          width: 210mm;
        }
        .company-name {
          text-align: center;
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .document-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
          font-size: 11px;
        }
        .document-id {
          text-align: center;
          flex: 1;
          font-size: 11px;
        }
        .created-date {
          text-align: right;
          flex: 1;
          font-size: 11px;
        }
        .parties-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
          font-size: 11px;
        }
        .sender-info {
          text-align: left;
          flex: 1;
        }
        .receiver-info {
          text-align: right;
          flex: 1;
        }
        .transporter-info {
          text-align: left;
          margin-bottom: 8px;
          font-size: 11px;
        }
        .contract-info {
          text-align: left;
          margin-bottom: 12px;
          font-size: 11px;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 6px;
          font-size: 9px;
          border: 1px solid rgb(156, 163, 175);
        }
        .data-table td {
          padding: 4px 6px;
          border: 1px solid rgb(156, 163, 175);
          vertical-align: middle;
          background-color: rgb(255, 255, 255);
          line-height: 1.3;
        }
        .data-table .label-cell {
          font-weight: 600;
          text-align: left;
          white-space: nowrap;
          width: 22%;
          padding: 4px 4px 4px 6px;
        }
        .data-table .value-cell {
          text-align: left;
          width: 13%;
          padding: 4px 4px;
        }
        .data-table .weight-cell {
          text-align: right;
          font-weight: 500;
        }
        .data-table .empty-cell {
          border: 1px solid rgb(156, 163, 175);
        }
      </style>
    </head>
    <body>
      <!-- Company name at top center -->
      <div class="company-name">
        ${escapeHtml(displayCompanyName)}
      </div>

      <!-- Document ID and Created Date -->
      <div class="document-header">
        <div class="document-id">
          ПҮҮНИЙ БАРИМТ: ${receiptNumber}
        </div>
        <div class="created-date">
          Үүссэн огноо:${createdDate}
        </div>
      </div>

      <!-- Sender and Receiver -->
      <div class="parties-row">
        <div class="sender-info">
          Илгээгч байгууллага: ${escapeHtml(senderOrg)}
        </div>
        <div class="receiver-info">
          Хүлээн авагч: ${escapeHtml(receiverOrg)}
        </div>
      </div>

      <!-- Transporter Organization -->
      <div class="transporter-info">
        Тээвэрлэгч байгууллага: ${escapeHtml(transportCompany)}
      </div>

      <!-- Contract -->
      <div class="contract-info">
        Гэрээ:-
      </div>

      <!-- Data table -->
      <table class="data-table">
        <!-- Row 1: Vehicle and Weight info (6 columns) -->
        <tr>
          <td class="label-cell">Улсын дугаар:</td>
          <td class="value-cell">${escapeHtml(log.plate || "")}</td>
          <td class="label-cell">Чиргүүлийн дугаар:</td>
          <td class="value-cell">${escapeHtml(log.trailerPlate || "")}</td>
          <td class="label-cell">Гаалийн лац:</td>
          <td class="value-cell">${escapeHtml(log.sealNumber || "")}</td>
        </tr>
        <tr>
          <td class="label-cell">Ачаатай жин/кг/:</td>
          <td class="value-cell weight-cell">${
            log.weightKg ? log.weightKg.toLocaleString() : ""
          }</td>
          <td class="label-cell">Ачаагүй жин /кг/:</td>
          <td class="value-cell weight-cell">${
            unloadedWeight ? unloadedWeight.toLocaleString() : ""
          }</td>
          <td class="label-cell">Цэвэр жин/кг/:</td>
          <td class="value-cell weight-cell">${
            log.netWeightKg ? log.netWeightKg.toLocaleString() : ""
          }</td>
        </tr>
        <!-- Row 2: Product, Dates, and Location codes (5 columns) -->
        <tr>
          <td class="label-cell">Бүтээгдэхүүн:</td>
          <td class="value-cell">${escapeHtml(log.cargoType || "")}</td>
          <td class="label-cell">Орсон огноо:</td>
          <td class="value-cell">${entryDate !== "—" ? entryDate : ""}</td>
          <td class="label-cell">Гарсан огноо:</td>
          <td class="value-cell">${exitDate !== "—" ? exitDate : ""}</td>
        </tr>
        <tr>
          <td class="label-cell">Ачих газрын код:</td>
          <td class="value-cell">${escapeHtml(log.origin || "")}</td>
          <td class="label-cell">Хүрэх газрын код:</td>
          <td class="value-cell">${escapeHtml(log.destination || "")}</td>
          <td class="empty-cell"></td>
          <td class="empty-cell"></td>
        </tr>
        <!-- Row 3: Container and Exchange (2 columns) -->
        <tr>
          <td class="label-cell">Чингэлэг дугаар:</td>
          <td class="value-cell"></td>
          <td class="label-cell">Бирж дугаар:</td>
          <td class="value-cell"></td>
          <td class="empty-cell"></td>
          <td class="empty-cell"></td>
        </tr>
        <!-- Row 4: Loader, Driver, and Approval -->
        <tr>
          <td class="label-cell">Пүүлэгч:</td>
          <td class="value-cell">${escapeHtml(loaderName || "")}</td>
          <td class="label-cell">Жолооч:</td>
          <td class="value-cell">${escapeHtml(
            driverFullInfo !== "—" ? driverFullInfo : ""
          )}</td>
          <td class="label-cell">С Зөвшөөрөл:</td>
          <td class="value-cell">-</td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
