import { requirePermission } from "@/lib/auth/session";
import { getSettings } from "@/lib/services/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  await requirePermission("settings.write");
  const settings = await getSettings();

  return (
    <div className="space-y-5">
      <div>
        <p className="eyebrow text-gold-deep">Administration</p>
        <h2 className="mt-2 font-display text-[28px] leading-tight text-ink sm:text-[32px]">
          Settings
        </h2>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ash">
          Business details, contact information and storefront content. Changes go live immediately.
        </p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  );
}