/**
 * Scale Autofill Module
 * 
 * Integrates with ScaleServiceApp WebSocket server to fetch and auto-fill form data.
 * 
 * Usage:
 *   <script type="module" src="/js/scale-autofill.js"></script>
 *   Then call initScaleAutofill() after DOM is ready.
 */

/**
 * Builds the HTTP API URL for fetching receipt data
 * @param {string} receiptNumber - The receipt number to fetch data for
 * @returns {string} The complete API URL
 */
function buildScaleApiUrl(receiptNumber) {
  // Adjust this if the real API uses query params instead of path
  // Example with query: return `https://gate-etos.mn/gate/api/receipt/data/number?number=${encodeURIComponent(receiptNumber)}`;
  return `https://gate-etos.mn/gate/api/receipt/data/number/${encodeURIComponent(receiptNumber)}`;
}

/**
 * Field mapping configuration
 * Maps API field names to HTML input element IDs
 * Adjust this object to change field mappings
 */
const FIELD_MAPPING = {
  CAR: 'carInput',
  CON: 'conInput',
  DRN: 'drnInput',
  LPC: 'lpcInput',
  SLN: 'slnInput',
  TRL: 'trlInput',
  UPC: 'upcInput',
  AKT: 'aktInput',
  NET: 'netInput',
  WGT: 'wgtInput',
  VNO: 'vnoInput',
  CT1: 'ct1Input',
  CMN: 'cmnInput',
};

/**
 * WebSocket connection state
 */
let ws = null;
let reconnectTimeout = null;
let isConnecting = false;
const RECONNECT_DELAY = 2000; // 2 seconds
const WS_URL = 'ws://127.0.0.1:9000/service'; // Adjust if WebSocket URL changes

/**
 * Updates the status display element
 * @param {string} message - Status message to display
 * @param {string} type - Message type: 'success', 'error', or 'info'
 */
function updateStatus(message, type = 'info') {
  const statusEl = document.getElementById('scaleStatus');
  if (!statusEl) return;

  statusEl.textContent = message;
  statusEl.className = `scale-status scale-status-${type}`;
}

/**
 * Connects to the WebSocket server
 * @returns {Promise<WebSocket>} Promise that resolves when connected
 */
function connectWebSocket() {
  return new Promise((resolve, reject) => {
    if (isConnecting) {
      reject(new Error('Connection already in progress'));
      return;
    }

    if (ws && ws.readyState === WebSocket.OPEN) {
      resolve(ws);
      return;
    }

    isConnecting = true;
    updateStatus('Connecting to scale service...', 'info');

    try {
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        isConnecting = false;
        updateStatus('Connected to scale service', 'success');
        resolve(ws);
      };

      ws.onerror = (error) => {
        isConnecting = false;
        console.error('WebSocket error:', error);
        updateStatus('Error connecting to scale service. Is ScaleServiceApp running?', 'error');
        reject(error);
      };

      ws.onclose = () => {
        isConnecting = false;
        updateStatus('Disconnected from scale service', 'error');
        
        // Auto-reconnect after delay
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
        }
        reconnectTimeout = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connectWebSocket().catch(() => {
            // Reconnection failed, will retry on next attempt
          });
        }, RECONNECT_DELAY);
      };

      ws.onmessage = (event) => {
        // This will be handled by the send function's promise
        console.log('Received message from scale service');
      };
    } catch (error) {
      isConnecting = false;
      updateStatus('Failed to create WebSocket connection', 'error');
      reject(error);
    }
  });
}

/**
 * Sends a URL to the WebSocket server and waits for the response
 * @param {string} url - The HTTP URL to fetch
 * @returns {Promise<string>} Promise that resolves with the JSON response
 */
