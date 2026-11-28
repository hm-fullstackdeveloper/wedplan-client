import { Suspense } from "react";

import Hero from "@/components/home/hero";
import LatestServices from "@/components/home/latest-services";

function LatestServicesFallback() {
  return (
    <section
      className="bg-page py-16 sm:py-20"
      aria-busy="true"
      aria-label="Latest wedding services"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm text-text-secondary" role="status">
          Loading latest wedding services…
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-80 animate-pulse rounded-2xl border border-border-custom bg-surface"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />

      <Suspense fallback={<LatestServicesFallback />}>
        <LatestServices />
      </Suspense>
    </>
  );
}
