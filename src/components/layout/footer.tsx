import Link from "next/link";
import { Heart, LifeBuoy, Mail, MapPin } from "lucide-react";

const importantLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Services", href: "/services" },
  { label: "Sign In", href: "/sign-in" },
  { label: "Sign Up", href: "/sign-up" },
] as const;

const serviceCategories = [
  "Photography & Videography",
  "Wedding Venues",
  "Decoration & Florist",
  "Catering Services",
  "Makeup & Styling",
  "Wedding Fashion",
] as const;

type SocialPlatform = "facebook" | "instagram" | "youtube" | "pinterest";

/**
 * TODO: Replace these placeholder URLs with WedPlan's official profile links.
 * They currently point to each platform's homepage so no fake account is used.
 */
const socialLinks: Array<{
  platform: SocialPlatform;
  label: string;
  href: string;
}> = [
  { platform: "facebook", label: "Facebook", href: "https://www.facebook.com/" },
  { platform: "instagram", label: "Instagram", href: "https://www.instagram.com/" },
  { platform: "youtube", label: "YouTube", href: "https://www.youtube.com/" },
  { platform: "pinterest", label: "Pinterest", href: "https://www.pinterest.com/" },
];

const socialIconPaths: Record<SocialPlatform, string> = {
  facebook:
    "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  instagram:
    "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z",
  youtube:
    "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  pinterest:
    "M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z",
};

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="size-4"
    >
      <path d={socialIconPaths[platform]} />
    </svg>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border-custom bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Link
              href="/"
              aria-label="WedPlan home"
              className="group inline-flex items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
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
                <span className="mt-1 text-[10px] font-medium uppercase leading-none tracking-[0.2em] text-text-muted">
                  Wedding Planning
                </span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-6 text-text-secondary">
              WedPlan makes wedding planning simple and stress-free. Discover
              trusted wedding professionals, explore beautiful venues, and bring
              your dream wedding to life.
            </p>
          </div>

          <nav aria-labelledby="footer-important-links" className="lg:col-span-2">
            <h2
              id="footer-important-links"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-text-primary"
            >
              Important Links
            </h2>
            <ul className="mt-4 space-y-2.5">
              {importantLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary transition-colors hover:text-brand-dark"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-text-primary">
              Wedding Services
            </h2>
            <ul className="mt-4 space-y-2.5">
              {serviceCategories.map((category) => (
                <li
                  key={category}
                  className="flex items-center gap-2.5 text-sm text-text-secondary"
                >
                  <span
                    className="size-1.5 shrink-0 rounded-full bg-brand/40"
                    aria-hidden="true"
                  />
                  {category}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-text-primary">
              Contact
            </h2>
            <ul className="mt-4 space-y-4">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
                  <Mail className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wider text-text-muted">
                    Email
                  </p>
                  <a
                    href="mailto:support@wedplan.com"
                    className="mt-0.5 inline-block break-all text-sm text-text-secondary transition-colors hover:text-brand-dark"
                  >
                    support@wedplan.com
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
                  <MapPin className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-text-muted">
                    Location
                  </p>
                  <p className="mt-0.5 text-sm text-text-secondary">Bangladesh</p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
                  <LifeBuoy className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-text-muted">
                    Support
                  </p>
                  <span className="mt-0.5 inline-flex items-center gap-2 text-sm text-text-secondary">
                    Contact Us
                    <span className="rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-medium leading-none text-brand-dark">
                      Coming soon
                    </span>
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border-custom bg-brand-light/35">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <h2 className="text-sm font-semibold text-brand-dark">Follow Us</h2>
            <p className="mt-1 text-xs text-text-secondary">
              Wedding inspiration, planning tips, and beautiful celebrations.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {socialLinks.map((social) => (
              <a
                key={social.platform}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                title={social.label}
                className="flex size-10 items-center justify-center rounded-full border border-border-custom bg-surface text-text-secondary transition-colors hover:border-brand/30 hover:bg-brand hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
              >
                <SocialIcon platform={social.platform} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-brand-light/10 bg-brand-dark">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-center sm:px-6 md:flex-row md:items-center md:justify-between md:text-left lg:px-8">
          <p className="text-xs text-brand-light/70">
            © {currentYear} WedPlan. All rights reserved.
          </p>

          <p className="order-last flex items-center justify-center gap-1.5 text-xs text-brand-light/70 md:order-none">
            Made with love
            <Heart
              className="size-3.5 fill-brand text-brand"
              aria-hidden="true"
            />
            for your perfect day.
          </p>

          <div className="flex items-center justify-center gap-2 text-xs text-brand-light/50 md:justify-end">
            <span
              aria-label="Privacy Policy (coming soon)"
              title="Coming soon"
              className="cursor-default"
            >
              Privacy Policy
            </span>
            <span className="text-brand-light/25" aria-hidden="true">
              •
            </span>
            <span
              aria-label="Terms and Conditions (coming soon)"
              title="Coming soon"
              className="cursor-default"
            >
              Terms &amp; Conditions
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