function sendUrlAndWaitForResponse(url) {
  return new Promise((resolve, reject) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      reject(new Error('WebSocket is not connected'));
      return;
    }

    // Set up a one-time message handler
    const messageHandler = (event) => {
      ws.removeEventListener('message', messageHandler);
      resolve(event.data);
    };

    const errorHandler = () => {
      ws.removeEventListener('error', errorHandler);
      ws.removeEventListener('close', errorHandler);
      reject(new Error('WebSocket connection lost'));
    };

    ws.addEventListener('message', messageHandler);
    ws.addEventListener('error', errorHandler);
    ws.addEventListener('close', errorHandler);

    // Send the URL
    try {
      ws.send(url);
    } catch (error) {
      ws.removeEventListener('message', messageHandler);
      ws.removeEventListener('error', errorHandler);
      ws.removeEventListener('close', errorHandler);
      reject(error);
    }
  });
}

/**
 * Parses JSON response and extracts the data object
 * @param {string} jsonString - The JSON string to parse
 * @returns {Object|null} The data object or null if invalid
 */
function parseScaleData(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    
    // If it's an array, use the first element
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return null;
      }
      return data[0];
    }
    
    // If it's an object, use it directly
    if (typeof data === 'object' && data !== null) {
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return null;
  }
}

/**
 * Fills form fields with the provided data
 * @param {Object} data - The data object containing field values
 */
function fillFormFields(data) {
  let filledCount = 0;

  for (const [apiField, inputId] of Object.entries(FIELD_MAPPING)) {
    const inputEl = document.getElementById(inputId);
    if (!inputEl) {
      console.warn(`Input element with ID "${inputId}" not found`);
      continue;
    }

    const value = data[apiField];
    if (value !== undefined && value !== null && value !== '') {
      inputEl.value = String(value);
      filledCount++;
    }
  }

  return filledCount;
}

/**
 * Handles the send button click
 */
async function handleSendClick() {
  const receiptInput = document.getElementById('receiptNumberInput');
  if (!receiptInput) {
    updateStatus('Receipt number input not found', 'error');
    return;
  }

  const receiptNumber = receiptInput.value.trim();
  if (!receiptNumber) {
    updateStatus('Please enter a receipt number', 'error');
    return;
  }

  // Build the API URL
  const apiUrl = buildScaleApiUrl(receiptNumber);
  console.log('Fetching data from:', apiUrl);

  try {
    // Ensure WebSocket is connected
    await connectWebSocket();

    updateStatus('Fetching data...', 'info');

    // Send URL and wait for response
    const jsonResponse = await sendUrlAndWaitForResponse(apiUrl);

    // Parse the JSON
    const data = parseScaleData(jsonResponse);
    if (!data) {
      updateStatus('No data received or invalid response format', 'error');
      return;
    }

    // Fill the form
    const filledCount = fillFormFields(data);
    
    if (filledCount > 0) {
      updateStatus(`Connected & filled from receipt ${receiptNumber} (${filledCount} fields)`, 'success');
    } else {
      updateStatus(`Received data but no fields matched`, 'info');
    }
  } catch (error) {
    console.error('Error fetching scale data:', error);
    updateStatus(`Error: ${error.message}`, 'error');
  }
}

/**
 * Initializes the scale autofill functionality
 * Sets up WebSocket connection and attaches event handlers
 */
export function initScaleAutofill() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupScaleAutofill();
    });
  } else {
    setupScaleAutofill();
  }
}

/**
 * Sets up the scale autofill functionality
 */
function setupScaleAutofill() {
  const sendBtn = document.getElementById('sendBtn');
  if (!sendBtn) {
    console.warn('Send button (#sendBtn) not found. Scale autofill may not work.');
    return;
  }

  // Attach click handler
  sendBtn.addEventListener('click', handleSendClick);

  // Try to connect to WebSocket on init (optional, can be lazy)
  connectWebSocket().catch(() => {
    // Connection will be attempted when user clicks send
  });

  updateStatus('Scale autofill ready. Enter receipt number and click Send.', 'info');
}

// Auto-initialize if this module is loaded directly
if (typeof window !== 'undefined') {
  initScaleAutofill();
}
