
"use client";

import { useState } from "react";
import AccountTypeSelector, {
  type AccountType,
} from "@/components/auth/account-type-selector";
import SignInForm from "@/components/auth/sign-in-form";

export default function SignInPage() {
  const [accountType, setAccountType] = useState<AccountType | null>(null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-4 py-12">
      <div className="w-full max-w-xl rounded-3xl border border-border-custom bg-surface p-6 shadow-sm sm:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-brand-dark">
            Welcome Back
          </h1>

          <p className="mt-2 text-text-secondary">
            Sign in to continue with WedPlan.
          </p>
        </div>

        <h2 className="mb-4 font-semibold text-text-primary">
          Choose Your Account Type
        </h2>

        <AccountTypeSelector
          value={accountType}
          onChange={setAccountType}
        />

        {accountType && <SignInForm accountType={accountType} />}
      </div>
    </main>
  );
}
