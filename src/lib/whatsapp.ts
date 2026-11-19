export type WhatsAppOrderInput = {
  businessName: string;
  productName: string;
  price: number;
  size: string;
  sizingSystem: string;
  colour: string;
  quantity: number;
  productUrl: string;
  sku?: string;
};

/** Converts common local formats (0244..., +233..., 233...) to wa.me digits. */
export function normaliseWhatsAppNumber(raw: string | undefined | null): string {
  if (!raw) return "";
  let digits = raw.replace(/[^\d]/g, "");
  if (!digits) return "";

  if (digits.startsWith("00")) digits = digits.slice(2);

  // Ghanaian local numbers: 0241234567 -> 233241234567
  if (digits.length === 10 && digits.startsWith("0")) {
    digits = `233${digits.slice(1)}`;
  }
  return digits;
}

export function isValidWhatsAppNumber(raw: string | undefined | null): boolean {
  const digits = normaliseWhatsAppNumber(raw);
  return digits.length >= 8 && digits.length <= 15;
}

export function buildWhatsAppUrl(number: string, message: string): string {
  const digits = normaliseWhatsAppNumber(number);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function buildOrderMessage(input: WhatsAppOrderInput): string {
  const price = new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
  }).format(input.price);

  return [
    `Hello ${input.businessName}!`,
    "",
    "I am interested in ordering the following product:",
    "",
    `Product: ${input.productName}`,
    `Price: ${price}`,
    `Size: ${input.sizingSystem} ${input.size}`,
    `Colour: ${input.colour}`,
    `Quantity: ${input.quantity}`,
    input.sku ? `SKU: ${input.sku}` : null,
    "",
    `Product link: ${input.productUrl}`,
    "",
    "Please let me know how I can proceed with my order.",
    "",
    "Thank you.",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

export function buildContactMessage(businessName: string, topic = "an enquiry") {
  return `Hello ${businessName}!\n\nI would like to make ${topic}.\n\nThank you.`;
}
