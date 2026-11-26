
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ImagePlus } from "lucide-react";
import type { AccountType } from "./account-type-selector";
import { authClient } from "@/app/lib/auth-client";
import SocialLoginButtons from "@/components/auth/social-login-buttons";


interface SignUpFormProps {
  accountType: AccountType;
}

export default function SignUpForm({ accountType }: SignUpFormProps) {
  const router = useRouter();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setImagePreview((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return imageUrl;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);

      const { error: signUpError } = await authClient.signUp.email({
        name,
        email,
        password,
        role: accountType,
      });

      if (signUpError) {
        setError(signUpError.message || "Registration failed!");
        return;
      }

      router.push("/sign-in");
      router.refresh();
    } catch (error) {
      console.error("Sign Up Error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-text-primary">
          Create {accountType === "vendor" ? "Vendor" : "Customer"} Account
        </h2>

        <p className="mt-1 text-sm text-text-secondary">
          Fill in your information to get started.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Profile Picture */}
        <div className="flex flex-col items-center">
          <label
            htmlFor="profileImage"
            className="relative flex size-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-brand bg-brand-light"
          >
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="Profile preview"
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <ImagePlus size={30} className="text-brand" />
            )}
          </label>

          <input
            id="profileImage"
            name="profileImage"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          <label
            htmlFor="profileImage"
            className="mt-2 cursor-pointer text-sm font-medium text-brand"
          >
            Upload Profile Picture
          </label>

          <p className="mt-1 text-xs text-text-muted">
            JPG, PNG or WebP (Max 5MB)
          </p>
        </div>

        {/* Full Name */}
        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">
            Full Name
          </label>

          <input
            name="name"
            type="text"
            placeholder="Enter your full name"
            required
            minLength={2}
            autoComplete="name"
            className="w-full rounded-xl border border-border-custom bg-surface px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>

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
              placeholder="Create a password"
              required
              minLength={8}
              autoComplete="new-password"
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

        {/* Confirm Password */}
        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">
            Confirm Password
          </label>

          <div className="relative">
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-xl border border-border-custom bg-surface px-4 py-3 pr-12 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary"
              aria-label="Toggle confirm password visibility"
            >
              {showConfirmPassword ? (
                <EyeOff size={19} />
              ) : (
                <Eye size={19} />
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {/* Create Account */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand px-5 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-border-custom" />
        <span className="text-sm text-text-muted">Or continue with</span>
        <div className="h-px flex-1 bg-border-custom" />
      </div>

      {/* Social Login */}
      <div className="grid grid-cols-2 gap-4">
        <SocialLoginButtons />
      </div>
    </div>
  );
}
