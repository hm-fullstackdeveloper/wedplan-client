
"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { AccountType } from "./account-type-selector";

interface SignInFormProps {
  accountType: AccountType;
}

export default function SignInForm({ accountType }: SignInFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign In Form Submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("========== SIGN IN STARTED ==========");

    console.log("Selected Account Type:", accountType);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const email = formData.get("email");
    const password = formData.get("password");

    console.log("Sign In Form Data:", {
      email,
      accountType,
      rememberMe,
    });

    if (!email || !password) {
      console.error("Sign In Failed: Email or Password Missing");
      return;
    }

    console.log("Form Validation Successful");
    console.log("Sign In Form Submitted Successfully");
    console.log("========== SIGN IN COMPLETED ==========");
  };

  return (
    <div className="mt-8">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-text-primary">
          {accountType === "vendor" ? "Vendor" : "Customer"} Sign In
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

        {/* Sign In Button */}
        <button
          type="submit"
          className="w-full rounded-xl bg-brand px-5 py-3 font-semibold text-white transition hover:bg-brand-dark"
        >
          Sign In
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
        {/* Google */}
        <button
          type="button"
          disabled
          title="Google authentication will be connected later"
          className="flex items-center justify-center gap-2 rounded-xl border border-border-custom py-3 font-medium text-text-primary opacity-60"
        >
          <span className="text-lg font-bold text-blue-600">G</span>
          Google
        </button>

        {/* GitHub */}
        <button
          type="button"
          disabled
          title="GitHub authentication will be connected later"
          className="flex items-center justify-center gap-2 rounded-xl border border-border-custom py-3 font-medium text-text-primary opacity-60"
        >
          <span className="text-lg font-bold">GH</span>
          GitHub
        </button>
      </div>
    </div>
  );
}
