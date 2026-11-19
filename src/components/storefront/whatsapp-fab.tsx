"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { normaliseWhatsAppNumber } from "@/lib/whatsapp";

export function WhatsAppFab({
  number,
  message = "Hello! I would like to ask about a pair from your collection.",
}: {
  number: string;
  message?: string;
}) {
  const pathname = usePathname();
  if (!number || pathname.startsWith("/admin")) return null;

  const href = `https://wa.me/${normaliseWhatsAppNumber(number)}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group fixed bottom-5 right-5 z-30 flex h-13 items-center gap-0 overflow-hidden rounded-full bg-ink py-4 pl-4 pr-4 text-ivory shadow-lift ring-1 ring-champagne/40 transition-all duration-300 hover:bg-gold-deep hover:pr-6 hover:ring-champagne",
        "max-sm:animate-pulse-ring",
      )}
      aria-label="Chat with Manuella Sole Footwear on WhatsApp"
    >
      <MessageCircle className="h-5 w-5 shrink-0 text-champagne transition-colors duration-300 group-hover:text-champagne-pale" aria-hidden="true" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.16em] text-ivory/90 transition-all duration-300 group-hover:ml-2.5 group-hover:max-w-[160px]">
        Chat with us
      </span>
    </a>
  );
}

export function WhatsAppTextLink({
  number,
  message,
  children,
  className,
}: {
  number: string;
  message: string;
  children: React.ReactNode;
  className?: string;
}) {
  if (!number) {
    return (
      <Link href="/contact" className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={`https://wa.me/${normaliseWhatsAppNumber(number)}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}
