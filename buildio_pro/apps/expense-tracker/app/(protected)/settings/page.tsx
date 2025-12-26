import { Metadata } from "next";
import { Separator } from "@workspace/ui/components/separator";

import {
  UserPreferencesFormComponent,
  UserProfileFormComponent,
} from "@/components/organisms/user";

export const metadata: Metadata = {
  title: "Settings | Expense Tracker",
  description: "Manage your account settings and preferences",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="space-y-8">
        {/* Profile Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Account Profile</h2>
            <p className="text-sm text-muted-foreground">
              Update your profile information and avatar
            </p>
          </div>
          <UserProfileFormComponent />
        </div>


        {/* Preferences Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Regional Settings</h2>
            <p className="text-sm text-muted-foreground">
              Manage your currency and timezone preferences
            </p>
          </div>
          <UserPreferencesFormComponent />
        </div>
      </div>
    </div>
  );
}
