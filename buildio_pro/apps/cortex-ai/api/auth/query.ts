"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { signIn, signUp, signOut, getSession, getUser, updateUser } from "./api";
import type { SignInInput, SignUpInput, SessionResponse, User } from "./types";

/** Query key factory for auth domain */
export const authKeys = {
  session: ["auth", "session"] as const,
  user: ["auth", "user"] as const,
};

/** Get the current session and user */
export function useSession() {
  return useQuery<SessionResponse | null>({
    queryKey: authKeys.session,
    queryFn: getSession,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/** Get the current user profile */
export function useCurrentUser() {
  return useQuery<User | null>({
    queryKey: authKeys.user,
    queryFn: getUser,
    staleTime: 5 * 60 * 1000,
  });
}

/** Sign in mutation */
export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation<SessionResponse, Error, SignInInput>({
    mutationFn: signIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session });
      queryClient.invalidateQueries({ queryKey: authKeys.user });
    },
  });
}

/** Sign up mutation */
export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation<SessionResponse, Error, SignUpInput>({
    mutationFn: signUp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session });
      queryClient.invalidateQueries({ queryKey: authKeys.user });
    },
  });
}

/** Sign out mutation */
export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.session, null);
      queryClient.setQueryData(authKeys.user, null);
    },
  });
}

/** Update user profile mutation */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, Partial<Pick<User, "name" | "image">>>({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user });
    },
  });
}
