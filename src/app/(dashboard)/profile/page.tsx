"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Check,
  LogOut,
  Mail,
  Pencil,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import { authClient, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const ROLE_LABELS: Record<string, string> = {
  customer: "Customer",
  vendor: "Vendor",
  admin: "Admin",
};

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

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isLoggingOutRef = useRef(false);

  const user = session?.user;
  const role = (user as { role?: string | null } | undefined)?.role ?? "customer";

  // Login না থাকলে সরাসরি sign-in page-এ পাঠিয়ে দিই।
  // Logout করার সময় user null হয়, কিন্তু তখন home-এ যাওয়া উচিত —
  // তাই এই guard দিয়ে অপ্রয়োজনীয় redirect আটকানো হচ্ছে।
  useEffect(() => {
    if (!isPending && !user && !isLoggingOutRef.current) {
      router.replace("/sign-in");
    }
  }, [isPending, user, router]);

  const handleSaveName = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = nameDraft.trim();

    if (trimmed.length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }

    setError("");
    setMessage("");

    try {
      setSavingName(true);

      const { error: updateError } = await authClient.updateUser({
        name: trimmed,
      });

      if (updateError) {
        setError(updateError.message || "Could not update your name.");
        return;
      }

      await refetch();
      setIsEditingName(false);
      setMessage("Name updated successfully.");
    } catch (err) {
      console.error("Update name failed:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSavingName(false);
    }
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }

    setError("");
    setMessage("");

    try {
      setUploadingImage(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !result.url) {
        setError(result.error || "Image upload failed.");
        return;
      }

      const { error: updateError } = await authClient.updateUser({
        image: result.url,
      });

      if (updateError) {
        setError(updateError.message || "Could not save your picture.");
        return;
      }

      await refetch();
      setMessage("Profile picture updated.");
    } catch (err) {
      console.error("Image upload failed:", err);
      setError("Something went wrong while uploading.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLogout = async () => {
    if (isSigningOut) {
      return;
    }

    setError("");
    setMessage("");

    try {
      setIsSigningOut(true);
      isLoggingOutRef.current = true;

      const { error: signOutError } = await authClient.signOut();

      if (signOutError) {
        isLoggingOutRef.current = false;
        setError(signOutError.message || "Could not sign out.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Sign out failed:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  if (isPending || !user) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-page px-4 py-12">
        <p className="text-text-secondary">
          {isPending ? "Loading profile..." : "Redirecting to sign in..."}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-page px-4 py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header card */}
        <section className="rounded-2xl border border-border-custom bg-surface p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="relative flex size-20 items-center justify-center overflow-hidden rounded-full border border-brand/15 bg-brand-light text-2xl font-bold text-brand-dark"
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

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  aria-label="Change profile picture"
                  className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border border-border-custom bg-surface text-brand shadow-sm transition-colors hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Camera className="size-4" aria-hidden="true" />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold text-brand-dark sm:text-2xl">
                  {user.name}
                </h1>
                <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-text-secondary">
                  <Mail className="size-4 shrink-0" aria-hidden="true" />
                  {user.email}
                </p>
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand-dark">
                  <ShieldCheck className="size-3.5" aria-hidden="true" />
                  {ROLE_LABELS[role] ?? "Customer"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isSigningOut}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border-custom bg-surface px-5 text-sm font-medium text-danger transition-colors hover:bg-danger-light disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut className="size-4" aria-hidden="true" />
              {isSigningOut ? "Signing out..." : "Logout"}
            </button>
          </div>

          {uploadingImage ? (
            <p className="mt-4 text-sm text-text-secondary">
              Uploading picture...
            </p>
          ) : null}

          {message ? (
            <p className="mt-4 flex items-center gap-1.5 text-sm text-green-600">
              <Check className="size-4" aria-hidden="true" />
              {message}
            </p>
          ) : null}

          {error ? (
            <p className="mt-4 text-sm text-red-500">{error}</p>
          ) : null}
        </section>

        {/* Profile information */}
        <section className="rounded-2xl border border-border-custom bg-surface p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-text-primary">
              Profile Information
            </h2>

            {isEditingName ? null : (
              <button
                type="button"
                onClick={() => {
                  setIsEditingName(true);
                  setNameDraft(user.name ?? "");
                  setMessage("");
                  setError("");
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1.5 text-xs font-semibold text-brand-dark transition-colors hover:bg-brand-soft"
              >
                <Pencil className="size-3.5" aria-hidden="true" />
                Edit name
              </button>
            )}
          </div>

          {isEditingName ? (
            <form onSubmit={handleSaveName} className="space-y-3">
              <label
                htmlFor="profile-name"
                className="block text-sm font-medium text-text-primary"
              >
                Full Name
              </label>

              <input
                id="profile-name"
                value={nameDraft}
                onChange={(event) => setNameDraft(event.target.value)}
                minLength={2}
                required
                autoComplete="name"
                className="w-full rounded-xl border border-border-custom bg-surface px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={savingName}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Check className="size-4" aria-hidden="true" />
                  {savingName ? "Saving..." : "Save"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsEditingName(false);
                    setNameDraft(user.name ?? "");
                  }}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-border-custom bg-surface px-5 text-sm font-medium text-text-secondary transition-colors hover:bg-brand-light"
                >
                  <X className="size-4" aria-hidden="true" />
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-brand-light/50 p-4">
                <p className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <UserRound className="size-4" aria-hidden="true" />
                  Full Name
                </p>
                <p className="mt-1 font-semibold text-text-primary">
                  {user.name}
                </p>
              </div>

              <div className="rounded-xl bg-brand-light/50 p-4">
                <p className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <Mail className="size-4" aria-hidden="true" />
                  Email Address
                </p>
                <p className="mt-1 break-all font-semibold text-text-primary">
                  {user.email}
                </p>
              </div>

              <div className="rounded-xl bg-brand-light/50 p-4">
                <p className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <ShieldCheck className="size-4" aria-hidden="true" />
                  Account Type
                </p>
                <p className="mt-1 font-semibold text-text-primary">
                  {ROLE_LABELS[role] ?? "Customer"}
                </p>
              </div>

              <div className="rounded-xl bg-brand-light/50 p-4">
                <p className="text-sm text-text-secondary">Account ID</p>
                <p className="mt-1 break-all font-semibold text-text-primary">
                  {user.id}
                </p>
              </div>
            </div>
          )}
        </section>

        <p className={cn("text-center text-xs text-text-muted")}>
          আপনার তথ্য শুধু আপনি নিজেই দেখতে ও পরিবর্তন করতে পারবেন।
        </p>
      </div>
    </main>
  );
}
