import { user, session, account, verification } from "./auth-schema";

import { userPreferences, userProfileRelations } from "./user-extended.schema";

export const dbSchema = {
	user,
	session,
	account,
	verification,
	userPreferences,
	userProfileRelations,
};
