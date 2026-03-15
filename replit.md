# Workspace

## Overview

Full-stack CustomFit Pants e-commerce website — a startup that sells customized pants for men.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Auth**: JWT (jsonwebtoken) + Phone OTP (simulated in dev)
- **Frontend**: React + Vite + Tailwind CSS v4 + shadcn/ui + framer-motion

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── customfit/          # React+Vite frontend (CustomFit Pants)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Features

- Landing page with hero, how-it-works, features, testimonials, footer
- Phone number authentication with OTP (simulated in dev — OTP shown on screen)
- User dashboard with order history
- Measurement form (waist, hip, pant length, thigh, fit preference)
- Customization page (fabric, color, pocket style, occasion)
- Order summary with price calculation and order confirmation
- Admin panel (view all users, orders, measurements — admin flag in DB)

## Database Schema

- `users` — id, phone, name, is_admin, created_at
- `otp_codes` — id, phone, code, expires_at, created_at
- `measurements` — id, user_id, waist, hip, pant_length, thigh, fit_preference, updated_at
- `orders` — id, user_id, measurement_id, fabric_type, color, pocket_style, occasion, estimated_price, status, created_at

## API Routes

All under `/api`:

- `POST /auth/send-otp` — send OTP (returns devOtp in dev mode)
- `POST /auth/verify-otp` — verify OTP, returns JWT token
- `GET /auth/me` — get current user
- `POST /auth/logout`
- `POST /measurements` — save/update measurements
- `GET /measurements` — get user measurements
- `POST /orders` — create order
- `GET /orders` — list user orders
- `GET /orders/:id` — single order
- `GET /admin/users` — admin: all users
- `GET /admin/orders` — admin: all orders
- `GET /admin/measurements` — admin: all measurements

## Auth

JWT stored in `localStorage` as `customfit_token`. OTP expires in 10 minutes. Dev mode returns OTP in API response.

## Admin Setup

To make a user admin, update the database directly:
```sql
UPDATE users SET is_admin = true WHERE phone = '+1234567890';
```

## Pricing Logic

- Base: Cotton $89, Stretch Cotton $99, Linen $109
- Pocket: Cargo +$15, No Pocket -$5
- Occasion: Formal +$10
- Fit: Slim +$5

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Auth, measurements, orders, admin routes.

### `artifacts/customfit` (`@workspace/customfit`)

React+Vite frontend at `/`. All pages for the complete user journey.

### `lib/db` (`@workspace/db`)

Drizzle ORM with PostgreSQL. Run `pnpm --filter @workspace/db run push` to sync schema.

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec. Run `pnpm --filter @workspace/api-spec run codegen` to regenerate hooks/schemas.
