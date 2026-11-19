"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { saveSettingsAction } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { ImageUploader, type UploadedImage } from "@/components/admin/image-uploader";
import type { StoreSettings } from "@/lib/services/settings";

type SettingsFormState = {
  businessName: string;
  tagline: string;
  whatsappNumber: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  x: string;
  currency: string;
  announcementText: string;
  announcementEnabled: boolean;
  promoHeading: string;
  promoBody: string;
  promoImage: UploadedImage[];
  promoLink: string;
  lowStockThreshold: string;
  logoUrl: string;
};

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<SettingsFormState>({
    businessName: settings.businessName,
    tagline: settings.tagline,
    whatsappNumber: settings.whatsappRaw || settings.whatsappNumber,
    businessEmail: settings.businessEmail,
    businessPhone: settings.businessPhone,
    businessAddress: settings.businessAddress,
    instagram: settings.socialMediaLinks.instagram,
    facebook: settings.socialMediaLinks.facebook,
    tiktok: settings.socialMediaLinks.tiktok,
    x: settings.socialMediaLinks.x,
    currency: settings.currency,
    announcementText: settings.announcementText,
    announcementEnabled: settings.announcementEnabled,
    promoHeading: settings.promoHeading,
    promoBody: settings.promoBody,
    promoImage: settings.promoImage ? [{ url: settings.promoImage }] : [],
    promoLink: settings.promoLink,
    lowStockThreshold: String(settings.lowStockThreshold),
    logoUrl: settings.logoUrl,
  });

  const set = <K extends keyof SettingsFormState>(key: K, value: SettingsFormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    startTransition(async () => {
      const result = await saveSettingsAction({
        businessName: form.businessName,
        tagline: form.tagline,
        whatsappNumber: form.whatsappNumber,
        businessEmail: form.businessEmail,
        businessPhone: form.businessPhone,
        businessAddress: form.businessAddress,
        socialMediaLinks: {
          instagram: form.instagram,
          facebook: form.facebook,
          tiktok: form.tiktok,
          x: form.x,
        },
        currency: form.currency,
        announcementText: form.announcementText,
        announcementEnabled: form.announcementEnabled,
        promoHeading: form.promoHeading,
        promoBody: form.promoBody,
        promoImage: form.promoImage[0]?.url ?? "",
        promoLink: form.promoLink,
        lowStockThreshold: Number(form.lowStockThreshold) || 0,
        logoUrl: form.logoUrl,
      });
      if (result.ok) {
        toast.success(result.message ?? "Settings saved.");
        router.refresh();
      } else {
        setError(result.error ?? "Could not save settings.");
        setFieldErrors(result.fieldErrors ?? {});
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {error ? (
        <div role="alert" className="border border-danger/25 bg-danger/5 px-4 py-3 text-[12.5px] text-danger">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="admin-card p-5 sm:p-6">
          <h3 className="mb-4 font-display text-[20px] text-ink">Business</h3>
          <div className="space-y-4">
            <Field label="Business name" htmlFor="biz-name" error={fieldErrors.businessName} required>
              <input id="biz-name" value={form.businessName} onChange={(e) => set("businessName", e.target.value)} className="admin-input" />
            </Field>
            <Field label="Tagline" htmlFor="tagline" error={fieldErrors.tagline}>
              <input id="tagline" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} className="admin-input" />
            </Field>
            <Field label="Currency" htmlFor="currency" error={fieldErrors.currency}>
              <input id="currency" value={form.currency} onChange={(e) => set("currency", e.target.value)} className="admin-input" placeholder="GHS" />
            </Field>
            <Field label="Business address" htmlFor="address" error={fieldErrors.businessAddress}>
              <input id="address" value={form.businessAddress} onChange={(e) => set("businessAddress", e.target.value)} className="admin-input" />
            </Field>
          </div>
        </section>

        <section className="admin-card p-5 sm:p-6">
          <h3 className="mb-4 font-display text-[20px] text-ink">Contact</h3>
          <div className="space-y-4">
            <Field label="WhatsApp number" htmlFor="wa" error={fieldErrors.whatsappNumber} required hint="International format, digits only (e.g. 233241234567).">
              <input id="wa" value={form.whatsappNumber} onChange={(e) => set("whatsappNumber", e.target.value)} className="admin-input" />
            </Field>
            <Field label="Business email" htmlFor="biz-email" error={fieldErrors.businessEmail}>
              <input id="biz-email" type="email" value={form.businessEmail} onChange={(e) => set("businessEmail", e.target.value)} className="admin-input" />
            </Field>
            <Field label="Business phone" htmlFor="biz-phone" error={fieldErrors.businessPhone}>
              <input id="biz-phone" value={form.businessPhone} onChange={(e) => set("businessPhone", e.target.value)} className="admin-input" />
            </Field>
          </div>
        </section>
      </div>

      <section className="admin-card p-5 sm:p-6">
        <h3 className="mb-4 font-display text-[20px] text-ink">Social media</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Instagram URL" htmlFor="ig" error={fieldErrors["socialMediaLinks.instagram"]}>
            <input id="ig" value={form.instagram} onChange={(e) => set("instagram", e.target.value)} className="admin-input" placeholder="https://instagram.com/…" />
          </Field>
          <Field label="Facebook URL" htmlFor="fb">
            <input id="fb" value={form.facebook} onChange={(e) => set("facebook", e.target.value)} className="admin-input" placeholder="https://facebook.com/…" />
          </Field>
          <Field label="TikTok URL" htmlFor="tt">
            <input id="tt" value={form.tiktok} onChange={(e) => set("tiktok", e.target.value)} className="admin-input" placeholder="https://tiktok.com/@…" />
          </Field>
          <Field label="X (Twitter) URL" htmlFor="x">
            <input id="x" value={form.x} onChange={(e) => set("x", e.target.value)} className="admin-input" placeholder="https://x.com/…" />
          </Field>
        </div>
      </section>

      <section className="admin-card p-5 sm:p-6">
        <h3 className="mb-4 font-display text-[20px] text-ink">Storefront content</h3>
        <div className="space-y-4">
          <Field label="Announcement text" htmlFor="ann" error={fieldErrors.announcementText}>
            <input id="ann" value={form.announcementText} onChange={(e) => set("announcementText", e.target.value)} className="admin-input" />
          </Field>
          <label className="flex items-center gap-2.5">
            <input type="checkbox" checked={form.announcementEnabled} onChange={(e) => set("announcementEnabled", e.target.checked)} className="h-4 w-4 accent-[#175340]" />
            <span className="text-[13px] text-ink">Show announcement bar</span>
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Promo heading" htmlFor="promo-h">
              <input id="promo-h" value={form.promoHeading} onChange={(e) => set("promoHeading", e.target.value)} className="admin-input" />
            </Field>
            <Field label="Promo link" htmlFor="promo-l">
              <input id="promo-l" value={form.promoLink} onChange={(e) => set("promoLink", e.target.value)} className="admin-input" placeholder="/shop" />
            </Field>
          </div>
          <Field label="Promo body" htmlFor="promo-b">
            <textarea id="promo-b" value={form.promoBody} onChange={(e) => set("promoBody", e.target.value)} rows={2} className="admin-input resize-none" />
          </Field>
          <div>
            <span className="admin-label">Promo image</span>
            <ImageUploader images={form.promoImage} onChange={(images) => set("promoImage", images)} multiple={false} />
          </div>
        </div>
      </section>

      <section className="admin-card p-5 sm:p-6">
        <h3 className="mb-4 font-display text-[20px] text-ink">Inventory</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Low stock threshold" htmlFor="lst" error={fieldErrors.lowStockThreshold} hint="Default alert level for new products.">
            <input id="lst" type="number" min={0} value={form.lowStockThreshold} onChange={(e) => set("lowStockThreshold", e.target.value)} className="admin-input" />
          </Field>
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" loading={pending} className="h-11">
          <Save className="h-4 w-4" aria-hidden="true" />
          Save settings
        </Button>
      </div>
    </form>
  );
}