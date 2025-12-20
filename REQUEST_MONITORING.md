# Request Monitoring System

This system captures detailed information about all requests to the `/api/v1/api/service` endpoint to help you understand how the "other site" is making requests.

## What Gets Captured

For every request, the system logs:

- **Request Method** (GET, POST, etc.)
- **Full URL** and pathname
- **Query Parameters** (for GET requests)
- **All HTTP Headers** (including User-Agent, Content-Type, etc.)
- **Request Body** (for POST requests)
- **IP Address** (from X-Forwarded-For or X-Real-IP headers)
- **Response Status Code**
- **Response Time** (in milliseconds)
- **Any Errors** that occurred
- **Timestamp** of the request

## How to View Logs

### Option 1: Web Interface

Visit: `https://gaali.vercel.app/api-requests-debug`

This page shows:
- A list of all recent requests (last 100)
- Click any request to see full details
- Auto-refreshes every 10 seconds
- View headers, body, query params, and raw JSON

### Option 2: API Endpoint

**GET** `/api/v1/api/service/debug`

Query parameters:
- `limit` - Number of logs to return (default: 50)
- `pathname` - Filter by specific pathname (e.g., `/api/v1/api/service`)

Example:
```bash
curl https://gaali.vercel.app/api/v1/api/service/debug?limit=100
```

**Note:** This endpoint requires authentication (you must be logged in).

## What This Tells You About the Other Site

By examining the logs, you can determine:

1. **Request Format**
   - Does it use GET or POST?
   - What Content-Type header does it send?
   - How does it format the request body?

2. **Headers**
   - What User-Agent does it use? (tells you what technology/library)
   - What other custom headers does it send?
   - Does it send authentication headers?

3. **Data Format**
   - How does it send the code? (query param, JSON body, form data?)
   - What field names does it use? (`code`, `akt`, `number`, etc.)
   - Does it send any additional data?

4. **Behavior**
   - How often does it make requests?
   - What IP addresses does it come from?
   - Does it handle errors correctly?
   - What response times does it experience?

## Example Use Cases

### Finding Out What Content-Type They Use

Look at the `contentType` field in the logs. Common values:
- `application/json` - They're sending JSON
- `application/x-www-form-urlencoded` - They're sending form data
- `multipart/form-data` - They're sending multipart form data

### Finding Out How They Send the Code

For GET requests, check the `queryParams` field.
For POST requests, check the `body` field and see what keys they use.

### Identifying the Technology

Check the `userAgent` field. Examples:
- `curl/7.68.0` - They're using curl
- `Python-urllib/3.9` - They're using Python
- `Java/1.8.0` - They're using Java
- Custom user agents might indicate specific libraries

## Storage

- Logs are stored in MongoDB collection: `request_logs`
- Only the last 1000 requests are kept (oldest are automatically deleted)
- Each log entry includes all the information listed above

## Troubleshooting

If you're not seeing logs:
1. Make sure requests are actually reaching the endpoint
2. Check that the endpoint is being called (not blocked by proxy)
3. Verify MongoDB connection is working
4. Check server logs for any errors in the logging system

If logs are missing information:
- Some headers might not be sent by the client
- Body might be empty for GET requests
- IP address might be "unknown" if headers aren't set by the proxy

