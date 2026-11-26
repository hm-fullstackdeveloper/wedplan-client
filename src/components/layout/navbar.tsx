"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { dashboardPath } from "@/lib/roles";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const navigationLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Services", href: "/services" },
] as const;

type NavbarUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
};

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getInitials(name?: string | null) {
  if (!name) {
    return "W";
  }

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "W";
}

function getDisplayName(user: NavbarUser) {
  return user.name?.trim() || "WedPlan user";
}

function getFirstName(user: NavbarUser) {
  return getDisplayName(user).split(/\s+/)[0];
}

function BrandLogo({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="WedPlan home"
      className="group flex shrink-0 items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
    >
      <span className="flex size-10 items-center justify-center rounded-xl border border-border-custom bg-brand-light text-brand transition-colors duration-200 group-hover:border-brand/30 group-hover:bg-brand-soft">
        <Heart
          className="size-5 fill-brand/20"
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </span>
      <span className="flex flex-col">
        <span className="text-xl font-semibold leading-none tracking-tight text-text-primary">
          Wed<span className="text-brand">Plan</span>
        </span>
        <span className="mt-1 hidden text-[10px] font-medium uppercase leading-none tracking-[0.2em] text-text-muted sm:block">
          Wedding Planning
        </span>
      </span>
    </Link>
  );
}

function UserAvatar({
  user,
  size = "md",
}: {
  user: NavbarUser;
  size?: "md" | "lg";
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand/15 bg-brand-light text-xs font-semibold text-brand-dark",
        size === "lg" ? "size-10" : "size-9",
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

function UserSummary({
  user,
  className,
}: {
  user: NavbarUser;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl bg-brand-light/60 p-3",
        className,
      )}
    >
      <UserAvatar user={user} size="lg" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-text-primary">
          {getDisplayName(user)}
        </p>
        {user.email ? (
          <p className="mt-0.5 truncate text-xs text-text-secondary">
            {user.email}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function NavLink({
  href,
  label,
  active,
  mobile = false,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "text-sm font-medium transition-colors",
        mobile ? "rounded-xl px-3 py-2.5" : "rounded-full px-4 py-2",
        active
          ? "bg-brand-light text-brand-dark"
          : "text-text-secondary hover:bg-brand-light/60 hover:text-brand-dark",
      )}
    >
      {label}
    </Link>
  );
}

function AuthButtons({
  fullWidth = false,
  onNavigate,
}: {
  fullWidth?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5",
        fullWidth && "w-full flex-col items-stretch gap-3",
      )}
    >
      <Link
        href="/sign-in"
        onClick={onNavigate}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-10 rounded-full border-border-custom bg-surface px-5 text-sm font-medium text-text-primary hover:border-brand/30 hover:bg-brand-light hover:text-brand-dark",
          fullWidth && "w-full",
        )}
      >
        Sign In
      </Link>
      <Link
        href="/sign-up"
        onClick={onNavigate}
        className={cn(
          buttonVariants(),
          "h-10 rounded-full border-transparent bg-brand px-5 text-sm font-medium text-white shadow-sm hover:bg-brand-dark focus-visible:ring-brand/30",
          fullWidth && "w-full",
        )}
      >
        Sign Up
      </Link>
    </div>
  );
}

