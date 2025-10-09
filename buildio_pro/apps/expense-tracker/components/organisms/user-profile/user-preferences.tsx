"use client";

import { Spinner } from "@/components/atoms/loader";
import { useGetUserPreference } from "@/lib/queries/user-details";

export default function UserPreferencesScreen() {
  const { data, isLoading, isError } = useGetUserPreference();

  if (isError) {
    return <>Error....</>;
  }

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
