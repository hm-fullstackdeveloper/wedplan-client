"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";

const CATEGORIES = [
  "Wedding Hall",
  "Photography",
  "Videography",
  "Catering",
  "Decoration",
  "Makeup Artist",
  "Music & DJ",
  "Bridal Wear",
  "Other",
];

export type ServiceFormInitial = {
  serviceName: string;
  category: string;
  description: string;
  price: string;
  location: string;
  images: string[];
};

const EMPTY: ServiceFormInitial = {
  serviceName: "",
  category: "",
  description: "",
  price: "",
  location: "",
  images: [],
};

export function ServiceForm({
  mode,
  serviceId,
  initial,
}: {
  mode: "add" | "edit";
  serviceId?: string;
  initial?: ServiceFormInitial;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState<ServiceFormInitial>(initial ?? EMPTY);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const update = <K extends keyof ServiceFormInitial>(
    key: K,
    value: ServiceFormInitial[K],
  ) => {
    setValues((previous) => ({ ...previous, [key]: value }));
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    setUploading(true);
    setError("");

    try {
      const uploaded: string[] = [];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          setError("Only image files are allowed.");
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          setError("Each image must be smaller than 5MB.");
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = (await response.json().catch(() => ({}))) as {
          url?: string;
          error?: string;
        };

        if (!response.ok || !data.url) {
          setError(data.error || "Image upload failed.");
          continue;
        }

        uploaded.push(data.url);
      }

      if (uploaded.length) {
        setValues((previous) => ({
          ...previous,
          images: [...previous.images, ...uploaded],
        }));
      }
    } catch {
      setError("Image upload failed. Please try again.");
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (saving || uploading) {
      return;
    }

    setError("");
    setMessage("");

    const price = Number(values.price);

    if (values.serviceName.trim().length < 3) {
      setError("Service name must be at least 3 characters.");
      return;
    }

    if (!values.category) {
      setError("Please choose a service category.");
      return;
    }

    if (values.description.trim().length < 20) {
      setError("Description must be at least 20 characters.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Please enter a valid price greater than 0.");
      return;
    }

    if (values.location.trim().length < 2) {
      setError("Please enter the service location.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        serviceName: values.serviceName.trim(),
        category: values.category,
        description: values.description.trim(),
        price,
        location: values.location.trim(),
        images: values.images,
      };

      const response = await fetch(
        mode === "add" ? "/api/services" : `/api/services/${serviceId}`,
        {
          method: mode === "add" ? "POST" : "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        setError(data.error || "Could not save this service.");
        return;
      }

      setMessage(
        data.message ||
          (mode === "add"
            ? "Service submitted for admin approval."
            : "Service updated successfully."),
      );

      router.push("/vendor/services");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-border-custom bg-surface p-5 shadow-sm sm:p-6"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="serviceName"
            className="mb-2 block text-sm font-medium text-text-primary"
          >
            Service Name
          </label>
          <input
            id="serviceName"
            value={values.serviceName}
            onChange={(event) => update("serviceName", event.target.value)}
            required
            minLength={3}
            placeholder="e.g. Royal Garden Wedding Hall"
            className="w-full rounded-xl border border-border-custom bg-surface px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-medium text-text-primary"
          >
            Service Category
          </label>
          <select
            id="category"
            value={values.category}
            onChange={(event) => update("category", event.target.value)}
            required
            className="w-full rounded-xl border border-border-custom bg-surface px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="price"
            className="mb-2 block text-sm font-medium text-text-primary"
          >
            Price (USD)
          </label>
          <input
            id="price"
            type="number"
            min={1}
            step="0.01"
            value={values.price}
            onChange={(event) => update("price", event.target.value)}
            required
            placeholder="e.g. 1200"
            className="w-full rounded-xl border border-border-custom bg-surface px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="location"
            className="mb-2 block text-sm font-medium text-text-primary"
          >
            Location
          </label>
          <input
            id="location"
            value={values.location}
            onChange={(event) => update("location", event.target.value)}
            required
            placeholder="e.g. Dhaka, Bangladesh"
            className="w-full rounded-xl border border-border-custom bg-surface px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium text-text-primary"
          >
            Description
          </label>
          <textarea
            id="description"
            value={values.description}
            onChange={(event) => update("description", event.target.value)}
            required
            minLength={20}
            rows={5}
            placeholder="Describe your service, what is included, and why couples should choose you."
            className="w-full resize-y rounded-xl border border-border-custom bg-surface px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-text-primary">
          Service Images
        </p>

        <div className="flex flex-wrap gap-3">
          {values.images.map((image) => (
            <div
              key={image}
              className="relative size-24 overflow-hidden rounded-xl border border-border-custom bg-brand-light"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt="Service"
                className="size-full object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  update(
                    "images",
                    values.images.filter((item) => item !== image),
                  )
                }
                aria-label="Remove image"
                className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-danger text-white shadow"
              >
                <Trash2 className="size-3" aria-hidden="true" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex size-24 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-brand/40 bg-brand-light/40 text-xs font-medium text-brand transition-colors hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            ) : (
              <ImagePlus className="size-5" aria-hidden="true" />
            )}
            {uploading ? "Uploading" : "Add image"}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => handleFiles(event.target.files)}
          className="hidden"
        />

        <p className="mt-2 text-xs text-text-muted">
          JPG, PNG, WebP or GIF · Max 5MB each.
        </p>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {message ? <p className="text-sm text-success">{message}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving || uploading}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          {saving
            ? "Saving..."
            : mode === "add"
              ? "Submit for Approval"
              : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/vendor/services")}
          className="inline-flex h-11 items-center rounded-full border border-border-custom bg-surface px-6 text-sm font-medium text-text-secondary transition-colors hover:bg-brand-light"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
