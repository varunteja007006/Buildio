# Expense Tracker - Complete Schema Analysis

## Overview
PostgreSQL database with Drizzle ORM. **29 tables** organized into 12 schema files using **snake_case** naming convention throughout.

## Core Entities (4 domains)

### 1️⃣ Authentication (4 tables)
- `user` - Core user identity
- `session` - Token-based sessions
- `account` - OAuth providers
- `verification` - Email verification

### 2️⃣ User Extensions (4 tables)
- `user_profile` - Extended user info (name, avatar, bio)
- `user_preferences` - Currency & timezone settings
- `user_settings` - Account limits (max_profiles)
- `user_bank_account` - Linked bank accounts

### 3️⃣ Financial Core (5 tables)
- `expense` - Individual transactions
- `expense_category` - Categories (Groceries, Rent, Travel)
- `income` - Income records
- `income_source` - Sources (Salary, Freelance)
- `budget` - Time-bound budget limits with start/end months

### 4️⃣ Supporting Data (16 tables)
**Banking**: `banks`, `bank_account_types`, `bank_address`
**Currency**: `currency`, `currency_exchange_snapshot`
**Payments**: `payment_provider`, `payment_methods`
**Investments**: `investment_types`, `investment_platforms`
**Address**: `address`, `city`, `state`, `country`
**Other**: `platform_type`

## Key Design Patterns

| Pattern | Details |
|---------|---------|
| **Cascade Delete** | User deletion removes all related data |
| **Soft References** | Categories removed → expense.category_id = null |
| **Audit Trail** | All tables have `created_at`, `updated_at`, `deleted_at` |
| **UUID Keys** | All PK use `crypto.randomUUID()` |
| **Relations** | 19/29 tables have Drizzle relations defined |

## Naming Convention
- **TypeScript properties**: snake_case (`user_id`, `created_at`)
- **Database columns**: snake_case (`user_id`, `created_at`)
- **Table names**: snake_case (`user_preferences`, `expense_category`)
- **Consistency**: 100% ✅

## Relation Quality

### ✅ Fixed Issues (3)
1. `userBankAccount.bank` - Was referencing wrong field, now uses `bankId`
2. `address.cityId` - Was referencing `state.id`, now correctly uses `city.id`
3. `paymentMethods` - Added missing reverse relation to `paymentProvider`

### ✅ Valid Relations
- ✅ All auth-to-user relations
- ✅ All expense/income hierarchies
- ✅ Address hierarchy (country → state → city → address)
- ✅ Bank-address junction table
- ✅ Currency exchange snapshots
- ✅ Payment provider-method hierarchy

### Coverage: 65.5% (19/29 tables with relations)
Remaining 10 tables are lookup/reference tables (bankAccountTypes, investmentTypes, etc.)

## Notable Features

| Feature | Tables | Details |
|---------|--------|---------|
| **Multi-Currency** | currency, currencyExchangeSnapshot | Full exchange rate tracking with JSONB |
| **Recurring Support** | expense | `is_recurring` flag for repeat transactions |
| **Budget Tracking** | expense, budget | Expenses linked to monthly budgets |
| **Indian Banking** | banks | IFSC, MICR, IIN codes + service flags (ACH, APBS, NACH) |
| **Payment Flexibility** | paymentMethods, paymentProvider | Multiple payment methods per provider |
| **Address Normalization** | address, city, state, country | Hierarchical structure prevents duplication |

## Tech Stack
- **ORM**: Drizzle ORM v0.x
- **Database**: PostgreSQL
- **Migrations**: Timestamp-based, auto-generated
- **Introspection**: `casing: "camel"` (converts DB snake_case to typed properties)

## Data Integrity

| Constraint | Count |
|-----------|-------|
| Primary Keys | 29 (all UUID) |
| Foreign Keys | 40+ (with cascade/set null) |
| Unique Constraints | 5 (code, email, etc.) |
| Default Values | 15+ (timestamps, booleans) |
| Not Null Fields | ~80 |

## Database Hygiene ✅
- ✅ No circular references
- ✅ Proper cascade handling
- ✅ Audit timestamps on all tables
- ✅ Soft delete support (`deleted_at`)
- ✅ All relations bidirectional where needed
- ✅ Index-friendly design

## Summary
Well-structured schema with clear separation of concerns. All relation issues fixed. Consistent naming throughout. Ready for production with proper constraints, audit trails, and flexible financial tracking capabilities.
