# Schema, Router & Validation Analysis

**Stack:** PostgreSQL (Drizzle ORM), tRPC (Routers), Zod (Validation).

## 1. Database Schema (Drizzle)

Schema definitions live in `lib/db/schema/*.schema.ts` and are re-exported from `lib/db/schema/index.ts` (`dbSchema`). All tables use text UUID PKs (`crypto.randomUUID()`) and the `auditTimeFields` (`createdAt`, `updatedAt`, `deletedAt`).

### Core Identity & Auth (`auth-schema.ts`)

| Table            | Key Columns                            | Description                  |
| :--------------- | :------------------------------------- | :--------------------------- |
| **user**         | `id`, `email`, `name`, `emailVerified` | Central identity.            |
| **session**      | `token`, `userId`, `expiresAt`         | Auth sessions.               |
| **account**      | `providerId`, `userId`, `accessToken`  | OAuth accounts.              |
| **verification** | `identifier`, `value`, `expiresAt`     | Email/Password verification. |

### User Extension (`user-extended.schema.ts`)

| Table               | Key Columns                                      | Description                          |
| :------------------ | :----------------------------------------------- | :----------------------------------- |
| **userPreferences** | `user_id`, `currency`, `timezone`                | User settings (1:1, unique user_id). |
| **userProfile**     | `user_id`, `name`, `description`, `image_url`    | Extended profile info (1:1).         |
| **userSettings**    | `user_id`, `max_profiles`                        | System limits (1:1).                 |
| **userBankAccount** | `user_id`, `name`, `bankAccountTypeId`, `bankId` | User's bank accounts.                |

### Financial Domain

| Table               | Key Columns                                                                            | Description                                      |
| :------------------ | :------------------------------------------------------------------------------------- | :----------------------------------------------- |
| **expense**         | `userId`, `expenseAmount`, `categoryId`, `budget`, `isRecurring`, `account`            | Individual expense records.                      |
| **expenseCategory** | `name`, `description`                                                                  | Categories for expenses.                         |
| **income**          | `userId`, `incomeAmount`, `sourceId`, `paymentMethodId`                                | Income records.                                  |
| **incomeSource**    | `name`, `description`                                                                  | Sources of income (e.g. Salary).                 |
| **budget**          | `userId`, `budgetAmount`, `startMonth`, `endMonth`                                     | Time-bound financial goals.                      |
| **event**           | `userId`, `name`, `description`, `estimatedBudget`, `startDate`, `endDate`, `statusId` | Projects with a goal (e.g. "Buying a Property"). |
| **eventStatus**     | `label` (unique), `sortOrder`, `isDefault`                                             | Event status enum (in-progress, completed, …).   |
| **eventExpense**    | `eventId`, `expenseId`                                                                 | Junction table linking expenses to events.       |

### Reference / Metadata

| Table                        | Key Columns                                                           | Description                                 |
| :--------------------------- | :-------------------------------------------------------------------- | :------------------------------------------ |
| **paymentProvider**          | `name`, `description`                                                 | Payment providers (e.g. UPI, Cards).        |
| **paymentMethods**           | `name`, `description`, `paymentProviderId`                            | Payment methods per provider.               |
| **currency**                 | `code`, `symbol`, `symbolNative`, `decimalDigits`, `rounding`         | Currency metadata.                          |
| **currencyExchangeSnapshot** | `currencyId`, `asOf`, `rates` (jsonb), `provider`                     | FX rate snapshots.                          |
| **bankAccountTypes**         | `name` (unique), `description`                                        | Bank account types (SAVINGS, CURRENT, …).   |
| **banks**                    | `name`, `code` (unique), `ifsc`, `micr`, `iin`, service flags, `type` | Bank metadata (IFSC-based).                 |
| **bankAddress**              | `bankId`, `addressId`                                                 | Junction: banks ↔ addresses.                |
| **investmentTypes**          | `name`, `category`, `riskLevel`, `liquidityProfile`                   | Investment type metadata (EQUITY, DEBT, …). |
| **investmentPlatforms**      | `name`, `websiteUrl`, `platformType`, `country`                       | Platforms (Zerodha, Groww, …).              |
| **platformType**             | `name`, `description`                                                 | Platform type enum (App, Website, …).       |
| **country / state / city**   | hierarchical (`countryId`, `stateId`)                                 | Geographic hierarchy.                       |
| **address**                  | `line1-3`, `pinCode`, `latitude`, `longitude`, `cityId`               | Physical addresses.                         |

