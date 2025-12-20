#!/bin/bash

# Debug script to check why a code isn't working
# Usage: ./debug-code.sh YOUR_CODE_HERE

BASE_URL="https://gaali.vercel.app"

if [ -z "$1" ]; then
    echo "Usage: $0 <CODE>"
    echo "Example: $0 311001202401180001"
    exit 1
fi

TEST_CODE="$1"

echo "=========================================="
echo "Debugging Code: $TEST_CODE"
echo "=========================================="
echo ""

# Check code format
echo "1. Code Analysis:"
echo "----------------------------------------"
echo "Code: '$TEST_CODE'"
echo "Length: ${#TEST_CODE} characters"
echo "Has spaces: $([ "$TEST_CODE" != "${TEST_CODE// /}" ] && echo "YES ❌" || echo "NO ✅")"
echo "Trimmed: '$(echo $TEST_CODE | xargs)'"
echo ""

# Check if code exists in database
echo "2. Checking if code exists in database:"
echo "----------------------------------------"
ALL_CODES=$(curl -s "$BASE_URL/api/third-party/debug" | python3 -c "import sys, json; data = json.load(sys.stdin); codes = [item['code'] for item in data.get('codes', [])]; print('\n'.join(codes))" 2>/dev/null)

if echo "$ALL_CODES" | grep -q "^$TEST_CODE$"; then
    echo "✅ Code found in database"
else
    echo "❌ Code NOT found in database"
    echo ""
    echo "Available codes:"
    echo "$ALL_CODES" | head -10
    echo ""
    echo "Checking for similar codes..."
    echo "$ALL_CODES" | grep -i "$TEST_CODE" || echo "No similar codes found"
fi
echo ""

# Test with exact code
echo "3. Testing with exact code:"
echo "----------------------------------------"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/api/service" \
  -H "Content-Type: application/json" \
  -d "{\"number\": \"$TEST_CODE\"}")

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/api/service" \
  -H "Content-Type: application/json" \
  -d "{\"number\": \"$TEST_CODE\"}")

echo "HTTP Status: $HTTP_CODE"
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Request successful"
    echo "Response preview:"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null | head -20 || echo "$RESPONSE" | head -5
elif [ "$HTTP_CODE" = "404" ]; then
    echo "❌ Data not found (404)"
    echo "Error message:"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
else
    echo "❌ Error: HTTP $HTTP_CODE"
    echo "Response:"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
fi
echo ""

# Test with trimmed code
TRIMMED_CODE=$(echo "$TEST_CODE" | xargs)
if [ "$TRIMMED_CODE" != "$TEST_CODE" ]; then
    echo "4. Testing with trimmed code: '$TRIMMED_CODE'"
    echo "----------------------------------------"
    RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/api/service" \
      -H "Content-Type: application/json" \
      -d "{\"number\": \"$TRIMMED_CODE\"}")
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/api/service" \
      -H "Content-Type: application/json" \
      -d "{\"number\": \"$TRIMMED_CODE\"}")
    
    echo "HTTP Status: $HTTP_CODE"
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ Request successful with trimmed code!"
    fi
    echo ""
fi

# Check request logs
echo "5. Check request logs:"
echo "----------------------------------------"
echo "Visit: $BASE_URL/api-requests-debug"
echo "Or run: curl $BASE_URL/api/v1/api/service/debug?limit=5"
echo ""

