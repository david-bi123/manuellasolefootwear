import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/services/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Manuella Sole Footwear handles your personal information when you browse the collection or order on WhatsApp.",
  alternates: { canonical: "/privacy" },
};

const SECTIONS = [
  {
    title: "Who we are",
    body: "Manuella Sole Footwear is an independent footwear retailer based in Accra, Ghana. We sell through this catalogue and complete every order personally over WhatsApp. This policy explains what information we hold and how we look after it.",
  },
  {
    title: "What we collect",
    body: "When you message us on WhatsApp we receive your name, phone number and whatever you choose to tell us about your order — style, size, colour and delivery address. If you email or call us, we receive the details you share there. We do not run accounts for customers and we do not take card details on this website.",
  },
  {
    title: "Website data",
    body: "Our hosting provider records standard technical logs such as the pages requested, browser type and approximate location for security and reliability. The only cookie we set is a signed, HTTP-only session cookie for team members signing into the admin area; it is not used for advertising or analytics.",
  },
  {
    title: "How we use it",
    body: "We use your details to answer your enquiry, confirm availability, arrange delivery and handle any exchange or return. We keep a record of confirmed sales for stock control and accounting. We do not sell your information, and we do not add you to marketing lists without your agreement.",
  },
  {
    title: "Who we share it with",
    body: "WhatsApp (Meta) processes messages you send us. Our hosting and database providers store the website and its records on our behalf. Delivery partners receive only the details needed to deliver your order. We may disclose information where the law requires it.",
  },
  {
    title: "How long we keep it",
    body: "Order and sales records are kept for as long as needed for accounting and warranty purposes. WhatsApp conversations are kept only while they are useful for serving you, then deleted. You can ask us to delete your conversation at any time.",
  },
  {
    title: "Your choices",
    body: "You can ask to see, correct or delete the personal information we hold about you, or ask us to stop contacting you. Message us on WhatsApp or email us and we will respond within a reasonable period.",
  },
  {
    title: "Security",
    body: "Access to our sales and stock records is restricted to named team members with individual accounts. Passwords are stored as one-way hashes, sessions expire automatically, and financial information is limited to owners and administrators.",
  },
];

export default async function PrivacyPage() {
  const settings = await getSettings();
  const contact = settings.businessEmail || "hello@manuellasole.com";

  return (
    <>
      <section className="border-b border-line bg-cream/50">
        <div className="shell py-12 lg:py-16">
          <p className="eyebrow text-gold-deep">Legal</p>
          <h1 className="display-2 mt-4 text-ink">Privacy policy</h1>
          <p className="mt-4 max-w-xl text-[13px] leading-[1.8] text-ash">
            A plain-English summary of the information we hold, why we hold it, and what you can ask
            us to do with it.
          </p>
          <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-ash-light">
            Last updated · November 2026
          </p>
        </div>
      </section>

      <div className="shell grid gap-10 py-14 lg:grid-cols-[220px_1fr] lg:gap-16 lg:py-20">
        <aside className="hidden lg:block">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink">On this page</p>
          <ul className="mt-4 space-y-2.5">
            {SECTIONS.map((section) => (
              <li key={section.title}>
                <a
                  href={`#${section.title.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                  className="text-[12px] text-ash transition-colors hover:text-ink"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        <div className="max-w-2xl">
          <div className="space-y-10">
            {SECTIONS.map((section) => (
              <section key={section.title} id={section.title.toLowerCase().replace(/[^a-z]+/g, "-")}>
                <h2 className="font-display text-[26px] leading-tight text-ink">{section.title}</h2>
                <p className="mt-3 text-[13px] leading-[1.9] text-ash">{section.body}</p>
              </section>
            ))}
          </div>

          <div className="mt-12 border border-line bg-cream/50 p-6">
            <p className="font-display text-[22px] text-ink">Questions about your data?</p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-ash">
              Email{" "}
              <a href={`mailto:${contact}`} className="text-ink underline underline-offset-4">
                {contact}
              </a>{" "}
              or message us on WhatsApp and we will help.
            </p>
            <Link
              href="/contact"
              className="mt-5 inline-flex h-10 items-center bg-ink px-5 text-[10px] uppercase tracking-[0.16em] text-ivory"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
