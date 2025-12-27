# Router Pagination Analysis

This document analyzes all tRPC routers with listing/pagination endpoints to plan standardization.

## Target Pagination Structure

Based on `router.md`, all listing endpoints should follow this structure:

### Input (Client → Server)

| Parameter | Type     | Description                   | Default |
| --------- | -------- | ----------------------------- | ------- |
| `page`    | `number` | Current page number (1-based) | `1`     |
| `limit`   | `number` | Number of items per page      | `10`    |

### Output (Server → Client)

```typescript
{
  data: T[],
  meta: {
    limit: number,
    currentPage: number,
    offset: number,        // Server-calculated: (page - 1) * limit
    totalItems: number,
    totalPages: number,    // Server-calculated: Math.ceil(totalItems / limit)
    hasNextPage: boolean,  // Server-calculated: page < totalPages
    hasPrevPage: boolean,  // Server-calculated: page > 1
  }
}
```

---

## Routers Analysis

### ✅ Already Updated

| Router File                  | Procedure      | Status |
| ---------------------------- | -------------- | ------ |
| `income-source.router.ts`    | `listSources`  | ✅ Done |

---

### ❌ Needs Update

#### 1. `expense.router.ts` → `listExpenses`

**File:** `lib/trpc/routers/expense.router.ts`

**Current Input Schema:**
```typescript
const listExpensesInput = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),        // ❌ Should be `page`
  categoryId: z.string().uuid().optional(),
  budgetId: z.string().uuid().optional(),
  sortBy: z.enum(["date", "amount"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
```

**Current Meta Response:**
```typescript
meta: {
  limit,
  offset,                                            // ❌ Old structure
  totalItems: Number(total?.count ?? 0),
  hasMore: offset + limit < Number(total?.count ?? 0), // ❌ Should be hasNextPage/hasPrevPage
}
```

**Frontend Consumers:**
- Hook: `hooks/use-expense-queries.ts`
- Component: `components/organisms/expense/expense-list-component.tsx`

---

#### 2. `income.router.ts` → `listIncomes`

**File:** `lib/trpc/routers/income.router.ts`

**Current Input Schema:**
```typescript
const listIncomesInput = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),        // ❌ Should be `page`
  sourceId: z.string().uuid().optional(),
  sortBy: z.enum(["date", "amount"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
```

**Current Meta Response:**
```typescript
meta: {
  limit,
  offset,                                            // ❌ Old structure
  totalItems: Number(total?.count ?? 0),
  hasMore: offset + limit < Number(total?.count ?? 0), // ❌ Should be hasNextPage/hasPrevPage
}
```

**Frontend Consumers:**
- Hook: `hooks/use-income-queries.ts`
- Component: `components/organisms/income/income-list-component.tsx`

---

#### 3. `budget.router.ts` → `budgetList`

**File:** `lib/trpc/routers/budget.router.ts`

**Current Input Schema:**
```typescript
const listBudgetInput = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),        // ❌ Should be `page`
  onlyActive: z.boolean().default(false),
});
```

**Current Meta Response:**
```typescript
meta: {
  limit,
  offset,                                            // ❌ Old structure
  totalItems: Number(total?.count ?? 0),
  isActiveFilterApplied: onlyActive,                 // ✅ Keep this (extra filter info)
  // ❌ Missing: currentPage, totalPages, hasNextPage, hasPrevPage
}
```

**Frontend Consumers:**
- Hook: `hooks/use-budget-queries.ts`
- Component: Likely in `components/organisms/budget/`

---

#### 4. `event.router.ts` → `listEvents`

**File:** `lib/trpc/routers/event.router.ts`

**Current Input Schema:**
```typescript
const listEventsInput = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),        // ❌ Should be `page`
  statusId: z.string().uuid().optional(),
});
```

**Current Meta Response:**
```typescript
meta: {
  limit,
  offset,                                            // ❌ Old structure
  totalItems: Number(total?.count ?? 0),
  hasMore: offset + limit < Number(total?.count ?? 0), // ❌ Should be hasNextPage/hasPrevPage
}
```

**Frontend Consumers:**
- Component: `components/organisms/event/event-list-component.tsx`

---

#### 5. `expense-category.router.ts` → `listCategories`

**File:** `lib/trpc/routers/expense-category.router.ts`

**Current Input Schema:**
```typescript
const listCategoriesInput = z.object({
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),        // ❌ Should be `page`
});
```

**Current Meta Response:**
```typescript
meta: {
  limit,
  offset,                                            // ❌ Old structure
  totalItems: Number(total?.count ?? 0),
  hasMore: offset + limit < Number(total?.count ?? 0), // ❌ Should be hasNextPage/hasPrevPage
}
```

**Frontend Consumers:**
- Hook: `hooks/use-category-source-queries.ts`
- Component: `components/organisms/expense-category/expense-category-list-component.tsx`

---

## Summary Table

| Router File                   | Procedure        | Input Uses `page`? | Has `totalPages`? | Has `hasNextPage`? | Status     |
| ----------------------------- | ---------------- | ------------------ | ----------------- | ------------------ | ---------- |
| `income-source.router.ts`     | `listSources`    | ✅ Yes             | ✅ Yes            | ✅ Yes             | ✅ Updated |
| `expense.router.ts`           | `listExpenses`   | ❌ No (`offset`)   | ❌ No             | ❌ No (`hasMore`)  | ❌ Pending |
| `income.router.ts`            | `listIncomes`    | ❌ No (`offset`)   | ❌ No             | ❌ No (`hasMore`)  | ❌ Pending |
| `budget.router.ts`            | `budgetList`     | ❌ No (`offset`)   | ❌ No             | ❌ No              | ❌ Pending |
| `event.router.ts`             | `listEvents`     | ❌ No (`offset`)   | ❌ No             | ❌ No (`hasMore`)  | ❌ Pending |
| `expense-category.router.ts`  | `listCategories` | ❌ No (`offset`)   | ❌ No             | ❌ No (`hasMore`)  | ❌ Pending |

---

## Migration Checklist

For each router, the following changes are needed:

### Backend (Router)

- [ ] Change input schema: `offset` → `page` (min: 1, default: 1)
- [ ] Add server-side calculation: `const offset = (page - 1) * limit`
- [ ] Add server-side calculation: `const totalPages = Math.ceil(totalItems / limit)`
- [ ] Update meta response with new structure
- [ ] Remove `hasMore`, add `hasNextPage` and `hasPrevPage`

### Frontend (Hooks)

- [ ] Update hook params: `offset` → `page`
- [ ] Update hook call to pass `page` instead of `offset`

### Frontend (Components)

- [ ] Update URL query state: default to `1` instead of `0`
- [ ] Remove offset calculation logic
- [ ] Use `meta.totalPages` directly instead of calculating

---

## Priority Order

1. **`expense.router.ts`** - Most used, high traffic
2. **`income.router.ts`** - Second most used
3. **`budget.router.ts`** - Medium usage
4. **`event.router.ts`** - Medium usage
5. **`expense-category.router.ts`** - Lower usage (mostly for dropdowns)

---

## Notes

- The `income-source.router.ts` → `listSources` has been updated as the reference implementation
- Some routers have additional filter parameters (e.g., `categoryId`, `sortBy`) - these should be preserved
- The `budget.router.ts` has an extra `isActiveFilterApplied` in meta - this pattern can be kept for filter-specific info
