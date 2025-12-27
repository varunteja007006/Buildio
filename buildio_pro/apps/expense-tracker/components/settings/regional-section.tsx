import React from "react";

import { MainCard } from "./main-card";

import { UserPreferencesFormComponent } from "../organisms/user";

export default function RegionalSettings() {
  return (
    <MainCard description="Manage your currency and timezone preferences">
      <UserPreferencesFormComponent />
    </MainCard>
  );
}
