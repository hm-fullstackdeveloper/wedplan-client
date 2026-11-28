"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import toast from "react-hot-toast";

/**
 * Customer-এর জন্য booking request form।
 * `serviceId` সবসময় server component থেকে আসে — browser থেকে নয়।
 * customerId/vendorId কখনো এখান থেকে পাঠানো হয় না (server session থেকে নেয়)।
 */
export function BookingForm({ serviceId }: { serviceId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    const eventDate = String(formData.get("eventDate") ?? "").trim();
    const eventLocation = String(formData.get("eventLocation") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    if (!eventDate || !eventLocation) {
      const validationError = "Event date and event location are required.";
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ serviceId, eventDate, eventLocation, message }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        const failure = data.error || "Could not send your booking request.";
        setError(failure);
        toast.error(failure);
        return;
      }

      toast.success(data.message || "Booking request sent to the vendor.");
      form.reset();
      router.push("/customer/bookings");
      router.refresh();
    } catch {
      const failure = "Something went wrong. Please try again.";
      setError(failure);
      toast.error(failure);
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="booking-event-date"
          className="mb-2 block text-sm font-medium text-text-primary"
        >
          Event Date
        </label>
        <input
          id="booking-event-date"
          name="eventDate"
          type="date"
          min={today}
          required
          disabled={submitting}
          className="w-full rounded-xl border border-border-custom bg-surface px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60"
        />
      </div>

      <div>
        <label
          htmlFor="booking-event-location"
          className="mb-2 block text-sm font-medium text-text-primary"
        >
          Event Location
        </label>
        <input
          id="booking-event-location"
          name="eventLocation"
          type="text"
          required
          disabled={submitting}
          placeholder="e.g. Dhaka, Bangladesh"
          className="w-full rounded-xl border border-border-custom bg-surface px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60"
        />
      </div>

      <div>
        <label
          htmlFor="booking-message"
          className="mb-2 block text-sm font-medium text-text-primary"
        >
          Additional Message
        </label>
        <textarea
          id="booking-message"
          name="message"
          rows={4}
          maxLength={1000}
          disabled={submitting}
          placeholder="Tell the vendor about your event, guest count or any special request."
          className="w-full resize-y rounded-xl border border-border-custom bg-surface px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60"
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <Send aria-hidden="true" className="size-4" />
        )}
        {submitting ? "Sending Request..." : "Request Booking"}
      </button>

      <p className="text-center text-xs text-text-muted">
        The vendor will review and accept or reject your request.
      </p>
    </form>
  );
}
