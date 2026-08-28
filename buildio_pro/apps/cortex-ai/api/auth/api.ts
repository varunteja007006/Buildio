import { authClient } from "@/lib/auth-client";
import type { SignInInput, SignUpInput, SessionResponse, User } from "./types";

/** Sign in with email + password. Returns user data; session is set via cookie. */
export async function signIn(input: SignInInput): Promise<SessionResponse> {
  const { data, error } = await authClient.signIn.email(input);
  if (error) throw new Error(error.message ?? error.statusText);
  if (!data?.user) throw new Error("Sign in failed: no user returned");

  // The session is set via cookie; fetch it to get the full SessionResponse
  const sessionResult = await authClient.getSession();
  if (sessionResult.error) throw new Error(sessionResult.error.message ?? sessionResult.error.statusText);
  if (!sessionResult.data) throw new Error("Sign in failed: no session created");

  return sessionResult.data as unknown as SessionResponse;
}

/** Sign up a new user. Returns user data; session is set via cookie. */
export async function signUp(input: SignUpInput): Promise<SessionResponse> {
  const { data, error } = await authClient.signUp.email(input);
  if (error) throw new Error(error.message ?? error.statusText);
  if (!data?.user) throw new Error("Sign up failed: no user returned");

  // The session is set via cookie; fetch it to get the full SessionResponse
  const sessionResult = await authClient.getSession();
  if (sessionResult.error) throw new Error(sessionResult.error.message ?? sessionResult.error.statusText);
  if (!sessionResult.data) throw new Error("Sign up failed: no session created");

  return sessionResult.data as unknown as SessionResponse;
}

/** Sign out the current session */
export async function signOut(): Promise<void> {
  const { error } = await authClient.signOut();
  if (error) throw new Error(error.message ?? error.statusText);
}

/** Get the current session and user */
export async function getSession(): Promise<SessionResponse | null> {
  const { data } = await authClient.getSession();
  return (data as unknown as SessionResponse) ?? null;
}

/** Get the current user profile */
export async function getUser(): Promise<User | null> {
  const { data } = await authClient.getSession();
  return (data?.user as unknown as User | null) ?? null;
}

/** Update user profile */
export async function updateUser(
  input: Partial<Pick<User, "name" | "image">>
): Promise<void> {
  const { error } = await authClient.updateUser(input);
  if (error) throw new Error(error.message ?? error.statusText);
}
