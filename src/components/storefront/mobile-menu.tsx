"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowUpRight, Instagram, MessageCircle, Phone, X } from "lucide-react";
import { LogoMark } from "@/components/ui/logo-mark";
import { normaliseWhatsAppNumber } from "@/lib/whatsapp";

type CategoryLink = { name: string; slug: string };

export function MobileMenu({
  categories,
  whatsappNumber,
  instagram,
  trigger,
}: {
  categories: CategoryLink[];
  whatsappNumber: string;
  instagram?: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const primary = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px]" />
        <DialogPrimitive.Content className="fixed inset-y-0 right-0 z-50 flex w-[90%] max-w-sm flex-col overflow-y-auto border-l border-champagne/20 bg-ivory p-6 focus:outline-none">
          <div className="flex items-center justify-between">
            <DialogPrimitive.Title className="flex items-center gap-3">
              <LogoMark size={36} />
              <span className="flex flex-col">
                <span className="font-display text-[17px] leading-none tracking-[0.2em] text-ink">
                  MANUELLA
                </span>
                <span className="mt-1 text-[6px] font-semibold uppercase leading-none tracking-[0.44em] text-ash">
                  Sole Footwear
                </span>
              </span>
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              className="grid h-10 w-10 place-items-center rounded-md border border-line text-ash transition-colors hover:bg-cream hover:text-ink"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </DialogPrimitive.Close>
          </div>

          <nav className="mt-9" aria-label="Mobile navigation">
            <ul className="space-y-1">
              {primary.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-center justify-between border-b border-line/70 py-4 font-display text-[26px] text-ink transition-colors hover:text-gold-deep"
                  >
                    {item.label}
                    <ArrowUpRight className="h-4 w-4 text-ash-light transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-champagne-deep" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {categories.length ? (
            <div className="mt-8">
              <p className="eyebrow text-ash">Shop by category</p>
              <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
                {categories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={`/category/${category.slug}`}
                      className="text-[13px] text-ash transition-colors hover:text-ink"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-auto space-y-3 pt-10">
            {whatsappNumber ? (
              <a
                href={`https://wa.me/${normaliseWhatsAppNumber(whatsappNumber)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 items-center justify-center gap-2 rounded-lg bg-ink text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory transition-colors hover:bg-gold-deep"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Order on WhatsApp
              </a>
            ) : null}
            <div className="flex gap-2">
              <Link
                href="/contact"
                className="flex h-11 flex-1 items-center justify-center gap-2 border border-line text-[11px] uppercase tracking-[0.14em] text-ash"
              >
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                Contact
              </Link>
              {instagram ? (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-11 w-11 place-items-center border border-line text-ash"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" aria-hidden="true" />
                </a>
              ) : null}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
