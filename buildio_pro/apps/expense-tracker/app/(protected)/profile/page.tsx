import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import UserPreferencesScreen from "@/components/organisms/user-profile/user-preferences";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div>
      <pre>{JSON.stringify(session, null, 4)}</pre>
      <UserPreferencesScreen />
    </div>
  );
}
