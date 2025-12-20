#!/bin/bash

# Comprehensive test script for debugging data pull issues
# Tests all endpoints and parameter formats

BASE_URL="https://gaali.vercel.app"
# For local testing, use: BASE_URL="http://localhost:3000"

echo "=========================================="
echo "Data Pull Testing & Debugging"
echo "=========================================="
echo ""

# Step 1: Get available codes
echo "Step 1: Getting available codes..."
echo "----------------------------------------"
CODES_RESPONSE=$(curl -s "$BASE_URL/api/third-party/debug")
echo "$CODES_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CODES_RESPONSE"
echo ""

# Extract codes (if python3 is available)
CODES=$(echo "$CODES_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(' '.join([item['code'] for item in data.get('codes', [])]))" 2>/dev/null)

if [ -z "$CODES" ]; then
    echo "⚠️  Could not extract codes automatically. Please copy a code from above."
    echo ""
    read -p "Enter a code to test: " TEST_CODE
else
    # Use first code
    TEST_CODE=$(echo $CODES | cut -d' ' -f1)
    echo "Using first code: $TEST_CODE"
    echo ""
fi

if [ -z "$TEST_CODE" ]; then
    echo "❌ No code provided. Exiting."
    exit 1
fi

echo "=========================================="
echo "Testing with code: $TEST_CODE"
echo "=========================================="
echo ""

# Test 1: GET with 'number' parameter (required by spec)
echo "Test 1: GET with 'number' parameter (required by spec)"
echo "----------------------------------------"
curl -v -X GET "$BASE_URL/api/v1/api/service?number=$TEST_CODE" \
  -H "Content-Type: application/json" \
  2>&1 | grep -E "(< HTTP|< Access-Control|{)"
echo ""
echo ""

# Test 2: GET with 'code' parameter
echo "Test 2: GET with 'code' parameter"
echo "----------------------------------------"
curl -v -X GET "$BASE_URL/api/v1/api/service?code=$TEST_CODE" \
  -H "Content-Type: application/json" \
  2>&1 | grep -E "(< HTTP|< Access-Control|{)"
echo ""
echo ""

# Test 3: GET with 'akt' parameter
echo "Test 3: GET with 'akt' parameter"
echo "----------------------------------------"
curl -v -X GET "$BASE_URL/api/v1/api/service?akt=$TEST_CODE" \
  -H "Content-Type: application/json" \
  2>&1 | grep -E "(< HTTP|< Access-Control|{)"
echo ""
echo ""

# Test 4: POST with 'number' in JSON body (required by spec)
echo "Test 4: POST with 'number' in JSON body (required by spec)"
echo "----------------------------------------"
curl -v -X POST "$BASE_URL/api/v1/api/service" \
  -H "Content-Type: application/json" \
  -d "{\"number\": \"$TEST_CODE\"}" \
  2>&1 | grep -E "(< HTTP|< Access-Control|{)"
echo ""
echo ""

# Test 5: POST with 'code' in JSON body
echo "Test 5: POST with 'code' in JSON body"
echo "----------------------------------------"
curl -v -X POST "$BASE_URL/api/v1/api/service" \
  -H "Content-Type: application/json" \
  -d "{\"code\": \"$TEST_CODE\"}" \
  2>&1 | grep -E "(< HTTP|< Access-Control|{)"
echo ""
echo ""

# Test 6: POST with 'akt' in JSON body
echo "Test 6: POST with 'akt' in JSON body"
echo "----------------------------------------"
curl -v -X POST "$BASE_URL/api/v1/api/service" \
  -H "Content-Type: application/json" \
  -d "{\"akt\": \"$TEST_CODE\"}" \
  2>&1 | grep -E "(< HTTP|< Access-Control|{)"
echo ""
echo ""

# Test 7: Direct data endpoint (path format)
echo "Test 7: Direct data endpoint (path format)"
echo "----------------------------------------"
curl -v -X GET "$BASE_URL/api/third-party/data/$TEST_CODE" \
  -H "Content-Type: application/json" \
  2>&1 | grep -E "(< HTTP|< Access-Control|{)"
echo ""
echo ""

# Test 8: Direct data endpoint (query format)
echo "Test 8: Direct data endpoint (query format)"
echo "----------------------------------------"
curl -v -X GET "$BASE_URL/api/third-party/data?code=$TEST_CODE" \
  -H "Content-Type: application/json" \
  2>&1 | grep -E "(< HTTP|< Access-Control|{)"
echo ""
echo ""

# Test 9: Check full response (pretty printed)
echo "Test 9: Full response with 'number' parameter (pretty printed)"
echo "----------------------------------------"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/api/service" \
  -H "Content-Type: application/json" \
  -d "{\"number\": \"$TEST_CODE\"}")

echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

# Test 10: Check response structure
echo "Test 10: Response structure analysis"
echo "----------------------------------------"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/api/service" \
  -H "Content-Type: application/json" \
  -d "{\"number\": \"$TEST_CODE\"}")

if echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print('Is Array:', isinstance(data, list)); print('Array Length:', len(data) if isinstance(data, list) else 'N/A'); print('First Item Keys:', list(data[0].keys()) if isinstance(data, list) and len(data) > 0 else 'N/A')" 2>/dev/null; then
    echo "✅ Response is valid JSON"
else
    echo "❌ Response is not valid JSON or has errors"
    echo "Response: $RESPONSE"
fi
echo ""

# Test 11: Check for required fields
echo "Test 11: Required fields check"
echo "----------------------------------------"
REQUIRED_FIELDS="CAR CON DRN LPC PRM SLN TRL UPC AKT NET WGT VNO"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/api/service" \
  -H "Content-Type: application/json" \
  -d "{\"number\": \"$TEST_CODE\"}")

for field in $REQUIRED_FIELDS; do
    if echo "$RESPONSE" | grep -q "\"$field\""; then
        echo "✅ $field: Present"
    else
        echo "❌ $field: MISSING"
    fi
done
echo ""

echo "=========================================="
echo "Testing Complete!"
echo "=========================================="
echo ""
echo "If all tests show errors, check:"
echo "1. Code exists in database (Step 1)"
echo "2. Code format matches exactly (no extra spaces)"
echo "3. Server logs for errors"
echo "4. CORS headers are present"
echo ""

