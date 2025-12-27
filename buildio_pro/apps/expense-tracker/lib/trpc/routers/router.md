# Notes

## Structure of pagination functions:

This is the pagination structure that will be followed. Links object can be optional depending on how the
UI logic is going to be implemented.

### Input Parameters (from client):

| Parameter | Type     | Description                   | Default |
| --------- | -------- | ----------------------------- | ------- |
| `page`    | `number` | Current page number (1-based) | `1`     |
| `limit`   | `number` | Number of items per page      | `10`    |
| `sortBy`  | `array`  | Sort configuration            | `[]`    |
| `search`  | `string` | Search query                  | `""`    |
| `filter`  | `object` | Filter criteria               | `{}`    |

### Server-side Calculations:

The backend calculates the following values so the frontend doesn't have to:

```ts
// Server calculates these from input
const offset = (page - 1) * limit; // e.g., page=2, limit=5 → offset=5
const totalPages = Math.ceil(totalItems / limit); // e.g., 12 items, limit=5 → 3 pages
```

### Response Structure:

```js
{
  "data": [
    {
      "id": 4,
      "name": "George",
      "color": "white",
      "age": 3
    },
    {
      "id": 5,
      "name": "Leche",
      "color": "white",
      "age": 6
    },
    {
      "id": 2,
      "name": "Garfield",
      "color": "ginger",
      "age": 4
    },
    {
      "id": 1,
      "name": "Milo",
      "color": "brown",
      "age": 5
    },
    {
      "id": 3,
      "name": "Kitty",
      "color": "black",
      "age": 3
    }
  ],
  "meta": {
    "limit": 5,              // items per page (usually 10, 20, 50, 100)
    "offset": 5,             // calculated: (page - 1) * limit
    "totalItems": 12,        // total count from DB
    "currentPage": 2,        // from input (1-based)
    "totalPages": 3,         // calculated: Math.ceil(totalItems / limit)
    "hasNextPage": true,     // calculated: currentPage < totalPages
    "hasPrevPage": true,     // calculated: currentPage > 1
    "sortBy": [["color", "DESC"]],
    "search": "i",
    "filter": {
      "age": "$gte:3"
    }
  },
  "links": {
    "first": "http://localhost:3000/cats?limit=5&page=1&sortBy=color:DESC&search=i&filter.age=$gte:3",
    "previous": "http://localhost:3000/cats?limit=5&page=1&sortBy=color:DESC&search=i&filter.age=$gte:3",
    "current": "http://localhost:3000/cats?limit=5&page=2&sortBy=color:DESC&search=i&filter.age=$gte:3",
    "next": "http://localhost:3000/cats?limit=5&page=3&sortBy=color:DESC&search=i&filter.age=$gte:3",
    "last": "http://localhost:3000/cats?limit=5&page=3&sortBy=color:DESC&search=i&filter.age=$gte:3"
  }
}
```

### Benefits of Server-side Calculation:

1. **Single source of truth** - Pagination logic lives in one place
2. **Simpler frontend code** - No need to calculate `offset` or `totalPages` on client
3. **Consistency** - All clients (web, mobile, etc.) get the same calculated values
4. **Reduced errors** - Avoids off-by-one errors from inconsistent page indexing
