import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/** Returns the currently authenticated user, or null when not signed in. */
export async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}