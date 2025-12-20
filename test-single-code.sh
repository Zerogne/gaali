#!/bin/bash

# Quick test script for a single code
# Usage: ./test-single-code.sh YOUR_CODE_HERE

BASE_URL="https://gaali.vercel.app"
# For local testing, use: BASE_URL="http://localhost:3000"

if [ -z "$1" ]; then
    echo "Usage: $0 <CODE>"
    echo "Example: $0 311001202401180001"
    exit 1
fi

TEST_CODE="$1"

echo "Testing code: $TEST_CODE"
echo "=========================================="
echo ""

# Test with 'number' parameter (required by spec)
echo "1. POST with 'number' parameter:"
echo "----------------------------------------"
curl -X POST "$BASE_URL/api/v1/api/service" \
  -H "Content-Type: application/json" \
  -d "{\"number\": \"$TEST_CODE\"}" \
  -w "\n\nStatus: %{http_code}\n" \
  | python3 -m json.tool 2>/dev/null || cat
echo ""
echo ""

# Test with 'code' parameter
echo "2. POST with 'code' parameter:"
echo "----------------------------------------"
curl -X POST "$BASE_URL/api/v1/api/service" \
  -H "Content-Type: application/json" \
  -d "{\"code\": \"$TEST_CODE\"}" \
  -w "\n\nStatus: %{http_code}\n" \
  | python3 -m json.tool 2>/dev/null || cat
echo ""
echo ""

# Test GET with 'number' parameter
echo "3. GET with 'number' parameter:"
echo "----------------------------------------"
curl -X GET "$BASE_URL/api/v1/api/service?number=$TEST_CODE" \
  -H "Content-Type: application/json" \
  -w "\n\nStatus: %{http_code}\n" \
  | python3 -m json.tool 2>/dev/null || cat
echo ""

