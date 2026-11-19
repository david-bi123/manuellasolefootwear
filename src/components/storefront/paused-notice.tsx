import Link from "next/link";
import { Lock, MessageCircle } from "lucide-react";
import { LogoMark } from "@/components/ui/logo-mark";
import type { StoreSettings } from "@/lib/services/settings";
import { normaliseWhatsAppNumber } from "@/lib/whatsapp";

/**
 * Shown to the public when the site is paused (hosting / subscription unpaid).
 * Deliberately shows nothing but:
 *   1. A "contact the developer" WhatsApp button (0550624203 by default)
 *   2. A login button that only works for the super admin
 */
export function PausedNotice({ settings }: { settings: StoreSettings }) {
  // Developer's number — platform settings can override it, but the paused
  // storefront always has a working contact path.
  const rawNumber = settings.developerWhatsapp || "0550624203";
  const whatsapp = normaliseWhatsAppNumber(rawNumber);
  const developer = settings.developerName || "Samtech Labs";

  const waLink = `https://wa.me/${whatsapp}?text=${encodeURIComponent(
    `Hello ${developer}, I'd like to renew hosting for ${settings.businessName}.`,
  )}`;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink px-6 text-ivory">
      {/* ambient backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.14]"
        style={{ backgroundImage: "url('https://res.cloudinary.com/dw5dhplqm/image/upload/f_auto,q_auto,w_1600/v1795068776/manuella-sole/site/promo.jpg')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink to-ink" aria-hidden="true" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/4 h-80 w-80 -translate-x-1/2 rounded-full bg-champagne/15 blur-3xl"
        aria-hidden="true"
      />

      <main className="relative flex w-full max-w-md flex-col items-center py-16 text-center">
        <LogoMark size={52} />
        <p className="eyebrow mt-8 text-champagne">Hosting notice</p>
        <h1 className="mt-4 font-display text-[34px] leading-[1.1] sm:text-[44px]">
          {settings.businessName}
          <span className="mt-2 block italic text-champagne">is temporarily offline.</span>
        </h1>

        <p className="mt-6 max-w-sm text-[14px] leading-[1.85] text-ivory/60">
          {settings.pausedReason ||
            "This website is temporarily unavailable. Please contact the developer to renew hosting."}
        </p>

        <div className="mt-10 flex w-full flex-col items-center gap-3">
          {/* Contact the developer */}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-sheen inline-flex h-14 w-full items-center justify-center gap-2.5 bg-champagne px-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-champagne-pale"
          >
            <MessageCircle className="relative z-10 h-5 w-5" aria-hidden="true" />
            <span className="relative z-10">Chat the developer on WhatsApp</span>
          </a>
          <p className="text-[10.5px] uppercase tracking-[0.18em] text-ivory/35">
            055 062 4203
          </p>

          {/* Super admin login */}
          <Link
            href="/admin/login"
            className="inline-flex h-12 w-full items-center justify-center gap-2 border border-ivory/20 px-7 text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory/75 transition-colors hover:border-champagne hover:text-champagne"
          >
            <Lock className="h-4 w-4" aria-hidden="true" />
            Super admin login
          </Link>
        </div>
      </main>
    </div>
  );
}