### Relationships

- **Cascade Delete:** Deleting a `user` removes all related data (expenses, income, budgets, events, preferences, etc.). `bankAddress`, `eventExpense`, and `currencyExchangeSnapshot` cascade from their parent tables.
- **Set Null:** Deleting a `category`, `budget`, `source`, or `paymentMethod` keeps the record but unlinks it.
- **Restrict:** `event.statusId` is `restrict` — an in-use status cannot be deleted.
- **Audit:** All tables track `createdAt` and `updatedAt`; most also have `deletedAt`.

## 2. API Routers (tRPC)

Located in `lib/trpc/routers/*.router.ts`. All procedures are **protected** (require auth, see `lib/trpc/init.ts`).

| Router               | Key Procedures                                                                                                                                                                             | Logic Notes                                                                  |
| :------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| **expense**          | `listExpenses`, `getExpenseById`, `createExpense`, `updateExpense`, `deleteExpense`, `deleteExpenses`, `getAnalytics`                                                                      | Validates amount > 0. List filters by category/budget, sorts by date/amount. |
| **budget**           | `budgetList`, `budgetDetails`, `activeBudgets`, `createBudget`, `updateBudget`, `deleteBudget`                                                                                             | Validates `endMonth > startMonth`.                                           |
| **income**           | `listIncomes`, `getIncomeById`, `createIncome`, `updateIncome`, `deleteIncome`, `deleteIncomes`, `getAnalytics`                                                                            | Links to source + payment method.                                            |
| **expense-category** | `listCategories`, `getCategoryById`, `createCategory`, `updateCategory`, `deleteCategory`                                                                                                  | Prevents deletion of categories in use.                                      |
| **income-source**    | `listSources`, `getSourceById`, `createSource`, `updateSource`, `deleteSource`, `deleteSources`, `getAnalytics`                                                                            | Prevents deletion of sources in use.                                         |
| **event**            | `listStatuses`, `listEvents`, `getEventById`, `getUnlinkedExpenses`, `createEvent`, `updateEvent`, `deleteEvent`, `addExpenseToEvent`, `removeExpenseFromEvent`, `getEventSpendingHistory` | Link/unlink expenses; spending history.                                      |
| **dashboard**        | `overviewSummary`, `activeBudgetsWithProgress`, `recentTransactions`, `topCategoriesThisMonth`, `overBudgetAnalysis`, `budgetVsActualHistory`, `monthlyTrends`, `recurringExpenses`        | Aggregates monthly income/expense totals.                                    |
| **userProfile**      | `getProfile`, `updateProfile`                                                                                                                                                              | Manages extended user details.                                               |
| **userPreferences**  | `getPreferences`, `upsertPreferences`                                                                                                                                                      | Handles currency/timezone settings.                                          |

Pagination helpers (`paginationInputSchema`, `calculatePagination`, `createPaginationMeta`) live in `lib/trpc/schemas/pagination.schema.ts`.

## 3. Validation (Zod)

### Base Schemas (`lib/db/zod-schema`)

- Generated from Drizzle schemas using `drizzle-zod`.
- Exports `createInsertSchema`, `createSelectSchema`, `createUpdateSchema`.
- **Pattern:** `createExpenseSchema` omits `userId` (inferred from session).

### Input Schemas (in Routers)

- **Refinement:** Routers extend base schemas with custom logic.
- **Custom Types:**
  - `expenseAmountSchema` / `incomeAmountSchema`: Handle string/number input, ensure > 0.
  - Date validation: Ensures logical ranges (Start < End).
  - `z.uuid()`: Enforces UUID format for IDs.

## File Structure Map

- **Schema Definitions:** `lib/db/schema/*.schema.ts`
- **Zod Generators:** `lib/db/zod-schema/*.zod.schema.ts`
- **API Routers:** `lib/trpc/routers/*.router.ts`
- **tRPC Context:** `lib/trpc/init.ts`
- **Pagination helpers:** `lib/trpc/schemas/pagination.schema.ts`
