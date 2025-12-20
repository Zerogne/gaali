#!/bin/bash

# Script to check available codes in the database

BASE_URL="https://gaali.vercel.app"
# For local testing, use: BASE_URL="http://localhost:3000"

echo "=========================================="
echo "Checking Available Codes in Database"
echo "=========================================="
echo ""

echo "Fetching available codes..."
echo ""

curl -s "$BASE_URL/api/third-party/debug" | python3 -m json.tool

echo ""
echo "=========================================="
echo ""
echo "To test with a code, use:"
echo "curl -X POST \"$BASE_URL/api/v1/api/service\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"code\": \"YOUR_CODE_HERE\"}'"
echo ""

