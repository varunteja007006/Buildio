import { Metadata } from "next";
import { Separator } from "@workspace/ui/components/separator";

import {
  UserPreferencesFormComponent,
  UserProfileFormComponent,
} from "@/components/organisms/user";

import { appConfig } from "@/app/appConfig";

export const metadata: Metadata = {
  title: `Settings | ${appConfig.name}`,
  description: "Manage your account settings and preferences",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
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
