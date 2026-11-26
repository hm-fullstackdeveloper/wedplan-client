
"use client";

import { useState } from "react";
import { authClient } from "@/app/lib/auth-client";

type Provider = "google" | "github";

interface SocialLoginButtonsProps {
  accountType: "customer" | "vendor" | "admin";
}

export default function SocialLoginButtons({
  accountType,
}: SocialLoginButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState("");

  // Admin-এর জন্য Social Login থাকবে না
  if (accountType === "admin") {
    return null;
  }

  const handleSocialLogin = async (provider: Provider) => {
    try {
      setLoadingProvider(provider);
      setErrorMessage("");

      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });

      if (error) {
        setErrorMessage(error.message || "Social login failed.");
        setLoadingProvider(null);
      }
    } catch (error) {
      console.error("Social login error:", error);
      setErrorMessage("Something went wrong. Please try again.");
      setLoadingProvider(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-65">
        {/* Google Login */}
        <button
          type="button"
          onClick={() => handleSocialLogin("google")}
          disabled={loadingProvider !== null}
          className="flex items-center justify-center gap-2 rounded-lg border border-[#4285F4] bg-[#4285F4] px-30 py-5 text-base font-semibold text-white transition-all hover:bg-[#3367D6] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="text-lg font-bold">G</span>
          {loadingProvider === "google" ? "Loading..." : "Google"}
        </button>

        {/* GitHub Login */}
        <button
          type="button"
          onClick={() => handleSocialLogin("github")}
          disabled={loadingProvider !== null}
          className="flex items-center justify-center gap-2 rounded-lg border border-[#24292F] bg-[#24292F] px-30 py-3 text-base font-semibold text-white transition-all hover:bg-[#000000] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="text-lg font-bold">GH</span>
          {loadingProvider === "github" ? "Loading..." : "GitHub"}
        </button>
      </div>

      {errorMessage && (
        <p className="text-center text-sm text-red-500">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
