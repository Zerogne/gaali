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

  // Set window title
  printWindow.document.title = "Пүүний баримт";

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

  // Format date as M/D/YYYY for the receipt
  const formatReceiptDate = (date: Date): string => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const receiptDate = log.createdAt ? formatReceiptDate(new Date(log.createdAt)) : "";

  // Get in weight (entry weight) and out weight (exit weight)
  // In weight: weight when entering (loaded/gross weight)
  // For IN direction or merged logs: weightKg is the entry weight (loaded)
  // For OUT-only: we might not have entry weight
  let inWeight = null;
  if (log.direction === "IN" || isMergedLog) {
    inWeight = log.weightKg || null;
  }
  
  // Out weight: weight when exiting (unloaded/tare weight)
  // For OUT direction: weightKg is the exit weight (unloaded)
  // For merged logs: calculate unloadedWeight = loaded - net
  let outWeight = null;
  if (log.direction === "OUT") {
    outWeight = log.weightKg || null;
  } else if (isMergedLog && log.weightKg && log.netWeightKg) {
    outWeight = log.weightKg - log.netWeightKg;
  }
  
  // Net weight: always use netWeightKg if available (allow 0 or positive values)
  const netWeight = (log.netWeightKg !== undefined && log.netWeightKg !== null) ? log.netWeightKg : null;
  
  // Format time for display (HH:MM)
  const formatTime = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };
  
  
  const inTime = (log.direction === "IN" || isMergedLog) && log.createdAt
    ? formatTime(new Date(log.createdAt))
    : "";
  
  const outTime = (log.direction === "OUT" || isMergedLog) && log.createdAt
    ? formatTime(new Date(log.createdAt))
    : "";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Авто пүүний Баримт</title>
      <style>
        @page {
          margin: 0;
          size: A4;
        }
        @media print {
          @page {
            margin: 0;
            size: A4;
          }
          body {
            margin: 0;
            padding: 5mm 8mm 8mm 8mm;
          }
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
        font-family: "Times New Roman", Times, serif;
        font-size: 17px; /* was 14px */
        line-height: 1.2;
        color: rgb(0, 0, 0);
        background: rgb(255, 250, 240);
        padding: 5mm 8mm 8mm 8mm;
        width: 210mm;
      }

      .header-top {
        text-align: center;
      }

      .company-top-middle {
        font-size: 29px; /* was 26px */
        font-weight: bold;
        color: rgb(0, 0, 0);
        text-align: center;
        margin-bottom: 0;
      }

      .document-title {
        text-align: center;
        font-size: 25px; /* was 22px */
        font-weight: bold;
        margin: 4px 0 3px 0;
        color: rgb(0, 0, 0);
        margin-top: 5px;
      }

      .receipt-number {
        text-align: center;
        font-size: 19px; /* was 16px */
        margin-bottom: 6px;
        color: rgb(0, 0, 0);
      }

      .divider-line {
        border-top: 1px solid rgb(0, 0, 0);
        margin: 10px 0;
      }

      .info-section {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
        gap: 12px;
      }

      .left-section {
        flex: 1;
      }

      .right-section {
        flex: 1;
        text-align: right;
      }

      .info-item {
        margin-bottom: 8px;
      }

      .info-label {
        font-size: 16px; /* was 13px */
        color: rgb(0, 0, 0);
        margin-bottom: 1px;
      }

      .info-value {
        font-size: 17px; /* was 14px */
        color: rgb(0, 0, 0);
      }

      .weight-table {
        width: 100%;
        border-collapse: collapse;
        margin: 6px 0;
        font-size: 16px; /* was 13px */
        border: 1px solid rgb(0, 0, 0);
        font-weight: normal;
      }

      .weight-table th {
        border: 1px solid rgb(0, 0, 0);
        padding: 4px 3px;
        text-align: center;
        font-weight: bold;
        background-color: rgb(255, 250, 240);
        color: rgb(0, 0, 0);
        font-size: 15px; /* was 12px */
        font-weight: normal;
      }

      .weight-table td {
        border: 1px solid rgb(0, 0, 0);
        padding: 4px 3px;
        text-align: center;
        color: rgb(0, 0, 0);
        font-size: 16px; /* was 13px */
      }

      .weight-table .info-row td {
        text-align: left;
        padding: 4px 6px;
        font-size: 15px; /* was 12px */
      }

      .weight-table .info-row td strong {
        font-weight: bold;
        margin-right: 4px;
      }

      .bottom-section {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-top: 6px;
      }

      .bottom-left {
        flex: 1;
        margin-top: 20px;
      }

      .bottom-right {
        flex: 1;
        text-align: right;
        margin-top: 20px;
      }

      .operator-field {
        text-align: right;
      }

      .field-with-dash {
        display: inline-block;
        border-bottom: 1px dashed rgb(0, 0, 0);
        min-width: 150px;
        padding-bottom: 2px;
        margin-left: 4px;
      }

      .field-label {
        font-size: 16px; /* was 13px */
        color: rgb(0, 0, 0);
        display: inline-block;
        margin-bottom: 20px;
      }

      .date-field {
        font-size: 16px; /* was 13px */
        color: rgb(0, 0, 0);
      }
      </style>
    </head>
    <body>
      <!-- Top: Company name left, company name right -->
      <div class="header-top">
        <div class="company-top-middle">
          ${escapeHtml(displayCompanyName)}
        </div>
      </div>

      <!-- Center: Document title -->
      <div class="document-title">
        Авто пүүний Баримт/Receipt
      </div>

      <!-- Receipt number -->
      <div class="receipt-number">
        No: ${receiptNumber}
      </div>


      <!-- Left and Right sections -->
      <div class="info-section">
        <div class="left-section">
          <div class="info-item">
            <span class="field-with-dash">${escapeHtml(senderOrg)}</span>
            <div class="info-label">Илгээгч байгууллага/Sender organization</div>
          </div>
          <div class="info-item">
            <span class="field-with-dash">${escapeHtml(transportCompany)}</span>
            <div class="info-label">Тээвэрлэгч байгууллага/Transporter organization</div>
          </div>
        </div>
        <div class="right-section">
          <div class="info-item">
            <span class="field-with-dash">${escapeHtml(receiverOrg)}</span>
            <div class="info-label">Хүлээн авагч/Trainee</div>
          </div>
          <div class="info-item">
            <span class="field-with-dash">${log.origin} - ${log.destination}</span>
            <div class="info-label">Чиглэл/Trend</div>
          </div>
        </div>
      </div>

      <!-- Weight table -->
      <table class="weight-table">
        <thead>
          <tr>
            <th>Машины дугаар / Registration No</th>
            <th>Чиргуулийн дугаар / Trailer No</th>
            <th>Оролтын жин /кг/ / In Weight /kg/</th>
            <th>Гаралтын жин /кг/ / OutWeight /kg/</th>
            <th>Цэвэр жин /кг/ / Net Weight /kg/</th>
            <th>Гаалийн лац Custom / No</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${escapeHtml(log.plate || "")}</td>
            <td>${escapeHtml(log.trailerPlate || "")}</td>
            <td>${inWeight !== null && inWeight > 0 ? inWeight.toLocaleString() : ""}</td>
            <td>${outWeight !== null && outWeight > 0 ? outWeight.toLocaleString() : ""}</td>
            <td>${netWeight !== null ? Math.abs(netWeight).toLocaleString() : ""}</td>
            <td>${escapeHtml(log.sealNumber || "")}</td>
          </tr>
          <tr class="info-row">
            <td colspan="2">
             Бүтээгдэхүүн/Product:${escapeHtml(log.cargoType || "")}
            </td>
            <td colspan="2">
             Орсон огноо:${inTime}
            </td>
            <td colspan="2">
              Гарсан огноо:${outTime}
            </td>
          </tr>
          <tr class="info-row">
            <td colspan="3">Шуудайны тоо хэмжээ орсон/IN Bag Qty: ${escapeHtml(log.bagQuantity ?? "—")}</td>
            <td colspan="3">Шуудайны тоо хэмжээ гарсан/OUT Bag Qty: ${escapeHtml(log.bagQuantityOut ?? "—")}</td>
          </tr>
        </tbody>
      </table>

      <!-- Bottom section: Driver, Operator, RFID, Date -->
      <div class="bottom-section">
        <div class="bottom-left">
          <div style="margin-bottom: 6px;">
            <span class="field-label">Жолооч/Driver:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${escapeHtml(driverFullInfo !== "—" ? driverFullInfo : "")}</span>           
            <span class="field-label">Пүүний оператор/Operator:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${escapeHtml(loaderName || "")}</span>
          </div>
          <div style="margin-top: 4px;">
            <span class="field-label">RFID дугаар/RFID No:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${escapeHtml(log.rfid || "—")}</span>
          </div>
        </div>
       
      </div>
    </body>
    </html>
  `;
}