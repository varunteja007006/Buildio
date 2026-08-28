# Auth protection (expense-tracker)

Uses better-auth. Client instance: `@/lib/auth-client`, server instance: `@/lib/auth` (see https://www.better-auth.com/docs/integrations/next).

This app does **not** use a Next.js middleware/proxy for auth. Instead, protection is done with route groups + a client-side session check:

- `app/(protected)/` — guarded routes. Its `layout.tsx` wraps every page in `<Protected>`.
- `app/(unprotected)/` — public routes (login, demo, etc.).

```tsx
// app/(protected)/protected.tsx
"use client";
import { GoofyLoader } from "@/components/atoms/loaders/goofy";
import Unauthorized from "@/components/organisms/auth/unauthorized";
import { useSession } from "@/lib/auth-client";

export const Protected = ({ children }: { children: React.ReactNode }) => {
  const { data, isPending } = useSession();

  if (isPending) return <GoofyLoader />;
  if (data?.user) return <>{children}</>;
  return <Unauthorized />;
};
```

### tRPC

Backend procedures are always protected via `protectedProcedure` in `lib/trpc/init.ts`, which resolves the session server-side — so API access is enforced regardless of the UI wrapper.

If you ever need server-side redirects instead of the optimistic UI check, add a `proxy.ts`/`middleware.ts`:

```ts
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: ["/dashboard"],
};
```
