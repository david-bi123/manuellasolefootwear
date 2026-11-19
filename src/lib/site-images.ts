/**
 * Editorial photography served from Cloudinary (f_auto, q_auto, right-sized).
 * Local copies live in public/images as a fallback/source of truth; the site
 * delivers via these URLs for smaller, auto-optimised responses.
 */
export const SITE_IMAGES = {
  hero: "https://res.cloudinary.com/dw5dhplqm/image/upload/f_auto,q_auto,w_1600/v1795068773/manuella-sole/site/hero.jpg",
  story: "https://res.cloudinary.com/dw5dhplqm/image/upload/f_auto,q_auto,w_1600/v1795068775/manuella-sole/site/story.jpg",
  promo: "https://res.cloudinary.com/dw5dhplqm/image/upload/f_auto,q_auto,w_1600/v1795068776/manuella-sole/site/promo.jpg",
  og: "https://res.cloudinary.com/dw5dhplqm/image/upload/f_auto,q_auto,w_1200/v1795068778/manuella-sole/site/og.jpg",
} as const;
