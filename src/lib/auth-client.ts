import { createAuthClient } from "better-auth/react";

/**
 * Single Better Auth client for the app.
 *
 * Better Auth reads NEXT_PUBLIC_AUTH_URL automatically when it is set.
 * Until the auth API route is added, `useSession` simply resolves to `null`
 * and the Navbar shows its public state.
 */
export const authClient = createAuthClient();
