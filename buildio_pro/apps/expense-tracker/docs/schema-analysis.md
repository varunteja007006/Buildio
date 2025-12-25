# User Schema and Related Schemas

**PostgreSQL** with **Drizzle ORM** and **better-auth**.

## Core Tables

| Table                     | Columns                                                              | Purpose                             |
| ------------------------- | -------------------------------------------------------------------- | ----------------------------------- |
| **user**                  | id, name, email (UNIQUE), emailVerified, image, createdAt, updatedAt | Core identity                       |
| **session**               | id, token (UNIQUE), userId (FK), expiresAt, ipAddress, userAgent     | Token-based sessions                |
| **account**               | id, userId (FK), providerId, password, accessToken, refreshToken     | OAuth + Email/Password              |
| **verification**          | id, identifier, value, expiresAt                                     | Email verification & password reset |
| **userProfile** (1:1)     | id, user_id (UNIQUE FK), name, description, image_url                | Extended profile                    |
| **userPreferences** (1:1) | id, user_id (UNIQUE FK), currency (USD), timezone (UTC)              | Locale settings                     |
| **userSettings** (1:1)    | id, user_id (UNIQUE FK), max_profiles                                | Account limits                      |
| **userBankAccount** (1:M) | id, user_id (FK), bankId (FK), bankAccountTypeId (FK), name          | Linked bank accounts                |

## Financial Records

| Table       | Purpose                                                      |
| ----------- | ------------------------------------------------------------ |
| **expense** | User expenses (userId FK, categoryId FK, amount)             |
| **income**  | User income (userId FK, sourceId FK, amount)                 |
| **budget**  | Time-bound budgets (userId FK, amount, startMonth, endMonth) |

## Key Design Patterns

- **UUID Keys** - All PKs use `crypto.randomUUID()`
- **Cascade Delete** - User deletion removes all related data
- **One-to-One** - Profile/Preferences/Settings enforced via UNIQUE constraints on `user_id`
- **Soft References** - Category/Budget deletion uses `onDelete: "set null"` (preserves expenses)
- **Audit Trail** - All tables have `createdAt` and `updatedAt`
- **Multiple Auth** - Supports OAuth, Email/Password, Email verification

## Schema Relationships

```
user (hub)
├── session (1:M) - Token-based sessions
├── account (1:M) - OAuth/Email auth
├── verification - Email verification tokens
├── userProfile (1:1) - Extended profile
├── userPreferences (1:1) - Currency/Timezone
├── userSettings (1:1) - Account limits
├── userBankAccount (1:M) → banks, bankAccountTypes
├── expense (1:M) → expenseCategory
├── income (1:M) → incomeSource
└── budget (1:M)
```

## Files

- **Auth Schema:** [auth-schema.ts](lib/db/schema/auth-schema.ts)
- **User Extensions:** [user-extended.schema.ts](lib/db/schema/user-extended.schema.ts)
- **Financial:** [expenses.schema.ts](lib/db/schema/expenses.schema.ts), [income.schema.ts](lib/db/schema/income.schema.ts), [budget.schema.ts](lib/db/schema/budget.schema.ts)
- **Auth Config:** [lib/auth.ts](lib/auth.ts)
- **Drizzle Config:** [drizzle.config.ts](drizzle.config.ts)
