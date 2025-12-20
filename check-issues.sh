#!/bin/bash

# Script to check common issues when data pull fails
# Usage: ./check-issues.sh [CODE]

BASE_URL="https://gaali.vercel.app"
# For local testing, use: BASE_URL="http://localhost:3000"

echo "=========================================="
echo "Checking Common Issues"
echo "=========================================="
echo ""

# Check 1: Code exists in database
echo "1. Checking if code exists in database..."
echo "----------------------------------------"
if [ -z "$1" ]; then
    echo "Getting all available codes..."
    CODES_RESPONSE=$(curl -s "$BASE_URL/api/third-party/debug")
    echo "$CODES_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CODES_RESPONSE"
    echo ""
    echo "✅ If you see codes above, database has data"
    echo "❌ If empty or error, database might be empty"
else
    TEST_CODE="$1"
    echo "Checking code: $TEST_CODE"
    ALL_CODES=$(curl -s "$BASE_URL/api/third-party/debug" | python3 -c "import sys, json; data = json.load(sys.stdin); print('\n'.join([item['code'] for item in data.get('codes', [])]))" 2>/dev/null)
    
    if echo "$ALL_CODES" | grep -q "^$TEST_CODE$"; then
        echo "✅ Code EXISTS in database"
    else
        echo "❌ Code NOT FOUND in database"
        echo ""
        echo "Available codes:"
        echo "$ALL_CODES" | head -10
        echo ""
        echo "Checking for similar codes..."
        echo "$ALL_CODES" | grep -i "$TEST_CODE" || echo "No similar codes found"
    fi
fi
echo ""
echo ""

# Check 2: Code format (no extra spaces)
echo "2. Checking code format..."
echo "----------------------------------------"
if [ -z "$1" ]; then
    echo "⚠️  No code provided. Skipping format check."
    echo "Tip: Code should have no leading/trailing spaces"
else
    TEST_CODE="$1"
    ORIGINAL_LENGTH=${#TEST_CODE}
    TRIMMED_CODE=$(echo "$TEST_CODE" | xargs)
    TRIMMED_LENGTH=${#TRIMMED_CODE}
    
    echo "Original code: '$TEST_CODE'"
    echo "Length: $ORIGINAL_LENGTH characters"
    echo "Trimmed code: '$TRIMMED_CODE'"
    echo "Trimmed length: $TRIMMED_LENGTH characters"
    
    if [ "$ORIGINAL_LENGTH" -eq "$TRIMMED_LENGTH" ]; then
        echo "✅ No extra spaces detected"
    else
        echo "❌ EXTRA SPACES DETECTED!"
        echo "Difference: $((ORIGINAL_LENGTH - TRIMMED_LENGTH)) characters"
        echo "Use trimmed code: '$TRIMMED_CODE'"
    fi
    
    # Check for other format issues
    if [[ "$TEST_CODE" =~ [[:space:]] ]]; then
        echo "❌ Code contains spaces (should be removed)"
    fi
    
    if [[ "$TEST_CODE" =~ ^[0-9]+$ ]]; then
        echo "✅ Code is numeric (expected format)"
    else
        echo "⚠️  Code contains non-numeric characters"
    fi
fi
echo ""
echo ""

# Check 3: Server logs for errors
echo "3. Checking server logs (recent requests)..."
echo "----------------------------------------"
echo "Fetching recent request logs..."
LOGS_RESPONSE=$(curl -s "$BASE_URL/api/v1/api/service/debug?limit=5")
echo "$LOGS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGS_RESPONSE"
echo ""
echo "✅ Check the logs above for:"
echo "   - HTTP status codes (200 = success, 404 = not found, 500 = server error)"
echo "   - Error messages"
echo "   - Request body/parameters"
echo ""
echo "Or visit: $BASE_URL/api-requests-debug"
echo ""
echo ""

# Check 4: CORS headers
echo "4. Checking CORS headers..."
echo "----------------------------------------"
echo "Testing OPTIONS request (preflight)..."
CORS_RESPONSE=$(curl -s -X OPTIONS "$BASE_URL/api/v1/api/service" \
  -H "Origin: https://example.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -i)

echo "$CORS_RESPONSE" | grep -i "access-control" || echo "No CORS headers found in response"

if echo "$CORS_RESPONSE" | grep -qi "access-control-allow-origin"; then
    echo "✅ CORS headers present"
    echo "$CORS_RESPONSE" | grep -i "access-control"
else
    echo "❌ CORS headers MISSING!"
    echo "Full response:"
    echo "$CORS_RESPONSE"
fi
echo ""
echo ""

# Additional check: Test actual request
if [ -n "$1" ]; then
    TEST_CODE="$1"
    echo "5. Testing actual request..."
    echo "----------------------------------------"
    RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/api/service" \
      -H "Content-Type: application/json" \
      -H "Origin: https://example.com" \
      -d "{\"number\": \"$TEST_CODE\"}" \
      -w "\nHTTP_CODE:%{http_code}")
    
    HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
    BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')
    
    echo "HTTP Status: $HTTP_CODE"
    echo ""
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ Request successful!"
        echo "Response:"
        echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    elif [ "$HTTP_CODE" = "404" ]; then
        echo "❌ Data not found (404)"
        echo "Error:"
        echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    elif [ "$HTTP_CODE" = "500" ]; then
        echo "❌ Server error (500)"
        echo "Error:"
        echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    else
        echo "⚠️  Unexpected status: $HTTP_CODE"
        echo "Response:"
        echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    fi
fi

echo ""
echo "=========================================="
echo "Check Complete!"
echo "=========================================="

