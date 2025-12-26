# Schema, Router & Validation Analysis

**Stack:** PostgreSQL (Drizzle ORM), tRPC (Routers), Zod (Validation).

## 1. Database Schema (Drizzle)

### Core Identity & Auth
| Table | Key Columns | Description |
| :--- | :--- | :--- |
| **user** | `id`, `email`, `name` | Central identity. |
| **session** | `token`, `userId`, `expiresAt` | Auth sessions. |
| **account** | `providerId`, `accessToken` | OAuth accounts. |
| **verification** | `identifier`, `value` | Email/Password verification. |
| **userProfile** | `userId`, `name`, `image_url` | Extended profile info (1:1). |
| **userPreferences** | `userId`, `currency`, `timezone` | User settings (1:1). |
| **userSettings** | `userId`, `max_profiles` | System limits (1:1). |

### Financial Domain
| Table | Key Columns | Description |
| :--- | :--- | :--- |
| **expense** | `userId`, `amount`, `categoryId`, `budget`, `isRecurring` | Individual expense records. |
| **expenseCategory** | `name`, `description` | Categories for expenses. |
| **income** | `userId`, `amount`, `sourceId`, `paymentMethodId` | Income records. |
| **incomeSource** | `name`, `description` | Sources of income (e.g. Salary). |
| **budget** | `userId`, `amount`, `startMonth`, `endMonth` | Time-bound financial goals. |

### Relationships
- **Cascade Delete:** Deleting a `user` removes all related data.
- **Set Null:** Deleting a `category` or `budget` keeps the expense but unlinks it.
- **Audit:** All tables track `createdAt` and `updatedAt`.

## 2. API Routers (tRPC)

Located in `lib/trpc/routers`. All procedures are **protected** (require auth).

| Router | Key Procedures | Logic Notes |
| :--- | :--- | :--- |
| **expense** | `list`, `create`, `update`, `delete` | Validates amount > 0. Filters by category/budget. |
| **budget** | `list`, `create`, `update` | Validates `endMonth > startMonth`. Active budget filtering. |
| **income** | `list`, `create`, `update` | Similar to expense. Links to payment methods. |
| **dashboard** | `overviewSummary` | Aggregates monthly income/expense totals. |
| **userProfile** | `get`, `update` | Manages extended user details. |
| **userPreferences** | `get`, `update` | Handles currency/timezone settings. |

## 3. Validation (Zod)

### Base Schemas (`lib/db/zod-schema`)
- Generated from Drizzle schemas using `drizzle-zod`.
- Exports `createInsertSchema`, `createSelectSchema`, `createUpdateSchema`.
- **Pattern:** `createExpenseSchema` omits `userId` (inferred from session).

### Input Schemas (in Routers)
- **Refinement:** Routers extend base schemas with custom logic.
- **Custom Types:**
  - `expenseAmountSchema`: Handles string/number input, ensures > 0.
  - Date validation: Ensures logical ranges (Start < End).
  - `uuid`: Enforces UUID format for IDs.

## File Structure Map

- **Schema Definitions:** `lib/db/schema/*.schema.ts`
- **Zod Generators:** `lib/db/zod-schema/*.zod.schema.ts`
- **API Routers:** `lib/trpc/routers/*.router.ts`
- **tRPC Context:** `lib/trpc/init.ts`
