"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  CalendarCheck,
  CreditCard,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Receipt,
  ShieldCheck,
  Store,
  UserRound,
  Users,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/format";
import type { AppRole } from "@/lib/roles";

export type DashboardUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  businessName?: string | null;
  subscriptionPlan?: string | null;
};

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const NAV: Record<AppRole, NavItem[]> = {
  customer: [
    { label: "Overview", href: "/customer/dashboard", icon: LayoutDashboard },
    { label: "My Bookings", href: "/customer/bookings", icon: CalendarCheck },
    { label: "Profile Settings", href: "/profile", icon: UserRound },
  ],
  vendor: [
    { label: "Overview", href: "/vendor/dashboard", icon: LayoutDashboard },
    { label: "My Services", href: "/vendor/services", icon: Store },
    { label: "Add Service", href: "/vendor/services/add", icon: PlusCircle },
    { label: "Booking Requests", href: "/vendor/bookings", icon: Inbox },
    { label: "Subscription", href: "/vendor/subscription", icon: CreditCard },
    { label: "Profile Settings", href: "/profile", icon: UserRound },
  ],
  admin: [
    { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Manage Users", href: "/admin/users", icon: Users },
    { label: "Manage Services", href: "/admin/services", icon: Wrench },
    { label: "Transactions", href: "/admin/transactions", icon: Receipt },
  ],
};

const THEME: Record<
  AppRole,
  {
    portal: string;
    tagline: string;
    icon: LucideIcon;
    iconClass: string;
    chipClass: string;
    ringClass: string;
  }
> = {
  customer: {
    portal: "Customer Portal",
    tagline: "Your wedding plans",
    icon: UserRound,
    iconClass: "bg-brand-light text-brand",
    chipClass: "bg-brand-light text-brand-dark",
    ringClass: "ring-brand/20",
  },
  vendor: {
    portal: "Vendor Studio",
    tagline: "Grow your business",
    icon: Store,
    iconClass: "bg-success-light text-success",
    chipClass: "bg-success-light text-success",
    ringClass: "ring-success/20",
  },
  admin: {
    portal: "Admin Console",
    tagline: "Platform management",
    icon: ShieldCheck,
    iconClass: "bg-info-light text-info",
    chipClass: "bg-info-light text-info",
    ringClass: "ring-info/20",
  },
};

function activeHref(pathname: string, items: NavItem[]) {
  const matches = items
    .filter(
      (item) =>
        pathname === item.href || pathname.startsWith(`${item.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length);

  return matches[0]?.href ?? null;
}

function UserAvatar({
  user,
  className,
}: {
  user: DashboardUser;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand/15 bg-brand-light text-xs font-semibold text-brand-dark",
        className,
      )}
    >
      {getInitials(user.name)}
      {user.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.image}
          alt=""
          className="absolute inset-0 size-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : null}
    </span>
  );
}

export function DashboardShell({
  role,
  user,
  children,
}: {
  role: AppRole;
  user: DashboardUser;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const items = NAV[role];
  const theme = THEME[role];
  const ThemeIcon = theme.icon;
  const current = activeHref(pathname, items);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await authClient.signOut();
      router.push("/");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  };

  const sidebar = (
    <div className="flex h-full flex-col rounded-2xl border border-border-custom bg-surface p-4 shadow-sm">
      <div className="flex items-center gap-3 rounded-xl bg-brand-light/50 p-3">
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-xl",
            theme.iconClass,
          )}
        >
          <ThemeIcon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-text-primary">
            {theme.portal}
          </p>
          <p className="truncate text-xs text-text-secondary">
            {theme.tagline}
          </p>
        </div>
      </div>

      <nav aria-label={`${theme.portal} navigation`} className="mt-4 flex-1">
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = current === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand-light text-brand-dark"
                      : "text-text-secondary hover:bg-brand-light/60 hover:text-brand-dark",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4.5",
                      isActive ? "text-brand" : "text-text-muted",
                    )}
                    aria-hidden="true"
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-4 border-t border-border-custom pt-4">
        <div className="flex items-center gap-3 rounded-xl bg-brand-light/40 p-3">
          <UserAvatar user={user} className="size-9" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text-primary">
              {user.name || "WedPlan user"}
            </p>
            <p className="truncate text-xs text-text-secondary">
              {user.businessName || user.email}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-danger transition-colors hover:bg-danger-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="size-4" aria-hidden="true" />
          {isSigningOut ? "Signing out..." : "Logout"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-page">
      <div className="mx-auto flex w-full max-w-[1400px] gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <aside className="hidden w-64 shrink-0 lg:block xl:w-72">
          <div className="sticky top-24">{sidebar}</div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-border-custom bg-surface p-3 shadow-sm lg:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label="Open dashboard menu"
              className="flex size-10 items-center justify-center rounded-xl border border-border-custom bg-surface text-text-primary transition-colors hover:bg-brand-light"
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>

            <div className="min-w-0 text-center">
              <p className="truncate text-sm font-bold text-text-primary">
                {theme.portal}
              </p>
              <span
                className={cn(
                  "mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  theme.chipClass,
                )}
              >
                {role}
              </span>
            </div>

            <UserAvatar user={user} className="size-10" />
          </div>

          <div className="space-y-6">{children}</div>
        </div>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            type="button"
            aria-label="Close dashboard menu"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] p-3">
            <div className="relative h-full">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close dashboard menu"
                className="absolute -right-1 top-1 z-10 flex size-9 items-center justify-center rounded-full border border-border-custom bg-surface text-text-primary shadow-sm"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
              {sidebar}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
