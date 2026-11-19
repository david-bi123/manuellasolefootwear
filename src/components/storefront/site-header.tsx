"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MessageCircle, Search, User } from "lucide-react";
import { AnnouncementBar } from "@/components/storefront/announcement-bar";
import { MobileMenu } from "@/components/storefront/mobile-menu";
import { SearchDialog } from "@/components/storefront/search-dialog";
import { LogoMark } from "@/components/ui/logo-mark";
import { cn } from "@/lib/utils";
import { normaliseWhatsAppNumber } from "@/lib/whatsapp";

type CategoryLink = { name: string; slug: string };

const NAV = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

function isShopPath(pathname: string) {
  return pathname.startsWith("/shop") || pathname.startsWith("/category") || pathname.startsWith("/product");
}

export function SiteHeader({
  categories,
  announcement,
  whatsappNumber,
  instagram,
}: {
  categories: CategoryLink[];
  announcement: string;
  whatsappNumber: string;
  instagram?: string;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setScrolled(window.scrollY > 12);
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const waHref = whatsappNumber
    ? `https://wa.me/${normaliseWhatsAppNumber(whatsappNumber)}`
    : "/contact";

  return (
    <header className="sticky top-0 z-40">
      <AnnouncementBar text={announcement} />
      <div
        className={cn(
          "border-b bg-ivory/92 backdrop-blur-xl transition-all duration-300",
          scrolled ? "border-line shadow-[0_14px_36px_-28px_rgba(18,25,22,0.55)]" : "border-line/70",
        )}
      >
        {/* Reading progress — a champagne hairline that tracks the page */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[2px] origin-left bg-gradient-to-r from-gold-deep via-champagne to-gold transition-transform duration-150 ease-out"
          style={{ transform: `scaleX(${progress})` }}
        />
        <div className="shell flex h-[68px] items-center justify-between gap-4 sm:h-[76px]">
          <div className="flex items-center gap-1.5 lg:hidden">
            <MobileMenu
              categories={categories}
              whatsappNumber={whatsappNumber}
              instagram={instagram}
              trigger={
                <button
                  type="button"
                  className="grid h-10 w-10 place-items-center rounded-md border border-line bg-white/60 text-ink transition-colors hover:border-line-dark hover:bg-cream"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </button>
              }
            />
          </div>

          <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label="Manuella Sole Footwear home">
            <LogoMark size={40} className="transition-transform duration-500 group-hover:scale-105" />
            <span className="flex flex-col">
              <span className="font-display text-[21px] leading-none tracking-[0.2em] text-ink transition-colors duration-300 group-hover:text-gold-deep sm:text-[24px]">
                MANUELLA
              </span>
              <span className="mt-1.5 text-[6.5px] font-semibold uppercase leading-none tracking-[0.48em] text-ash transition-colors duration-300 group-hover:text-champagne-deep sm:text-[7.5px]">
                Sole Footwear
              </span>
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : item.href === "/shop" ? isShopPath(pathname) : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] transition-all duration-300",
                    active
                      ? "bg-ink text-ivory shadow-[0_6px_16px_-8px_rgba(18,25,22,0.6)]"
                      : "text-ash hover:bg-cream hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <SearchDialog
              suggestions={["Heels", "Chelsea boots", "Loafers", "Oxfords", "Suede"]}
              trigger={
                <button
                  type="button"
                  className="grid h-10 w-10 place-items-center rounded-md text-ink transition-colors hover:bg-cream hover:text-gold-deep"
                  aria-label="Search products"
                >
                  <Search className="h-[18px] w-[18px]" aria-hidden="true" />
                </button>
              }
            />
            <Link
              href="/admin/login"
              className="grid h-10 w-10 place-items-center rounded-md text-ink transition-colors hover:bg-cream hover:text-gold-deep"
              aria-label="Admin login"
              title="Admin login"
            >
              <User className="h-[18px] w-[18px]" aria-hidden="true" />
            </Link>
            <a
              href={waHref}
              target={whatsappNumber ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="btn-sheen hidden h-11 items-center gap-2 bg-ink px-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ivory transition-colors hover:bg-gold-deep sm:inline-flex"
            >
              <MessageCircle className="relative z-10 h-3.5 w-3.5" aria-hidden="true" />
              <span className="relative z-10">WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
