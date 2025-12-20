#!/bin/bash

# Test script for the "other site" endpoint
# Tests /api/v1/api/service with different request formats

BASE_URL="https://gaali.vercel.app"
# For local testing, use: BASE_URL="http://localhost:3000"

echo "=========================================="
echo "Testing Other Site Endpoint"
echo "Base URL: $BASE_URL"
echo "=========================================="
echo ""

# Replace with an actual code from your database
TEST_CODE="311001202401180001"

echo "1. Testing GET request with code query parameter"
echo "----------------------------------------"
curl -X GET "$BASE_URL/api/v1/api/service?code=$TEST_CODE" \
  -H "Content-Type: application/json" \
  -w "\n\nStatus: %{http_code}\nTime: %{time_total}s\n" \
  -v
echo ""
echo ""

echo "2. Testing POST request with JSON body (code field)"
echo "----------------------------------------"
curl -X POST "$BASE_URL/api/v1/api/service" \
  -H "Content-Type: application/json" \
  -d "{\"code\": \"$TEST_CODE\"}" \
  -w "\n\nStatus: %{http_code}\nTime: %{time_total}s\n" \
  -v
echo ""
echo ""

echo "3. Testing POST request with JSON body (akt field)"
echo "----------------------------------------"
curl -X POST "$BASE_URL/api/v1/api/service" \
  -H "Content-Type: application/json" \
  -d "{\"akt\": \"$TEST_CODE\"}" \
  -w "\n\nStatus: %{http_code}\nTime: %{time_total}s\n" \
  -v
echo ""
echo ""

echo "4. Testing POST request with form-urlencoded"
echo "----------------------------------------"
curl -X POST "$BASE_URL/api/v1/api/service" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "code=$TEST_CODE" \
  -w "\n\nStatus: %{http_code}\nTime: %{time_total}s\n" \
  -v
echo ""
echo ""

echo "5. Testing POST request with plate number"
echo "----------------------------------------"
curl -X POST "$BASE_URL/api/v1/api/service" \
  -H "Content-Type: application/json" \
  -d "{\"plate\": \"ABC123\"}" \
  -w "\n\nStatus: %{http_code}\nTime: %{time_total}s\n" \
  -v
echo ""
echo ""

echo "6. Testing GET request without code (should return latest)"
echo "----------------------------------------"
curl -X GET "$BASE_URL/api/v1/api/service" \
  -H "Content-Type: application/json" \
  -w "\n\nStatus: %{http_code}\nTime: %{time_total}s\n" \
  -v
echo ""
echo ""

echo "7. Testing POST request without code (should return latest)"
echo "----------------------------------------"
curl -X POST "$BASE_URL/api/v1/api/service" \
  -H "Content-Type: application/json" \
  -d "{}" \
  -w "\n\nStatus: %{http_code}\nTime: %{time_total}s\n" \
  -v
echo ""
echo ""

echo "8. Testing with invalid code (should return 404)"
echo "----------------------------------------"
curl -X POST "$BASE_URL/api/v1/api/service" \
  -H "Content-Type: application/json" \
  -d "{\"code\": \"INVALID_CODE_12345\"}" \
  -w "\n\nStatus: %{http_code}\nTime: %{time_total}s\n" \
  -v
echo ""
echo ""

echo "=========================================="
echo "Testing Complete!"
echo "=========================================="
echo ""
echo "To view request logs, visit:"
echo "$BASE_URL/api-requests-debug"
echo ""
echo "Or check via API:"
echo "curl $BASE_URL/api/v1/api/service/debug?limit=10"

