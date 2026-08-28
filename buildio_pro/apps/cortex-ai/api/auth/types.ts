/** Authenticated user */
export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null | undefined;
  createdAt: string | Date;
  updatedAt: string | Date;
};

/** Active session */
export type Session = {
  id: string;
  userId: string;
  token: string;
  expiresAt: string | Date;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

/** Sign-in credentials */
export type SignInInput = {
  email: string;
  password: string;
};

/** Sign-up credentials */
export type SignUpInput = {
  name: string;
  email: string;
  password: string;
};

/** Session response from the server */
export type SessionResponse = {
  user: User;
  session: Session;
};