function UserMenu({
  user,
  isSigningOut,
  onSignOut,
}: {
  user: NavbarUser;
  isSigningOut: boolean;
  onSignOut: () => void;
}) {
  const displayName = getDisplayName(user);
  const firstName = getFirstName(user);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Open profile menu for ${displayName}`}
        className="group flex h-11 items-center gap-2 rounded-full border border-border-custom bg-surface py-1.5 pl-1.5 pr-3 text-left outline-none transition-colors hover:border-brand/30 hover:bg-brand-light/60 focus-visible:border-brand/40 focus-visible:ring-3 focus-visible:ring-brand/15 data-[popup-open]:border-brand/30 data-[popup-open]:bg-brand-light/60"
      >
        <UserAvatar user={user} />
        <span className="hidden max-w-40 truncate text-sm font-medium text-text-primary md:block">
          Welcome, {firstName}
        </span>
        <ChevronDown
          className="size-4 text-text-muted transition-transform duration-200 group-data-[popup-open]:rotate-180"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-72! min-w-0 rounded-2xl border border-border-custom bg-surface p-2 shadow-xl shadow-brand/5"
      >
        <UserSummary user={user} />

        <DropdownMenuSeparator className="my-2 bg-border-custom" />

        <DropdownMenuGroup>
          <DropdownMenuItem
            render={<Link href={dashboardPath(user.role)} />}
            className="gap-2.5 rounded-xl px-3 py-2.5 text-text-secondary focus:bg-brand-light focus:text-brand-dark"
          >
            <LayoutDashboard className="text-brand" aria-hidden="true" />
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem
            render={<Link href="/profile" />}
            className="gap-2.5 rounded-xl px-3 py-2.5 text-text-secondary focus:bg-brand-light focus:text-brand-dark"
          >
            <Settings className="text-brand" aria-hidden="true" />
            Profile Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-2 bg-border-custom" />
          <DropdownMenuItem
            variant="destructive"
            disabled={isSigningOut}
            onClick={onSignOut}
            className="gap-2.5 rounded-xl px-3 py-2.5"
          >
            <LogOut aria-hidden="true" />
            {isSigningOut ? "Signing out..." : "Logout"}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileMenu({
  pathname,
  user,
  isSigningOut,
  onClose,
  onSignOut,
}: {
  pathname: string;
  user?: NavbarUser | null;
  isSigningOut: boolean;
  onClose: () => void;
  onSignOut: () => void;
}) {
  return (
    <div
      id="mobile-navigation"
      className="animate-in border-t border-border-custom bg-surface fade-in slide-in-from-top-1 duration-200 md:hidden"
    >
      <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto px-4 py-4 sm:px-6">
        <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
          {navigationLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              active={isActivePath(pathname, link.href)}
              mobile
              onNavigate={onClose}
            />
          ))}
        </nav>

        <div className="my-4 h-px bg-border-custom" />

        {user ? (
          <div className="space-y-1">
            <UserSummary user={user} className="mb-3" />

            <Link
              href={dashboardPath(user.role)}
              onClick={onClose}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-brand-light/60 hover:text-brand-dark"
            >
              <LayoutDashboard className="size-4 text-brand" aria-hidden="true" />
              Dashboard
            </Link>
            <Link
              href="/profile"
              onClick={onClose}
              aria-current={
                isActivePath(pathname, "/profile") ? "page" : undefined
              }
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium",
                isActivePath(pathname, "/profile")
                  ? "bg-brand-light text-brand-dark"
                  : "text-text-secondary hover:bg-brand-light/60 hover:text-brand-dark",
              )}
            >
              <Settings className="size-4 text-brand" aria-hidden="true" />
              Profile Settings
            </Link>
            <button
              type="button"
              onClick={onSignOut}
              disabled={isSigningOut}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-danger transition-colors hover:bg-danger-light disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut className="size-4" aria-hidden="true" />
              {isSigningOut ? "Signing out..." : "Logout"}
            </button>
          </div>
        ) : (
          <AuthButtons fullWidth onNavigate={onClose} />
        )}
      </div>
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const handleDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setIsMenuOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    desktopQuery.addEventListener("change", handleDesktop);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      desktopQuery.removeEventListener("change", handleDesktop);
    };
  }, [isMenuOpen]);

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }

    setIsMenuOpen(false);
    setIsSigningOut(true);

    try {
      const { error } = await authClient.signOut();

      if (error) {
        console.error("Unable to sign out:", error);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Unable to sign out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-custom/80 bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-8">
        <BrandLogo onClick={closeMenu} />

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1 md:flex"
        >
          {navigationLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              active={isActivePath(pathname, link.href)}
            />
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 md:flex">
          {user ? (
            <UserMenu
              user={user}
              isSigningOut={isSigningOut}
              onSignOut={handleSignOut}
            />
          ) : (
            <AuthButtons />
          )}
        </div>

        <button
          type="button"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="flex size-10 items-center justify-center rounded-xl border border-border-custom bg-surface text-text-primary transition-colors hover:border-brand/30 hover:bg-brand-light hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 md:hidden"
        >
          {isMenuOpen ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {isMenuOpen ? (
        <MobileMenu
          pathname={pathname}
          user={user}
          isSigningOut={isSigningOut}
          onClose={closeMenu}
          onSignOut={handleSignOut}
        />
      ) : null}
    </header>
  );
}
