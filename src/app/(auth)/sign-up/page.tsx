
"use client";

import { useState } from "react";
import Link from "next/link";
import AccountTypeSelector, {
  type AccountType,
} from "@/components/auth/account-type-selector";
import SignUpForm from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  const [accountType, setAccountType] = useState<AccountType | null>(null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-4 py-12">
      <div className="w-full max-w-xl rounded-3xl border border-border-custom bg-surface p-6 shadow-sm sm:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-brand-dark">
            Welcome to WedPlan
          </h1>

          <p className="mt-2 text-text-secondary">
            Create your account and start your journey.
          </p>
        </div>

        <h2 className="mb-4 font-semibold text-text-primary">
          Choose Your Account Type
        </h2>

        <AccountTypeSelector
          value={accountType}
          onChange={setAccountType}
        />

        {accountType && <SignUpForm accountType={accountType} />}

        <p className="mt-8 text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-brand hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}
