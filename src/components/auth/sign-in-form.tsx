
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import type { AccountType } from "./account-type-selector";
import { authClient } from "@/app/lib/auth-client";
import { dashboardPath } from "@/lib/roles";
import SocialLoginButtons from "@/components/auth/social-login-buttons";

const TITLES: Record<AccountType, string> = {
  customer: "Customer",
  vendor: "Vendor",
  admin: "Admin",
};

interface SignInFormProps {
  accountType: AccountType;
}

export default function SignInForm({ accountType }: SignInFormProps) {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sign In Form Submit

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  setError("");

  const formData = new FormData(e.currentTarget);

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    setLoading(true);

    const { data, error: signInError } = await authClient.signIn.email(
      {
        email,
        password,
        rememberMe,
      },
      {
        headers: {
          // Server এই header দেখে DB-র role-এর সাথে মিলিয়ে নেবে।
          "x-account-type": accountType,
        },
      },
    );

    if (signInError) {
      console.error("Sign In Error:", signInError);
      setError(signInError.message || "Invalid email or password!");
      return;
    }

    // Redirect role সবসময় server-এর response থেকে আসে — client state নয়।
    const verifiedRole = (data?.user as { role?: string | null } | undefined)
      ?.role;

    router.push(dashboardPath(verifiedRole));
    router.refresh();

  } catch (error) {
    console.error("Sign In Error:", error);
    setError("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="mt-8">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-text-primary">
          {TITLES[accountType]} Sign In
        </h2>

        <p className="mt-1 text-sm text-text-secondary">
          Enter your account details to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">
            Email Address
          </label>

          <input
            name="email"
            type="email"
            placeholder="Enter your email"
            required
            autoComplete="email"
            className="w-full rounded-xl border border-border-custom bg-surface px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>

        {/* Password */}
        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">
            Password
          </label>

          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-border-custom bg-surface px-4 py-3 pr-12 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="size-4 accent-brand"
            />

            Remember me
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand px-5 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-border-custom" />

        <span className="text-sm text-text-muted">
          Or continue with
        </span>

        <div className="h-px flex-1 bg-border-custom" />
      </div>

      {/* Social Login */}
      <div className="grid grid-cols-2 gap-4">
      <SocialLoginButtons accountType={accountType} />
      </div> 
    </div>
  );
}
