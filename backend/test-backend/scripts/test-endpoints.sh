#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "Listing products..."
products_json="$(curl -s "${BASE_URL}/products")"
echo "$products_json"

product_id="$(echo "$products_json" | node -e "const data=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log(data?.[0]?.id || '')")"

if [[ -z "$product_id" ]]; then
  echo "No products found. Seed products first with: npm run seed:products"
  exit 1
fi

echo "Creating transaction..."
transaction_json="$(curl -s -X POST "${BASE_URL}/transactions" \
  -H "Content-Type: application/json" \
  -d "{
    \"productId\": \"${product_id}\",
    \"baseFee\": 1000,
    \"deliveryFee\": 2000,
    \"customer\": {
      \"fullName\": \"Jane Doe\",
      \"email\": \"jane@example.com\",
      \"phone\": \"3000000000\",
      \"address\": \"Street 123\",
      \"city\": \"Bogota\"
    }
  }")"
echo "$transaction_json"

transaction_id="$(echo "$transaction_json" | node -e "const data=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log(data?.transactionId || '')")"

if [[ -z "$transaction_id" ]]; then
  echo "Transaction not created. Check API logs."
  exit 1
fi

echo "Fetching transaction..."
curl -s "${BASE_URL}/transactions/${transaction_id}"
echo

echo "Paying transaction (success)..."
curl -s -X POST "${BASE_URL}/transactions/${transaction_id}/pay" \
  -H "Content-Type: application/json" \
  -d '{ "success": true }'
echo
