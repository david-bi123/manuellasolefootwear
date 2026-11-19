import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm, WhatsAppDirect } from "@/components/storefront/contact-form";
import { Reveal } from "@/components/motion/reveal";
import { getSettings } from "@/lib/services/settings";
import { normaliseWhatsAppNumber, buildWhatsAppUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact & Personal Styling",
  description:
    "Speak to Manuella Sole Footwear about sizing, availability and delivery. Message us on WhatsApp for personal help choosing your pair.",
  alternates: { canonical: "/contact" },
};

const FAQS = [
  {
    question: "How do I place an order?",
    answer:
      "Choose your style, colour and size on any product page, then tap “Order on WhatsApp”. The message is prepared for you — send it and we confirm availability, delivery and payment personally.",
  },
  {
    question: "Is anything charged on the website?",
    answer:
      "No. The site is a catalogue. Nothing is charged online and no order is placed until we confirm it with you on WhatsApp.",
  },
  {
    question: "How does sizing work?",
    answer:
      "Each product states whether it uses UK or EU sizing — the two are not interchangeable. If you are between sizes, message us with a pair you already own and we will advise.",
  },
  {
    question: "Do you deliver outside Accra?",
    answer:
      "Yes. Delivery is arranged and quoted on WhatsApp depending on your location. We confirm the cost and timing before dispatch.",
  },
  {
    question: "What if the pair does not fit?",
    answer:
      "Message us within 48 hours of delivery. Unworn pairs in their original packaging can be exchanged or returned; we will talk you through the options.",
  },
];

export default async function ContactPage() {
  const settings = await getSettings();
  const wa = settings.whatsappNumber
    ? buildWhatsAppUrl(
        settings.whatsappNumber,
        `Hello ${settings.businessName}! I would like some help with a pair.`,
      )
    : "";

  const details = [
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: settings.whatsappNumber ? `+${normaliseWhatsAppNumber(settings.whatsappNumber)}` : "Add a number in settings",
      href: wa || undefined,
      note: "The fastest way to reach us",
    },
    {
      icon: Mail,
      label: "Email",
      value: settings.businessEmail || "hello@manuellasole.com",
      href: `mailto:${settings.businessEmail || "hello@manuellasole.com"}`,
      note: "For longer enquiries",
    },
    {
      icon: Phone,
      label: "Phone",
      value: settings.businessPhone || "Available on request",
      href: settings.businessPhone ? `tel:${settings.businessPhone.replace(/\s/g, "")}` : undefined,
      note: "Weekdays, 9am – 6pm",
    },
    {
      icon: MapPin,
      label: "Studio",
      value: settings.businessAddress || "Accra, Ghana",
      note: "Viewings by appointment",
    },
  ];

  return (
    <>
      <section className="border-b border-line bg-cream/50">
        <div className="shell py-12 lg:py-16">
          <p className="eyebrow text-gold-deep">We are here to help</p>
          <h1 className="display-2 mt-4 max-w-2xl text-ink">
            A second opinion,
            <span className="italic text-gold-deep"> before you commit.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[13px] leading-[1.8] text-ash">
            Sizing questions, delivery timing, or choosing between two pairs — send us a message and
            we will answer personally. No chatbots, no call queues.
          </p>
        </div>
      </section>

      <div className="shell grid gap-12 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:py-20">
        <div>
          <Reveal>
            <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
              {details.map((detail) => (
                <div key={detail.label} className="border-t border-line pt-4">
                  <detail.icon className="h-4 w-4 text-gold-deep" strokeWidth={1.5} aria-hidden="true" />
                  <p className="mt-3 text-[9px] uppercase tracking-[0.18em] text-ash-light">
                    {detail.label}
                  </p>
                  {detail.href ? (
                    <a
                      href={detail.href}
                      target={detail.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="mt-1.5 block font-display text-[20px] leading-snug text-ink transition-colors hover:text-gold-deep"
                    >
                      {detail.value}
                    </a>
                  ) : (
                    <p className="mt-1.5 font-display text-[20px] leading-snug text-ink">
                      {detail.value}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-ash-light">{detail.note}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-10 flex items-start gap-3 border border-line bg-cream/50 p-5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink">
                  Opening hours
                </p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ash">
                  Monday to Friday, 9:00 – 18:00 GMT. Saturday, 10:00 – 14:00. Messages received
                  outside these hours are answered the next working day.
                </p>
              </div>
            </div>
          </Reveal>

          {wa ? (
            <div className="mt-8">
              <WhatsAppDirect href={wa} />
            </div>
          ) : null}

          <Reveal delay={0.12}>
            <div className="mt-12">
              <p className="eyebrow text-gold-deep">Common questions</p>
              <div className="mt-5 border-t border-line">
                {FAQS.map((faq) => (
                  <details key={faq.question} className="group border-b border-line py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[12px] font-medium text-ink [&::-webkit-details-marker]:hidden">
                      {faq.question}
                      <span className="text-gold-deep transition-transform group-open:rotate-45" aria-hidden="true">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 max-w-lg text-[12.5px] leading-[1.8] text-ash">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.05}>
          <div className="border border-line bg-white p-6 sm:p-8">
            <p className="eyebrow text-gold-deep">Send a message</p>
            <h2 className="mt-3 font-display text-[28px] leading-tight text-ink">
              Tell us what you are looking for.
            </h2>
            <p className="mt-2 text-[12.5px] leading-relaxed text-ash">
              A few details help us answer properly — a style name, a size you normally wear, or the
              occasion you are dressing for.
            </p>
            <div className="mt-6">
              <ContactForm
                businessName={settings.businessName}
                whatsappNumber={settings.whatsappNumber}
                email={settings.businessEmail}
              />
            </div>
          </div>

          <p className="mt-5 text-center text-[10.5px] leading-relaxed text-ash-light">
            Prefer to browse first?{" "}
            <Link href="/shop" className="text-ink underline underline-offset-4">
              See the full collection
            </Link>
            .
          </p>
        </Reveal>
      </div>
    </>
  );
}
