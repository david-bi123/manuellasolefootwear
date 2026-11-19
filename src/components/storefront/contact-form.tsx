"use client";

import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const TOPICS = [
  "Order enquiry",
  "Sizing advice",
  "Delivery question",
  "Exchange or return",
  "Something else",
];

export function ContactForm({
  businessName,
  whatsappNumber,
  email,
}: {
  businessName: string;
  whatsappNumber: string;
  email: string;
}) {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const body = [
    `Hello ${businessName}!`,
    "",
    `My name is ${name || "…"}.`,
    `Topic: ${topic}`,
    "",
    message || "…",
  ].join("\n");

  const canSubmit = name.trim().length > 1 && message.trim().length > 4;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    if (whatsappNumber) {
      window.open(buildWhatsAppUrl(whatsappNumber, body), "_blank", "noopener,noreferrer");
      setSent(true);
      return;
    }

    if (email) {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(
        `${topic} — ${businessName}`,
      )}&body=${encodeURIComponent(body)}`;
      setSent(true);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="contact-name" className="admin-label">
          Your name
        </label>
        <input
          id="contact-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="admin-input"
          placeholder="How should we address you?"
          autoComplete="name"
          required
        />
      </div>

      <div>
        <label htmlFor="contact-topic" className="admin-label">
          What is this about?
        </label>
        <select
          id="contact-topic"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          className="admin-input"
        >
          {TOPICS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className="admin-label">
          Message
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="admin-input min-h-[130px] resize-y"
          placeholder="Tell us the style, size or question you have in mind."
          required
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="inline-flex h-12 w-full items-center justify-center gap-2 bg-ink px-6 text-[10px] uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-gold-deep disabled:cursor-not-allowed disabled:bg-line disabled:text-ash"
      >
        <Send className="h-3.5 w-3.5" aria-hidden="true" />
        {whatsappNumber ? "Continue in WhatsApp" : "Send by email"}
      </button>

      <p className="text-[10.5px] leading-relaxed text-ash-light">
        {sent
          ? "Your message is ready — send it in the window that just opened and we will reply personally."
          : whatsappNumber
            ? "This prepares a WhatsApp message. Nothing is sent until you press send there."
            : "This opens your email client with the message ready to send."}
      </p>
    </form>
  );
}

export function WhatsAppDirect({
  href,
  label = "Message us on WhatsApp",
}: {
  href: string;
  label?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-11 items-center gap-2 bg-ink px-6 text-[10px] uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-gold-deep"
    >
      <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </a>
  );
}
