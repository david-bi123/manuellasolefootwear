import Link from "next/link";
import { AlertTriangle, Lock, Mail, MessageCircle, Phone, RefreshCw } from "lucide-react";
import type { StoreSettings } from "@/lib/services/settings";
import { SITE_IMAGES } from "@/lib/site-images";

function digits(value: string) {
  return value.replace(/[^\d]/g, "");
}

/**
 * Full-screen notice shown to the public when the site is paused by Samtech Labs
 * because the hosting / subscription is unpaid. A super admin can still reach
 * their console through the login link at the bottom.
 */
export function PausedNotice({ settings }: { settings: StoreSettings }) {
  const email = settings.developerEmail || "samtechlabs@gmail.com";
  const phone = settings.developerPhone;
  const whatsapp = settings.developerWhatsapp ? digits(settings.developerWhatsapp) : "";
  const developer = settings.developerName || "Samtech Labs";

  const waLink = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(
        `Hello ${developer}, I'd like to renew hosting for ${settings.businessName}.`,
      )}`
    : null;

  return (
    <div className="relative flex min-h-screen flex-col bg-ink text-ivory">
      {/* ambient background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.12]"
        style={{ backgroundImage: `url('${SITE_IMAGES.hero}')` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink to-ink" aria-hidden="true" />

      <div className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full border border-champagne/40 bg-champagne/10 text-champagne">
          <AlertTriangle className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
        </span>

        <p className="eyebrow mt-8 text-champagne">Hosting notice</p>
        <h1 className="mt-4 font-display text-[38px] leading-[1.08] sm:text-[52px]">
          {settings.businessName}
          <span className="mt-2 block italic text-champagne">is temporarily offline.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-md text-[14px] leading-[1.85] text-ivory/60">
          {settings.pausedReason ||
            "This website is temporarily unavailable. Please contact the developer to renew hosting."}
        </p>

        <div className="mt-10 flex w-full max-w-sm flex-col gap-3">
          {waLink ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[52px] items-center justify-center gap-2.5 bg-champagne px-7 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-champagne-pale"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Renew hosting on WhatsApp
            </a>
          ) : null}

          {phone ? (
            <a
              href={`tel:${phone}`}
              className="inline-flex h-[52px] items-center justify-center gap-2.5 border border-ivory/25 px-7 text-[11px] font-medium uppercase tracking-[0.16em] text-ivory transition-colors hover:border-champagne hover:text-champagne"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Call {phone}
            </a>
          ) : null}

          <a
            href={`mailto:${email}`}
            className="inline-flex h-[52px] items-center justify-center gap-2.5 border border-ivory/25 px-7 text-[11px] font-medium uppercase tracking-[0.16em] text-ivory transition-colors hover:border-champagne hover:text-champagne"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            Email {email}
          </a>
        </div>

        <p className="mt-8 text-[10px] uppercase tracking-[0.22em] text-ivory/30">
          Maintained by {developer}
        </p>
      </div>

      {/* Super admin entry point — discreet, bottom of the page */}
      <div className="relative border-t border-white/10 px-6 py-5">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <p className="flex items-center gap-2 text-[10.5px] text-ivory/40">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            Authorised personnel only
          </p>
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.16em] text-ivory/60 underline-offset-4 transition-colors hover:text-champagne hover:underline"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Super admin login
          </Link>
        </div>
      </div>
    </div>
  );
}