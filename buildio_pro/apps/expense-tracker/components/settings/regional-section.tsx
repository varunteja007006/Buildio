import React from "react";

import { UserPreferencesFormComponent } from "../organisms/user";
import { MainCard } from "./main-card";

export default function RegionalSettings() {
  return (
    <MainCard description="Manage your currency and timezone preferences">
      <UserPreferencesFormComponent />
    </MainCard>
  );
}
