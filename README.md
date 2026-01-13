# test-payment

Technical test for Payment using NestJS + TypeORM + PostgreSQL.

## Overview

This project implements a guest checkout flow where customers are identified by email.
The backend follows a ports-and-adapters (clean architecture) style per module, with
entities in `domain`, use cases in `application`, and adapters in `infrastructure`.

## Repository layout

```
backend/payment-backend/   NestJS API (TypeORM + PostgreSQL)
frontend/                  Frontend app
```

The backend lives in `backend/test-backend`.

## Backend module structure

Each module follows the same structure:

```
modules/<module-name>/
  application/           Use cases and ports (interfaces/tokens)
  domain/entities/       TypeORM entities
  infrastructure/        Adapters (TypeORM repositories, gateways)
  interfaces/            Controllers (HTTP entrypoints)
  <module>.module.ts     Nest module wiring
```

Key modules:
- `product`: products catalog and listing
- `customer`: guest customer info by email
- `transaction`: payment transaction state
- `checkout`: orchestration use cases and payment gateway stub

## Ports & adapters (how dependencies are wired)

Use cases depend on ports (tokens + interfaces). Adapters implement those ports and
are bound inside their modules:

- Product
  - Port: `PRODUCT_REPOSITORY`
  - Adapter: `TypeOrmProductRepository`
- Customer
  - Port: `CUSTOMER_REPOSITORY`
  - Adapter: `TypeOrmCustomerRepository`
- Transaction
  - Port: `TRANSACTION_REPOSITORY`
  - Adapter: `TypeOrmTransactionRepository`
- Payment
  - Port: `PAYMENT_GATEWAY`
  - Adapter: `WompiPaymentGateway`

The `CheckoutModule` imports Product/Customer/Transaction modules so their ports are
available to checkout use cases.

## Environment variables

Create a `.env` file in `backend/payment-backend` (same level as `package.json`).
A template exists at `backend/payment-backend/.env.template`.

```
DB_HOST=
DB_PORT=5432
DB_USER=
DB_PASSWORD=
DB_NAME=postgres
DB_SSL=true
DB_SYNCHRONIZE=false

WOMPI_BASE_URL=

WOMPI_PUBLIC_KEY=

WOMPI_PRIVATE_KEY=

WOMPI_EVENTS_SECRET=

WOMPI_INTEGRITY_KEY=

WOMPI_CURRENCY=COP
```

Notes:
- `DB_SSL=true` is recommended for RDS.
- `DB_SYNCHRONIZE=true` is for local dev only; do not use in production.

## Running the backend

From `backend/payment-backend`:

```
npm install
npm run start:dev
```

## Seed products

Run the seeder once to populate products:

```
npm run seed:products
```

If products already exist with the same names, the seeder skips them.

## Test endpoints (helper script)

There is a helper script to exercise the main flow:

```
bash scripts/test-endpoints.sh
```

Optional: `BASE_URL=http://localhost:3000 bash scripts/test-endpoints.sh`

## Testing & coverage

Run tests with coverage:

```
npm test -- --coverage
```

![testing coverage image](image.png)
![testing coverage frontend image](image-1.png)

## Frontend (React + Vite + TS)

This frontend implements the checkout flow and connects to the backend APIs
listed below.

## Current flow

1) Step 1 shows a list of products from the backend.
2) The user selects a product.
3) Step 2 opens a bottom sheet with card + delivery fields (stored in Redux).
4) Step 3 shows a summary and creates a transaction.
5) Step 4 shows status and polls until success/failure.
6) On success, the flow resets and products are re-fetched.

## Folder structure (what matters so far)

```
frontend/wompi-front/src/
  components/
    ProductScreen.tsx          Product cards list (Step 1)
    CheckoutFormSheet.tsx      Bottom sheet + form fields (Step 2)
    SummaryScreen.tsx          Summary and confirm (Step 3)
    StatusScreen.tsx           Status + retry/return (Step 4)
  services/
    api/
      client.ts                Small fetch wrapper
      products.ts              GET /products API call
      transactions.ts          Transaction endpoints
    env.ts                     Environment helper for tests/runtime
  store/
    index.ts                   Redux store setup + persistence
    hooks.ts                   Typed Redux hooks
    persist.ts                 localStorage adapter
    slices/
      checkoutSlice.ts         Product list + step state
      formSlice.ts             Form values, errors, sheet open/close
      transactionSlice.ts      Transaction status + polling
      wompiSlice.ts            Token + acceptance state
  utils/
    validators.ts              Form validation + card brand detection
  tests/
    *.test.tsx
```

