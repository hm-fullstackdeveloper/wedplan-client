
"use client";

import { ShieldCheck, UserRound, Store } from "lucide-react";

export type AccountType = "customer" | "vendor" | "admin";

interface AccountTypeSelectorProps {
  value: AccountType | null;
  onChange: (value: AccountType) => void;
  /** Admin login option শুধু Sign In-এ দেখাবে — Sign Up-এ নয়। */
  includeAdmin?: boolean;
}

export default function AccountTypeSelector({
  value,
  onChange,
  includeAdmin = false,
}: AccountTypeSelectorProps) {
  const accountTypes = [
    {
      value: "customer" as const,
      title: "Customer",
      description: "Find and book wedding services",
      icon: UserRound,
    },
    {
      value: "vendor" as const,
      title: "Vendor",
      description: "Manage and offer your services",
      icon: Store,
    },
    ...(includeAdmin
      ? [
          {
            value: "admin" as const,
            title: "Admin",
            description: "Manage the WedPlan platform",
            icon: ShieldCheck,
          },
        ]
      : []),
  ];

  return (
    <div
      className={
        includeAdmin
          ? "grid grid-cols-1 gap-4 sm:grid-cols-3"
          : "grid grid-cols-1 gap-4 sm:grid-cols-2"
      }
    >
      {accountTypes.map((account) => {
        const Icon = account.icon;
        const isSelected = value === account.value;

        return (
          <button
            key={account.value}
            type="button"
            onClick={() => onChange(account.value)}
            className={`rounded-2xl border p-5 text-left transition-all duration-200 ${
              isSelected
                ? "border-brand bg-brand-light ring-2 ring-brand/20"
                : "border-border-custom bg-surface hover:border-brand"
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-brand-light p-3 text-brand">
                <Icon size={25} />
              </div>

              <div
                className={`flex size-5 items-center justify-center rounded-full border ${
                  isSelected
                    ? "border-brand bg-brand"
                    : "border-text-muted"
                }`}
              >
                {isSelected && (
                  <span className="size-2 rounded-full bg-white" />
                )}
              </div>
            </div>

            <h3 className="font-semibold text-text-primary">
              {account.title}
            </h3>

            <p className="mt-1 text-sm text-text-secondary">
              {account.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
