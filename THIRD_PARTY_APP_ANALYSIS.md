# 3rd Party App Analysis (dnSpy Reverse Engineering)

## Decompiled Code Analysis

### PuuHandler Class

```csharp
public class PuuHandler : WebSocketBehavior
{
    protected override void OnMessage(MessageEventArgs e)
    {
        string data = this.GetData(e.Data);
        Console.WriteLine(data ?? "");
        base.Send(data);
    }

    public string GetData(string url)
    {
        string result = null;
        if (!string.IsNullOrEmpty(url))
        {
            HttpClient httpClient = new HttpClient
            {
                BaseAddress = new Uri(url)
            };
            try
            {
                httpClient.DefaultRequestHeaders.Accept.Add(
                    new MediaTypeWithQualityHeaderValue("application/json"));
                result = httpClient.GetAsync("").Result
                    .Content.ReadAsStringAsync().Result.ToString();
            }
            catch (WebException ex)
            {
                result = (ex.Message ?? "");
            }
            return result;
        }
        return result;
    }
}
```

## How It Works

### Expected Behavior

1. **WebSocket receives a URL string** (not JSON!)
2. The app treats the incoming message as a URL
3. It makes an HTTP GET request to that URL
4. It expects the response to be JSON
5. It echoes the JSON response back via WebSocket

### Current Implementation Issue

Your current code (`useThirdPartyAutofill.ts`) sends **JSON data directly**, but the app expects a **URL string**.

## Two Different Use Cases

### Use Case 1: Fetching Data (scale-autofill.js) ✅ CORRECT

- Sends: `"https://gate-etos.mn/gate/api/receipt/data/number/12345"`
- App fetches data from that URL
- App returns JSON response
- **This works correctly!**

### Use Case 2: Sending Form Data (useThirdPartyAutofill.ts) ❌ WRONG

- Currently sends: `{"uniqueCode": "...", "CAR": "...", ...}`
- App tries to use JSON as a URL → **FAILS**
- **This doesn't work!**

## Solution Options

### Option 1: Create an API Endpoint (Recommended)

Create a REST API endpoint that the app can fetch from:

1. Create endpoint: `/api/truck-sessions/by-code/[code]`
2. Send URL to WebSocket: `"http://localhost:3000/api/truck-sessions/by-code/12345678"`
3. App fetches from your API
4. App returns JSON to WebSocket
5. Your app receives the data

### Option 2: Modify Your Integration

Change `useThirdPartyAutofill.ts` to send a URL instead of JSON:

```typescript
// Instead of sending JSON:
ws.send(JSON.stringify(formData));

// Send a URL:
const apiUrl = `http://localhost:3000/api/truck-sessions/by-code/${formData.uniqueCode}`;
ws.send(apiUrl);
```

### Option 3: Check if There's Another Handler

The decompiled code might be incomplete. Check if there are other WebSocket handlers:

- Look for other classes extending `WebSocketBehavior`
- Check for different routes/paths (e.g., `/service`, `/data`, `/autofill`)
- The app might have multiple handlers for different purposes

## Code Issues Found

### Bug in GetData Method

The `GetData` method has a potential issue:

- It uses `BaseAddress = new Uri(url)` - this will fail if `url` is not a valid URI
- If you send JSON, it will throw a `UriFormatException`
- The catch block only catches `WebException`, not `UriFormatException`

### Missing Error Handling

- No validation that the URL is valid
- No timeout handling
- Synchronous blocking calls (`Result`) can cause deadlocks

## Recommended Next Steps

1. **Verify the WebSocket path**: Confirm it's `/service` or check for other paths
2. **Test with URL**: Try sending a URL string to see if it works
3. **Create API endpoint**: Build the endpoint that returns your form data
4. **Update integration**: Modify your code to send URLs instead of JSON

## ✅ Solution Implemented

### 1. Updated API Endpoint

- Modified `/api/truck-sessions/by-code/[code]` to support `?format=thirdparty`
- Returns data in 3rd party app format (CAR, CON, DRN, LPC, etc.)
- Maps your internal fields to the expected format:
  - `product` → `CAR`
  - `driverName` → `DRN`
  - `transporterCompany` → `LPC`
  - `plateNumber` → `VNO`
  - `grossWeightKg` → `WGT`
  - `netWeightKg` → `NET`
  - `notes` → `CMN`

### 2. Updated Integration Code

- **useThirdPartyAutofill.ts**: Now sends URL string instead of JSON
- **test-websocket.html**: Updated to send URL format
- Both now send: `http://localhost:3000/api/truck-sessions/by-code/{uniqueCode}?format=thirdparty`

### 3. How It Works Now

1. Your app saves truck session with `uniqueCode`
2. When sending to 3rd party app, you send the API URL
3. 3rd party app receives URL, fetches data from your API
4. 3rd party app returns JSON data via WebSocket
5. Your app receives the response (if needed)

## Testing

To test the integration:

1. **Save a truck session** (IN or OUT) - this generates a `uniqueCode`
2. **Click "Send to 3rd Party App"** - this sends the URL
3. **Check 3rd party app** - it should fetch and display the data
4. **Check WebSocket response** - you should see the JSON data returned

## Testing Strategy

1. Test with a simple URL first:

   ```
   ws.send("https://jsonplaceholder.typicode.com/posts/1")
   ```

   Should return JSON data

2. Test with your API:

   ```
   ws.send("http://localhost:3000/api/truck-sessions/by-code/12345678")
   ```

   Should return your form data

3. Verify the response format matches what the app expects
