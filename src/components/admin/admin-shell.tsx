"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  BarChart3,
  Boxes,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ReceiptText,
  Settings,
  ShieldCheck,
  Tags,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { hasPermission, isSuperAdmin, ROLE_LABELS, type Permission, type Role } from "@/lib/roles";
import { LogoMark } from "@/components/ui/logo-mark";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: Permission;
  superAdminOnly?: boolean;
};

const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: "Overview",
    items: [{ label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }],
  },
  {
    section: "Catalogue",
    items: [
      { label: "Products", href: "/admin/products", icon: Package, permission: "products.view" },
      { label: "Categories", href: "/admin/categories", icon: Tags, permission: "categories.write" },
      { label: "Inventory", href: "/admin/inventory", icon: Boxes, permission: "inventory.view" },
    ],
  },
  {
    section: "Operations",
    items: [
      { label: "Sales", href: "/admin/sales", icon: ReceiptText, permission: "sales.view" },
      { label: "Reports", href: "/admin/reports", icon: BarChart3, permission: "reports.view" },
    ],
  },
  {
    section: "Administration",
    items: [
      { label: "Settings", href: "/admin/settings", icon: Settings, permission: "settings.write" },
      { label: "Team", href: "/admin/team", icon: Users, permission: "team.manage" },
    ],
  },
  {
    section: "Samtech Labs",
    items: [
      { label: "Platform", href: "/admin/platform", icon: ShieldCheck, superAdminOnly: true },
    ],
  },
];

export function AdminShell({
  user,
  children,
}: {
  user: { name: string; email: string; role: Role; permissions: string[] };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const superAdmin = isSuperAdmin(user.role);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const sections = NAV.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      if (item.superAdminOnly) return superAdmin;
      if (!item.permission) return true;
      return hasPermission(user.role, user.permissions, item.permission);
    }),
  })).filter((section) => section.items.length > 0);

  const currentItem = sections
    .flatMap((section) => section.items)
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const title = currentItem?.label ?? "Admin";
  const sectionLabel = sections.find((section) =>
    section.items.some((item) => item === currentItem),
  )?.section;

  const initials = user.name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sidebar = (
    <div className="relative flex h-full flex-col overflow-hidden bg-ink text-ivory">
      {/* Ambient champagne glow at the top of the rail */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-champagne/15 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative flex h-[72px] items-center justify-between border-b border-white/[0.07] px-5">
        <Link href="/admin/dashboard" className="group flex items-center gap-2.5" aria-label="Manuella Sole — admin dashboard">
          <LogoMark size={36} className="transition-transform duration-500 group-hover:scale-105" />
          <span className="flex flex-col">
            <span className="font-display text-[17px] leading-none tracking-[0.2em] text-ivory transition-colors group-hover:text-champagne">
              MANUELLA
            </span>
            <span className="mt-1 text-[6px] font-semibold uppercase leading-none tracking-[0.44em] text-ivory/35">
              Console
            </span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="relative grid h-8 w-8 place-items-center rounded-md text-ivory/60 hover:bg-white/10 hover:text-ivory lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-5">
        {sections.map((section) => (
          <div key={section.section} className="mb-5">
            <p className="px-3 pb-1.5 text-[8.5px] font-semibold uppercase tracking-[0.2em] text-ivory/30">
              {section.section}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12.5px] font-medium transition-all duration-200",
                        active
                          ? "bg-gradient-to-r from-champagne/[0.14] via-white/[0.06] to-transparent text-ivory shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                          : "text-ivory/55 hover:bg-white/[0.05] hover:text-ivory",
                      )}
                    >
                      {active ? (
                        <span
                          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-champagne to-champagne-deep"
                          aria-hidden="true"
                        />
                      ) : null}
                      <item.icon
                        className={cn(
                          "h-[16px] w-[16px] transition-colors",
                          active ? "text-champagne" : "text-ivory/35 group-hover:text-ivory/70",
                        )}
                        strokeWidth={1.7}
                        aria-hidden="true"
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/[0.08] p-3.5">
        <Link
          href="/"
          target="_blank"
          className="mb-2.5 flex items-center justify-between rounded-lg border border-white/[0.06] px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ivory/45 transition-all hover:border-champagne/30 hover:text-champagne"
        >
          View storefront
          <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
        </Link>
        <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.04] p-2.5">
          <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-champagne to-champagne-deep text-[11px] font-semibold text-ink ring-2 ring-champagne/20">
            {initials || "MS"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium text-ivory">{user.name}</p>
            <p className="truncate text-[8.5px] uppercase tracking-[0.14em] text-ivory/35">
              {ROLE_LABELS[user.role]}
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="grid h-8 w-8 place-items-center rounded-md text-ivory/40 transition-colors hover:bg-white/10 hover:text-danger"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-surface min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[252px] lg:block">{sidebar}</aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Close menu overlay"
          />
          <aside className="absolute inset-y-0 left-0 w-[272px] shadow-lift">{sidebar}</aside>
        </div>
      ) : null}

      <div className="lg:pl-[252px]">
        <header className="sticky top-0 z-30 flex h-[64px] items-center justify-between gap-4 border-b border-line/80 bg-ivory/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-champagne/50 to-transparent" aria-hidden="true" />
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-white text-ink shadow-sm transition-colors hover:bg-cream lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </button>
            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[11px]">
              <span className="hidden font-medium text-ash sm:inline">{sectionLabel ?? "Admin"}</span>
              <ChevronRight className="hidden h-3.5 w-3.5 text-champagne-deep/70 sm:inline" aria-hidden="true" />
              <span className="truncate font-semibold text-ink">{title}</span>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden max-w-[220px] truncate text-[10.5px] text-ash md:inline" title={user.email}>
              {user.email}
            </span>
            <span
              className="hidden h-8 w-px bg-line sm:block"
              aria-hidden="true"
            />
            <span
              className="grid h-8 w-8 place-items-center rounded-full bg-ink text-[10px] font-semibold text-champagne ring-2 ring-champagne/30"
              title={`${user.name} — ${ROLE_LABELS[user.role]}`}
            >
              {initials || "MS"}
            </span>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}