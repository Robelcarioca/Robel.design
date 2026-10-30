export interface PricingTier {
  id: string;
  name: string;
  price: string;
  billingPeriod: string;
  description: string;
  popular?: boolean;
  features: string[];
  ctaText: string;
  ctaLink: string;
}

export interface ContactInfo {
  name: string;
  email: string;
  instagram: string;
  instagramHandle: string;
  x: string;
  xHandle: string;
  telegram: string;
  telegramHandle: string;
  whatsapp: string;
  whatsappDisplay: string;
  location: string;
  timeZone: string;
}

export const contactData: ContactInfo = {
  name: "design robel",
  email: "robelgudissa0000@gmail.com",
  instagram: "https://instagram.com/design_robel",
  instagramHandle: "@design_robel",
  x: "https://x.com/Robelcario",
  xHandle: "@Robelcario",
  telegram: "https://t.me/ReubenMarsian",
  telegramHandle: "@ReubenMarsian",
  whatsapp: "https://wa.me/251930129953",
  whatsappDisplay: "+251 930 129 953",
  location: "Addis Ababa, Ethiopia",
  timeZone: "Africa/Addis_Ababa",
};

export const pricingTiers: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$500",
    billingPeriod: "/ One time",
    description: "Ideal for early-stage products, landing pages, or sleek brand refreshes.",
    popular: false,
    features: [
      "Up to 3 high-fidelity responsive screens",
      "Interactive Figma prototype & design system tokens",
      "Clean UI component library handoff",
      "2 rounds of comprehensive revisions",
      "5–7 business days delivery",
      "30-day post-delivery support",
    ],
    ctaText: "Book a call →",
    ctaLink: "https://t.me/ReubenMarsian",
  },
  {
    id: "professional",
    name: "Professional",
    price: "$990",
    billingPeriod: "/ One time",
    description: "Complete full-stack UI/UX design & front-end web development crafted to convert.",
    popular: true,
    features: [
      "Up to 8 complete responsive pages / screens",
      "End-to-end design system & component architecture",
      "Custom micro-interactions & fluid animations",
      "Clean Next.js / Tailwind CSS production code",
      "Unlimited revisions during active sprint",
      "10–14 business days delivery",
      "Priority 60-day ongoing support",
    ],
    ctaText: "Book a call →",
    ctaLink: "https://t.me/ReubenMarsian",
  },
  {
    id: "premium",
    name: "Premium",
    price: "$1,450",
    billingPeriod: "/ One time",
    description: "Bespoke digital experience, extensive product UX, web development & event production.",
    popular: false,
    features: [
      "Comprehensive multi-platform product design & dev",
      "Advanced motion design, 3D/video presentation deck",
      "Full web application build (Next.js, responsive, SEO)",
      "High-impact launch assets & marketing collateral",
      "Dedicated asynchronous communication via Telegram/Slack",
      "14–21 business days delivery",
      "VIP 90-day ongoing direct collaboration",
    ],
    ctaText: "Book a call →",
    ctaLink: "https://t.me/ReubenMarsian",
  },
];
