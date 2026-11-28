/**
 * `/services` এবং `/services/[id]` দুটোর জন্যই এই boundary কাজ করে।
 * Next.js App Router-এর standard loading convention — নতুন কোনো
 * component library বা duplicate UI তৈরি করা হয়নি।
 */
export default function ServicesLoading() {
  return (
    <main
      className="bg-page py-12 sm:py-16"
      aria-busy="true"
      aria-label="Loading wedding services"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="h-4 w-32 animate-pulse rounded-full bg-brand-light" />
          <div className="mt-4 h-9 w-full animate-pulse rounded-lg bg-brand-light" />
          <div className="mt-4 h-4 w-3/4 animate-pulse rounded-lg bg-brand-light" />
        </div>

        <div className="mt-8 h-32 animate-pulse rounded-2xl border border-border-custom bg-surface" />

        <div
          className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          role="status"
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-80 animate-pulse rounded-2xl border border-border-custom bg-surface"
            />
          ))}
        </div>

        <p className="sr-only">Loading wedding services…</p>
      </div>
    </main>
  );
}
