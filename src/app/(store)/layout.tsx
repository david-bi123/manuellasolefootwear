import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { WhatsAppFab } from "@/components/storefront/whatsapp-fab";
import { PausedNotice } from "@/components/storefront/paused-notice";
import { getActiveCategories } from "@/lib/services/catalog";
import { getSettings } from "@/lib/services/settings";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([
    getSettings(),
    getActiveCategories().catch(() => []),
  ]);

  // When the site is paused (hosting / subscription), the public storefront is
  // replaced entirely by the hosting-renewal notice. Super admins can still
  // reach their console via the login button on that notice.
  if (settings.siteStatus === "paused") {
    return <PausedNotice settings={settings} />;
  }

  const navCategories = categories.map((category) => ({
    name: category.name,
    slug: category.slug,
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-ink focus:px-4 focus:py-2 focus:text-xs focus:uppercase focus:tracking-widest focus:text-ivory"
      >
        Skip to content
      </a>
      <SiteHeader
        categories={navCategories}
        announcement={settings.announcementEnabled ? settings.announcementText : ""}
        whatsappNumber={settings.whatsappNumber}
        instagram={settings.socialMediaLinks.instagram}
      />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter settings={settings} categories={navCategories} />
      <WhatsAppFab
        number={settings.whatsappNumber}
        message={`Hello ${settings.businessName}! I would like to ask about a pair from your collection.`}
      />
    </div>
  );
}