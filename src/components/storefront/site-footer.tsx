import Link from "next/link";
import { Instagram, Facebook, MessageCircle, Mail, MapPin, Music2, ArrowUpRight } from "lucide-react";
import { LogoMark } from "@/components/ui/logo-mark";
import type { StoreSettings } from "@/lib/services/settings";
import { normaliseWhatsAppNumber } from "@/lib/whatsapp";

export function SiteFooter({
  settings,
  categories,
}: {
  settings: StoreSettings;
  categories: { name: string; slug: string }[];
}) {
  const wa = settings.whatsappNumber
    ? `https://wa.me/${normaliseWhatsAppNumber(settings.whatsappNumber)}`
    : "";
  const year = new Date().getFullYear();
  const social = settings.socialMediaLinks;

  const socialLinks = [
    { href: social.instagram, label: "Instagram", Icon: Instagram },
    { href: social.facebook, label: "Facebook", Icon: Facebook },
    { href: social.tiktok, label: "TikTok", Icon: Music2 },
    { href: wa, label: "WhatsApp", Icon: MessageCircle },
  ].filter((link) => Boolean(link.href));

  return (
    <footer className="relative mt-24 overflow-hidden bg-ink text-ivory/75 grain">
      {/* Champagne hairline crowning the footer */}
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-champagne/70 to-transparent"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-editorial opacity-45" aria-hidden="true" />

      <div className="shell relative z-10 grid gap-12 pb-16 pt-16 sm:grid-cols-2 lg:grid-cols-[1.55fr_1fr_1fr_1.25fr] lg:pb-20 lg:pt-20">
        <div>
          <Link href="/" className="group inline-flex items-center gap-3" aria-label="Manuella Sole Footwear home">
            <LogoMark size={46} />
            <span className="flex flex-col">
              <span className="font-display text-[24px] leading-none tracking-[0.2em] text-ivory transition-colors group-hover:text-champagne">
                MANUELLA
              </span>
              <span className="mt-1.5 text-[7px] font-semibold uppercase leading-none tracking-[0.46em] text-ivory/45">
                Sole Footwear
              </span>
            </span>
          </Link>
          <p className="mt-7 max-w-xs font-display text-[26px] italic leading-snug text-ivory/90">
            {settings.tagline || "Step Into Your Style."}
          </p>
          <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-ivory/55">
            Considered footwear for men and women, chosen for the way you live. Order directly
            through WhatsApp for personal service.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {socialLinks.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-full border border-ivory/15 text-ivory/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-champagne/60 hover:text-champagne"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Footer — explore">
          <p className="eyebrow text-champagne">Explore</p>
          <ul className="mt-5 space-y-3 text-[13px]">
            {[
              { label: "Home", href: "/" },
              { label: "Shop all", href: "/shop" },
              { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group inline-flex items-center gap-1 transition-colors hover:text-ivory"
                >
                  {link.label}
                  <ArrowUpRight className="h-3 w-3 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Footer — collections">
          <p className="eyebrow text-champagne">Collections</p>
          <ul className="mt-5 space-y-3 text-[13px]">
            {categories.slice(0, 6).map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/category/${category.slug}`}
                  className="group inline-flex items-center gap-1 transition-colors hover:text-ivory"
                >
                  {category.name}
                  <ArrowUpRight className="h-3 w-3 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="eyebrow text-champagne">Get in touch</p>
          <ul className="mt-5 space-y-4 text-[13px]">
            {wa ? (
              <li>
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 transition-colors hover:text-ivory"
                >
                  <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-champagne" aria-hidden="true" />
                  <span>
                    WhatsApp ordering
                    <span className="mt-0.5 block text-ivory/45 transition-colors group-hover:text-ivory/70">
                      +{settings.whatsappNumber}
                    </span>
                  </span>
                </a>
              </li>
            ) : null}
            {settings.businessEmail ? (
              <li>
                <a
                  href={`mailto:${settings.businessEmail}`}
                  className="group flex items-start gap-3 transition-colors hover:text-ivory"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-champagne" aria-hidden="true" />
                  <span className="break-all">{settings.businessEmail}</span>
                </a>
              </li>
            ) : null}
            {settings.businessAddress ? (
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-champagne" aria-hidden="true" />
                <span className="text-ivory/60">{settings.businessAddress}</span>
              </li>
            ) : null}
          </ul>
          <Link
            href="/contact"
            className="btn-sheen mt-6 inline-flex h-11 items-center gap-2 border border-champagne/30 bg-champagne/5 px-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-champagne transition-colors hover:border-champagne/60 hover:bg-champagne/10"
          >
            <span className="relative z-10">Contact the studio</span>
            <ArrowUpRight className="relative z-10 h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Payment & service trust row */}
      <div className="relative z-10 border-t border-ivory/10">
        <div className="shell flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-ivory/35">
            We accept
          </p>
          <ul className="flex flex-wrap items-center gap-2">
            {["MTN Mobile Money", "Telecel Cash", "AirtelTigo Money", "Bank transfer", "Cash on delivery"].map(
              (method) => (
                <li
                  key={method}
                  className="rounded-full border border-ivory/12 bg-white/[0.04] px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.14em] text-ivory/55"
                >
                  {method}
                </li>
              ),
            )}
          </ul>
        </div>
      </div>

      <div className="relative z-10 border-t border-ivory/10">
        <div className="shell flex flex-col gap-3 py-5 text-[10px] uppercase tracking-[0.14em] text-ivory/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {settings.businessName}. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-5">
            <Link href="/privacy" className="transition-colors hover:text-champagne">
              Privacy policy
            </Link>
            <Link href="/contact" className="transition-colors hover:text-champagne">
              Customer care
            </Link>
            <Link href="/admin/login" className="transition-colors hover:text-champagne">
              Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Giant watermark wordmark */}
      <div aria-hidden="true" className="pointer-events-none relative z-0 select-none">
        <p className="shell -mb-6 translate-y-[18%] whitespace-nowrap text-center font-display text-[clamp(4.5rem,17.5vw,15rem)] font-semibold leading-none tracking-[0.08em] text-ivory/[0.045]">
          MANUELLA
        </p>
      </div>
    </footer>
  );
}
