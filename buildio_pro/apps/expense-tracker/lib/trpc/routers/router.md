# Notes

## Pagination structure

All list procedures (`listExpenses`, `listIncomes`, `budgetList`, `listEvents`, `listCategories`, `listSources`) share a common pagination shape defined in `lib/trpc/schemas/pagination.schema.ts`.

### Input Parameters (from client):

| Parameter | Type     | Description                   | Default |
| --------- | -------- | ----------------------------- | ------- |
| `page`    | `number` | Current page number (1-based) | `1`     |
| `limit`   | `number` | Items per page (max 100)      | `10`    |

Routers may extend the base schema with extra filters/sorting, e.g. `listExpenses` adds `categoryId`, `budgetId`, and `sortBy`/`sortOrder` (`"date" | "amount"` × `"asc" | "desc"`).

### Server-side Calculations:

```ts
// lib/trpc/schemas/pagination.schema.ts
const offset = (page - 1) * limit; // e.g., page=2, limit=5 → offset=5
const totalPages = Math.ceil(totalItems / limit); // e.g., 12 items, limit=5 → 3 pages
```

### Response Structure:

```js
{
  "data": [ ... ],      // paginated rows (with relations already loaded)
  "meta": {
    "limit": 5,              // items per page
    "offset": 5,             // calculated: (page - 1) * limit
    "totalItems": 12,        // total count from DB
    "currentPage": 2,        // from input (1-based)
    "totalPages": 3,         // calculated: Math.ceil(totalItems / limit)
    "hasNextPage": true,     // calculated: currentPage < totalPages
    "hasPrevPage": true      // calculated: currentPage > 1
  }
}
```

### Benefits of Server-side Calculation:

1. **Single source of truth** - Pagination logic lives in one place
2. **Simpler frontend code** - No need to calculate `offset` or `totalPages` on client
3. **Consistency** - All clients (web, mobile, etc.) get the same calculated values
4. **Reduced errors** - Avoids off-by-one errors from inconsistent page indexing
