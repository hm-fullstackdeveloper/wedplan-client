import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth";

export const authClient = createAuthClient({
  // baseURL ইচ্ছাকৃতভাবে দেওয়া হয়নি — Better Auth নিজেই current
  // origin ব্যবহার করবে, তাই localhost/production দুটোতেই কাজ করবে।
  plugins: [
    inferAdditionalFields<typeof auth>(),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;