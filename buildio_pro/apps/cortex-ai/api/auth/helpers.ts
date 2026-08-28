import type { User } from "./types";

/** Get the user's display name, falling back to email */
export function getDisplayName(user: Pick<User, "name" | "email">): string {
  return user.name || user.email;
}

/** Extract initials from a user's name (max 2 characters) */
export function getUserInitials(user: Pick<User, "name" | "email">): string {
  if (user.name) {
    const parts = user.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0]?.toUpperCase() ?? "?";
  }
  return user.email[0]?.toUpperCase() ?? "?";
}

/** Check if a session is expired */
export function isSessionExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}

/** Auth route paths */
export const AUTH_ROUTES = {
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  SIGN_OUT: "/sign-out",
  RESET_PASSWORD: "/reset-password",
} as const;

/** Routes that are protected behind authentication */
export const PROTECTED_ROUTES = ["/dashboard", "/chat"] as const;
