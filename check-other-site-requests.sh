#!/bin/bash

# Script to check what requests the other site is making
# This helps identify why they can't pull data

BASE_URL="https://gaali.vercel.app"

echo "=========================================="
echo "Checking Other Site Requests"
echo "=========================================="
echo ""

echo "Fetching recent request logs..."
echo ""

# Get recent requests
LOGS=$(curl -s "$BASE_URL/api/v1/api/service/debug?limit=10")

echo "$LOGS" | python3 << 'PYTHON_SCRIPT'
import sys
import json

try:
    data = json.load(sys.stdin)
    count = data.get('count', 0)
    print(f'Total recent requests: {count}')
    print('')
    
    if data.get('logs'):
        print('Recent Requests:')
        print('=' * 60)
        for i, log in enumerate(data['logs'][:5], 1):
            method = log.get('method', 'N/A')
            pathname = log.get('pathname', 'N/A')
            print(f'\n{i}. {method} {pathname}')
            print(f'   Status: {log.get("responseStatus", "N/A")}')
            print(f'   Time: {log.get("timestamp", "N/A")}')
            print(f'   IP: {log.get("ipAddress", "N/A")}')
            
            # Parse body
            body = log.get('body', '')
            if body:
                try:
                    if isinstance(body, str):
                        body_obj = json.loads(body)
                    else:
                        body_obj = body
                    print(f'   Body: {json.dumps(body_obj, indent=6)}')
                    if isinstance(body_obj, dict):
                        params = list(body_obj.keys())
                        print(f'   Parameters used: {params}')
                        if 'number' in params:
                            print('   ✅ Using "number" parameter (correct)')
                        elif 'code' in params:
                            print('   ⚠️  Using "code" parameter (works but should use "number")')
                        elif 'akt' in params:
                            print('   ⚠️  Using "akt" parameter (works but should use "number")')
                        else:
                            print('   ❌ Not using number/code/akt parameter!')
                except Exception as e:
                    print(f'   Body: {body}')
            
            # Check for errors
            if log.get('error'):
                print(f'   ❌ Error: {log["error"]}')
            elif log.get('responseStatus') == 404:
                print('   ❌ 404 - Data not found')
            elif log.get('responseStatus') == 500:
                print('   ❌ 500 - Server error')
            elif log.get('responseStatus') == 200:
                print('   ✅ 200 - Success')
            
            # Check Content-Type
            ct = log.get('contentType', '')
            if ct:
                print(f'   Content-Type: {ct}')
                if 'application/json' in ct:
                    print('   ✅ Correct Content-Type')
                else:
                    print('   ⚠️  Wrong Content-Type (should be application/json)')
    else:
        print('No recent requests found')
        print('')
        print('This could mean:')
        print('1. Other site has not made any requests yet')
        print('2. Requests are being blocked before reaching the server')
        print('3. They are using a different endpoint')
except Exception as e:
    print(f'Error parsing logs: {e}')
    print('Raw response:')
    try:
        sys.stdin.seek(0)
        print(sys.stdin.read())
    except:
        pass
PYTHON_SCRIPT

if [ $? -ne 0 ]; then
    echo ""
    echo "Python parsing failed. Raw response:"
    echo "$LOGS"
fi

echo ""
echo "=========================================="
echo ""
echo "What to check:"
echo "1. Are they using POST method? (not GET)"
echo "2. Are they using 'number' parameter? (or 'code'/'akt')"
echo "3. Is Content-Type 'application/json'?"
echo "4. What HTTP status are they getting? (200 = success, 404 = not found)"
echo "5. Are there any errors in the logs?"
echo ""
echo "Visit for more details:"
echo "$BASE_URL/api-requests-debug"
echo ""

