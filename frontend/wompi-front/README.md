# Wompi Frontend (React + Vite + TS)

This frontend implements Step 1 (product list) and Step 2 (checkout form sheet)
of the flow. It uses Redux Toolkit to manage app state in a simple, beginner-
friendly way.

## Current flow

1) Step 1 shows a list of products from the backend.
2) The user selects a product.
3) Step 2 opens a bottom sheet with card + delivery fields.
4) The Continue button only validates the form (no transaction yet).

## Folder structure (what matters so far)

```
src/
  components/
    ProductScreen.tsx          Product cards list (Step 1)
    CheckoutFormSheet.tsx      Bottom sheet + form fields (Step 2)
  services/
    api/
      client.ts                Small fetch wrapper
      products.ts              GET /products API call
  store/
    index.ts                   Redux store setup
    hooks.ts                   Typed Redux hooks
    slices/
      checkoutSlice.ts         Product list state + fetchProducts thunk
      formSlice.ts             Form values, errors, sheet open/close
  utils/
    validators.ts              Form validation + card brand detection
  tests/
    checkoutSlice.test.ts
    formSlice.test.ts
    validators.test.ts
    checkoutFormSheet.test.tsx
    ui.test.tsx
    app.test.tsx
```

## State management (Redux Toolkit)

- `checkoutSlice`:
  - `products`, `status`, `selectedProductId`, `errorMessage`
  - `fetchProducts` loads the product list from the backend
- `formSlice`:
  - `values` for all form fields
  - `errors` for validation messages
  - `isSheetOpen` for the bottom sheet

## Validation rules

Validation lives in `src/utils/validators.ts` and is used by the sheet when the
user clicks Continue. It checks:

- Required fields
- Email format
- Phone format (digits only, 7 to 15)
- Card number length (15 or 16 digits)
- Expiry format (MM/YY)
- CVV length (3 digits, or 4 for Amex)
- Card brand detection (Visa, Mastercard, Amex)

## Environment

The API base URL defaults to `http://localhost:3000`. You can override it with:

```
VITE_API_BASE_URL=http://localhost:3000
```

## Scripts

```
npm run dev
npm run test -- --coverage
```
