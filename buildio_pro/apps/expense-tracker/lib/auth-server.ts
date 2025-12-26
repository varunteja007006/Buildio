import "server-only";

import { cache } from "react";

import { headers } from "next/headers";

import { auth } from "./auth";

export const getAuthSession = cache(async () => {
  const session = await auth.api.getSession({
     headers: await headers(),
  });
  return session;
});
