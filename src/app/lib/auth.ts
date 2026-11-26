
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import client from "./db";

/**
 * Better Auth-এর `hooks.before` runtime-এ endpoint context পায়,
 * কিন্তু installed version-এর type-এ path/headers/body/context নেই।
 */
type SignInHookContext = {
  path: string;
  body?: { email?: string };
  headers?: Headers;
  context: {
    internalAdapter: {
      findUserByEmail: (
        email: string,
      ) => Promise<{
        user: { role?: string | null; isBlocked?: boolean | null };
      } | null>;
    };
  };
};

export const auth = betterAuth({
  // ⚠️ baseURL এখানে দেওয়া হয়নি — Better Auth নিজেই BETTER_AUTH_URL
  // env থেকে পড়ে নেবে। .env-এর লাইনটা ঠিক করার পর এটা কাজ করবে।
  database: mongodbAdapter(
    client.db("wedplan_project")
  ),

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "customer",
        // ফর্ম থেকে customer/vendor পাঠানো যাবে, কিন্তু নিচের
        // databaseHook ছাড়া কোনো role সরাসরি DB-তে ঢুকবে না।
        input: true,
      },
      // Admin block/unblock করবে — user নিজে বদলাতে পারবে না।
      isBlocked: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      // Vendor নিজের business name দিতে পারবে।
      businessName: {
        type: "string",
        required: false,
        input: true,
      },
      // Subscription শুধু verified Stripe webhook বদলাবে।
      subscriptionPlan: {
        type: "string",
        required: false,
        defaultValue: "free",
        input: false,
      },
      subscriptionExpiresAt: {
        type: "date",
        required: false,
        input: false,
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // নিরাপত্তা: client যাই পাঠাক, শুধু "customer" বা "vendor" গ্রহণ হবে।
          // কেউ API দিয়ে role: "admin" পাঠালেও সেটা customer হয়ে যাবে।
          const requested = (user as { role?: unknown }).role;
          const role = requested === "vendor" ? "vendor" : "customer";

          return { data: { ...user, role } };
        },
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },

  hooks: {
    before: async (ctx) => {
      // Better Auth-এর runtime context-এ path / headers / body / context থাকে,
      // কিন্তু এই version-এর TypeScript type-এ সেগুলো নেই — তাই cast করা হচ্ছে।
      const context = ctx as unknown as SignInHookContext;

      // শুধু email/password sign-in-এ role যাচাই করি।
      if (context.path !== "/sign-in/email") {
        return;
      }

      // Client যে account type select করেছে সেটা header-এ আসে।
      const expected = context.headers?.get("x-account-type");

      if (
        expected !== "customer" &&
        expected !== "vendor" &&
        expected !== "admin"
      ) {
        throw new APIError("BAD_REQUEST", {
          message: "Please select an account type before signing in.",
        });
      }

      const email = context.body?.email;

      if (!email) {
        return;
      }

      // আসল role সবসময় DB থেকে পড়া হয় — client যা বলেছে তা নয়।
      const found = await context.context.internalAdapter.findUserByEmail(
        email,
      );

      if (!found) {
        // User নেই — Better Auth নিজেই "Invalid email or password" দেবে।
        return;
      }

      // Blocked account কোনো protected feature-এ ঢুকতে পারবে না।
      if (found.user.isBlocked === true) {
        throw new APIError("FORBIDDEN", {
          message:
            "This account has been blocked. Please contact the WedPlan administrator.",
        });
      }

      const actual = found.user.role;

      if (actual === expected) {
        return;
      }

      if (actual === "admin") {
        throw new APIError("FORBIDDEN", {
          message:
            "This is an Admin account. Please choose the Admin login option.",
        });
      }

      if (expected === "admin") {
        throw new APIError("FORBIDDEN", {
          message: "Only Admin accounts can use the Admin login option.",
        });
      }

      const label = actual === "vendor" ? "Vendor" : "Customer";

      throw new APIError("FORBIDDEN", {
        message: `This account is registered as a ${label}. Please choose the ${label} option.`,
      });
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },

    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },

  // Next.js-এ cookie ঠিকভাবে set/read করার জন্য।
  // Better Auth-এর নিয়ম: plugins array-এর সবার শেষে থাকতে হবে।
  plugins: [nextCookies()],
});
