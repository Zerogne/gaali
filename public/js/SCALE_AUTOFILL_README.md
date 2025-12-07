# Scale Autofill Module

This module integrates with the ScaleServiceApp WebSocket server to automatically fetch and fill form data from an external API.

## Files

- `scale-autofill.js` - Main module file
- `scale-autofill-example.html` - Example HTML page showing usage

## How It Works

1. Connects to WebSocket server at `ws://127.0.0.1:9000/service`
2. When user clicks "Send" button, reads receipt number from input
3. Builds API URL: `https://gate-etos.mn/gate/api/receipt/data/number/{receiptNumber}`
4. Sends URL over WebSocket to ScaleServiceApp
5. ScaleServiceApp fetches the JSON from the API
6. Returns JSON response via WebSocket
7. Module parses JSON and auto-fills form fields

## Usage

### Basic HTML Integration

```html
<!DOCTYPE html>
<html>
<head>
  <title>Scale Form</title>
</head>
<body>
  <form id="scale-form">
    <input id="receiptNumberInput" name="receiptNumber" placeholder="Enter receipt number" />
    
    <!-- Form fields with IDs matching FIELD_MAPPING -->
    <input id="carInput" name="car" />
    <input id="conInput" name="con" />
    <!-- ... other fields ... -->
    
    <button type="button" id="sendBtn">Send</button>
  </form>
  
  <div id="scaleStatus"></div>
  
  <!-- Include the module -->
  <script type="module" src="/js/scale-autofill.js"></script>
</body>
</html>
```

### React/Next.js Integration

If you need to integrate this into a React component:

```tsx
import { useEffect } from 'react';

export function ScaleForm() {
  useEffect(() => {
    // Dynamically import and initialize
    import('/js/scale-autofill.js').then((module) => {
      module.initScaleAutofill();
    });
  }, []);

  return (
    <form id="scale-form">
      <input id="receiptNumberInput" name="receiptNumber" />
      {/* ... other fields ... */}
      <button type="button" id="sendBtn">Send</button>
    </form>
  );
}
```

## Configuration

### Change Field Mappings

Edit the `FIELD_MAPPING` object in `scale-autofill.js`:

```javascript
const FIELD_MAPPING = {
  CAR: 'carInput',      // Change 'carInput' to your actual input ID
  CON: 'conInput',
  // ... add or modify mappings
};
```

### Change API URL Format

Edit the `buildScaleApiUrl` function:

```javascript
function buildScaleApiUrl(receiptNumber) {
  // For query parameter format:
  return `https://gate-etos.mn/gate/api/receipt/data/number?number=${encodeURIComponent(receiptNumber)}`;
  
  // Or for path format (current):
  return `https://gate-etos.mn/gate/api/receipt/data/number/${encodeURIComponent(receiptNumber)}`;
}
```

### Change WebSocket URL

Edit the `WS_URL` constant:

```javascript
const WS_URL = 'ws://127.0.0.1:9000/service'; // Change if needed
```

## Field Mapping Reference

| API Field | Default Input ID | Description |
|-----------|------------------|-------------|
| CAR | carInput | Cargo/Route |
| CON | conInput | Contract/Consignment |
| DRN | drnInput | Driver name/info |
| LPC | lpcInput | Loading point company |
| SLN | slnInput | Seal number |
| TRL | trlInput | Trailer |
| UPC | upcInput | Unloading point company |
| AKT | aktInput | Act number |
| NET | netInput | Net weight |
| WGT | wgtInput | Gross weight |
| VNO | vnoInput | Vehicle number |
| CT1 | ct1Input | Custom field 1 |
| CMN | cmnInput | Comments |

## Error Handling

The module handles various error cases:

- **WebSocket not connected**: Shows error message, attempts auto-reconnect
- **Invalid JSON**: Shows error, doesn't overwrite form fields
- **Empty response**: Shows message, doesn't fill fields
- **Missing form fields**: Logs warning, continues with available fields

## Status Messages

The `#scaleStatus` element displays:

- **Success**: Green background - "Connected & filled from receipt X"
- **Error**: Red background - Error description
- **Info**: Blue background - Connection status, instructions

## Requirements

1. ScaleServiceApp must be running on the same machine
2. WebSocket server must be accessible at `ws://127.0.0.1:9000/service`
3. Browser must support WebSocket API (all modern browsers)
4. Form must have input elements with IDs matching `FIELD_MAPPING`

## Testing

1. Start ScaleServiceApp
2. Open `scale-autofill-example.html` in a browser
3. Enter a receipt number
4. Click "Send" button
5. Form fields should auto-fill with data from the API

## Troubleshooting

**"Error connecting to scale service"**
- Check if ScaleServiceApp is running
- Verify WebSocket URL is correct
- Check browser console for detailed errors

**"No data received"**
- Verify receipt number is correct
- Check if API URL is accessible
- Verify API returns valid JSON

**Fields not filling**
- Check if input IDs match `FIELD_MAPPING`
- Verify JSON contains expected field names
- Check browser console for warnings
