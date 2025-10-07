import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({});

export const useSession = authClient.useSession;

export const getSession = authClient.getSession; // fetch call, can be used with Tanstack Query as well
