import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";

import { Metadata } from "next";

import { appConfig } from "@/app/appConfig";

import ProfileSection from "@/components/settings/profile-section";
import RegionalSettings from "@/components/settings/regional-section";

export const metadata: Metadata = {
  title: `Settings | ${appConfig.name}`,
  description: "Manage your account settings and preferences",
};

export default function SettingsPage() {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="regional">Regional</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <ProfileSection />
      </TabsContent>
      <TabsContent value="regional">
        <RegionalSettings />
      </TabsContent>
    </Tabs>
  );
}
