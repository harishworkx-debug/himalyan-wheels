import { Link } from "@tanstack/react-router";
import { Instagram, MapPin, Phone } from "lucide-react";
import { navLinks, phones, site } from "@/lib/site";

const seoLinks = [
  { label: "Used Cars in Solan", to: "/used-cars-in-solan" },
  { label: "Used Cars in Shimla", to: "/used-cars-in-shimla" },
  { label: "Used Cars in Kandaghat", to: "/used-cars-in-kandaghat" },
  { label: "Used Cars in Kasauli", to: "/used-cars-in-kasauli" },
  { label: "Used Car Dealer", to: "/used-car-dealer" },
  { label: "Second Hand Cars", to: "/second-hand-cars" },
];

export function Footer() {
  return (
    <footer className="hairline mt-24 bg-surface/30 pb-28 lg:pb-12">
      <div className="shell grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg font-bold tracking-[0.24em]">HIMALYAN</p>
          <p className="text-gold font-display text-xs font-semibold tracking-[0.5em]">WHEELS</p>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {site.tagline}
          </p>
          <a
            href={site.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
          >
            <Instagram className="size-4" aria-hidden /> {site.instagramHandle}
          </a>
        </div>

        <nav aria-label="Footer">
          <h2 className="eyebrow">Explore</h2>
          <ul className="mt-5 space-y-3">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Popular searches">
          <h2 className="eyebrow">Popular</h2>
          <ul className="mt-5 space-y-3">
            {seoLinks.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="eyebrow">Reach Us</h2>
          <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
            {phones.map((p) => (
              <li key={p.tel}>
                <a
                  href={`tel:${p.tel}`}
                  className="inline-flex items-center gap-2 transition-colors hover:text-primary"
                >
                  <Phone className="size-4" aria-hidden /> {p.display}
                </a>
              </li>
            ))}
            <li className="flex gap-2 pt-1 leading-relaxed">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>{site.addressLine}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="hairline">
        <div className="shell flex flex-col gap-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Himalyan Wheels. All Rights Reserved.</p>
          <a
            href="https://www.techhim.online/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 transition-colors hover:text-primary"
          >
            Powered by <span className="font-semibold text-primary underline underline-offset-4 decoration-primary/50">TechHim Solutions</span>
          </a>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="transition-colors hover:text-primary">
              Privacy Policy
            </Link>
            <Link to="/terms" className="transition-colors hover:text-primary">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
