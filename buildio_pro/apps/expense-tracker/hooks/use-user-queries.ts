"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc-client";
import { toast } from "sonner";

// Query keys for user preferences
const userPreferencesKeys = {
  all: ["userPreferences"] as const,
  preferences: () => [...userPreferencesKeys.all, "preferences"] as const,
};

// Query keys for user profile
const userProfileKeys = {
  all: ["userProfile"] as const,
  profile: () => [...userProfileKeys.all, "profile"] as const,
};

// Get user preferences
export function useUserPreferencesQuery() {
  const trpc = useTRPC();
  return useQuery(trpc.userPreferences.getPreferences.queryOptions());
}

// Update user preferences
export function useUpdateUserPreferences(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.userPreferences.updatePreferences.mutationOptions({
      onSuccess: () => {
        toast.success("Preferences updated successfully!");
        queryClient.invalidateQueries({
          queryKey: userPreferencesKeys.all,
        });
        options?.onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to update preferences");
        options?.onError?.(error);
      },
    }),
  );
}

// Get user profile
export function useUserProfileQuery() {
  const trpc = useTRPC();
  return useQuery(trpc.userProfile.getProfile.queryOptions());
}

// Update user profile
export function useUpdateUserProfile(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.userProfile.updateProfile.mutationOptions({
      onSuccess: () => {
        toast.success("Profile updated successfully!");
        queryClient.invalidateQueries({
          queryKey: userProfileKeys.all,
        });
        options?.onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to update profile");
        options?.onError?.(error);
      },
    }),
  );
}