## How the frontend connects to the backend

- `GET /products` to show products + available stock.
- `POST /transactions` to create a PENDING transaction.
- `POST /transactions/:id/pay` to confirm payment.
- `GET /transactions/:id` for polling and recovery.

The frontend uses `VITE_API_BASE_URL` to build requests in
`frontend/wompi-front/src/services/api/client.ts`.

## Environment

Use `frontend/wompi-front/.env.template` as a starting point, then create a
`frontend/wompi-front/.env` file with your values:

```
VITE_API_BASE_URL=http://localhost:3000
VITE_PUBLIC_KEY=pub_stagtest_xxx
VITE_BASE_URL=
```

## Frontend scripts

From `frontend/wompi-front`:

```
npm run dev
npm run test
npm run coverage
```

## API endpoints

### GET /products
Lists products, including `availableUnits`.

### POST /transactions
Creates a PENDING transaction.

Request body:
```
{
  "productId": "uuid",
  "baseFee": 1000,
  "deliveryFee": 2000,
  "customer": {
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "phone": "3000000000",
    "address": "Street 123",
    "city": "Bogota",
    "notes": "Leave at door"
  }
}
```

Response:
```
{
  "transactionId": "uuid",
  "status": "PENDING",
  "totalAmount": 1234
}
```

### GET /transactions/:id
Retrieves the transaction state.

### POST /transactions/:id/pay
Simulates a payment:
- Success decreases `product.availableUnits` by 1
- Failure leaves stock unchanged

Request body:
```
{ "success": true }
```

Response:
```
{
  "transactionId": "uuid",
  "status": "SUCCESS",
  "paymentReference": "ref"
}
```

## Checkout flow (high level)

1. Controller calls a use case.
2. Use case uses ports (product, customer, transaction).
3. Ports resolve to TypeORM adapters via module wiring.
4. Payment is simulated using the fake Payment gateway.

This keeps application logic isolated from infrastructure details.

## Railway‑Oriented Programming (ROP)

The checkout use cases follow a Railway‑Oriented Programming style to keep
errors explicit and easy to reason about.

What was added:
- A `Result` type with `ok`/`err` helpers in
  `backend/wompi-backend/src/modules/checkout/domain/types/result.types.ts`
- Checkout error definitions (`CheckoutError`, `CheckoutErrorCode`) in
  `backend/wompi-backend/src/modules/checkout/domain/types/checkout.types.ts`
- Use cases now return `Result` instead of throwing:
  - `backend/wompi-backend/src/modules/checkout/application/use-cases/create-transaction.usecase.ts`
  - `backend/wompi-backend/src/modules/checkout/application/use-cases/get-transaction.usecase.ts`
  - `backend/wompi-backend/src/modules/checkout/application/use-cases/pay-transaction.usecase.ts`
- The controller translates `Result` errors into HTTP responses in
  `backend/wompi-backend/src/modules/transaction/interfaces/transaction.controller.ts`

## Deployment

Frontend:
- Hosted on S3 static website hosting.
- URL: http://wompi-frontend.s3-website-us-east-1.amazonaws.com/

Backend:
- Deployed on EC2.
- API URL: http://13.221.42.133:3000
- Database hosted on RDS (PostgreSQL).

  ## Design decisions

- Clean Architecture / Ports & Adapters was chosen to:
  - Isolate business logic from infrastructure concerns
  - Make the payment gateway easily swappable
  - Improve testability of use cases

- Guest checkout via email:
  - Avoids user accounts to simplify the flow
  - Customer entity is created or reused by email

## Business rules

- Product stock is decreased only after a SUCCESS payment
- Failed payments do not affect stock
- A transaction starts in PENDING state (Frontend starts polling and waits for fail or success and then shows it in the front-end)
- Transactions are immutable except for status changes


## Possible improvements

- Introduce background jobs instead of polling
- Add authentication for non-guest users
- Containerize services using Docker Compose

