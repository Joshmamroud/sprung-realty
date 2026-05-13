// Hardcoded fallback content used when Payload DB isn't reachable or globals haven't been seeded.
// Matches initial defaultValue's in lib/payload/globals/*.ts so the site renders identically
// before any admin edits.

export type MediaRef =
  | string
  | {
      url?: string | null;
      alt?: string | null;
      sizes?: Record<string, { url?: string | null } | null>;
    }
  | null
  | undefined;

export type SiteSettingsDefaults = {
  brand: { name: string; tagline: string };
  contact: { phone: string; phoneHref: string; email: string; licenseNumber?: string };
  footer: { tagline: string };
};

export const SITE_SETTINGS_DEFAULTS: SiteSettingsDefaults = {
  brand: { name: "Matt Sprung", tagline: "Commercial Real Estate & Land Planning" },
  contact: {
    phone: "(123) 456-7890",
    phoneHref: "tel:+1234567890",
    email: "matt@sprungproperties.com",
    licenseNumber: "RE123456",
  },
  footer: { tagline: "Commercial Real Estate Broker & Land Planner" },
};

export type IconName =
  | "Building2"
  | "MapPin"
  | "TrendingUp"
  | "Users"
  | "Award"
  | "Target"
  | "Briefcase";

export type HomePageDefaults = {
  hero: {
    title: string;
    subtitle: string;
    backgroundImage?: MediaRef;
    primaryCtaLabel?: string;
  };
  stats: { value: string; label: string }[];
  services: {
    heading: string;
    subheading: string;
    items: { icon: IconName; title: string; description: string }[];
  };
  whyChoose: {
    heading: string;
    body: string;
    image?: MediaRef;
    points: { icon: IconName; title: string; description: string }[];
  };
  finalCta: {
    heading: string;
    body: string;
    primaryLabel: string;
    secondaryLabel: string;
  };
};

const HERO_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1760124056893-6b2e8a11745a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920";
const WHY_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1774544368113-b66148dab467?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const PORTRAIT_FALLBACK =
  "https://images.unsplash.com/photo-1758518729058-b158e71c5a9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

export const HOME_PAGE_DEFAULTS: HomePageDefaults = {
  hero: {
    title: "Commercial Real Estate Excellence",
    subtitle:
      "Expert brokerage and land planning services tailored to your commercial property goals.",
    backgroundImage: HERO_IMAGE_FALLBACK,
    primaryCtaLabel: "View Properties",
  },
  stats: [
    { value: "500M+", label: "In Transactions" },
    { value: "15+", label: "Years Experience" },
    { value: "200+", label: "Properties Sold" },
    { value: "98%", label: "Client Satisfaction" },
  ],
  services: {
    heading: "Comprehensive Services",
    subheading:
      "Full-service commercial real estate solutions to support your business growth",
    items: [
      {
        icon: "Building2",
        title: "Commercial Sales & Leasing",
        description:
          "Expert representation for office, retail, and industrial properties across all markets.",
      },
      {
        icon: "MapPin",
        title: "Land Planning & Development",
        description:
          "Strategic site selection and comprehensive land use planning for optimal development outcomes.",
      },
      {
        icon: "TrendingUp",
        title: "Investment Analysis",
        description:
          "Detailed market analysis and financial modeling to maximize your commercial property returns.",
      },
      {
        icon: "Users",
        title: "Tenant Representation",
        description:
          "Dedicated advocacy to secure the ideal commercial space for your business needs.",
      },
    ],
  },
  whyChoose: {
    heading: "Why Choose Matt Sprung?",
    body: "With over 15 years of experience in commercial real estate and land planning, I bring unparalleled market knowledge and a proven track record of success.",
    image: WHY_IMAGE_FALLBACK,
    points: [
      {
        icon: "Award",
        title: "Industry Expertise",
        description: "Deep understanding of commercial markets and zoning regulations",
      },
      {
        icon: "TrendingUp",
        title: "Proven Results",
        description: "Track record of maximizing value for buyers, sellers, and investors",
      },
      {
        icon: "Users",
        title: "Client-Focused Approach",
        description:
          "Personalized service and dedicated support throughout every transaction",
      },
    ],
  },
  finalCta: {
    heading: "Ready to Make Your Next Move?",
    body: "Let's discuss your commercial real estate goals and find the perfect solution.",
    primaryLabel: "Browse Properties",
    secondaryLabel: "Schedule a Consultation",
  },
};

export type AboutPageDefaults = {
  hero: {
    heading: string;
    paragraphs: { text: string }[];
    portrait?: MediaRef;
  };
  expertise: {
    heading: string;
    subheading: string;
    areas: {
      icon: IconName;
      title: string;
      items: { text: string }[];
    }[];
  };
  credentials: {
    heading: string;
    subheading: string;
    items: { text: string }[];
  };
  philosophy: {
    heading: string;
    points: { label: string; body: string }[];
  };
  cta: { heading: string; body: string };
};

export const ABOUT_PAGE_DEFAULTS: AboutPageDefaults = {
  hero: {
    heading: "About Matt Sprung",
    paragraphs: [
      {
        text: "With over 15 years of experience in commercial real estate and land planning, I've built a reputation for delivering exceptional results and personalized service to my clients.",
      },
      {
        text: "My approach combines deep market knowledge with strategic thinking to help clients achieve their commercial property goals. Whether you're looking to buy, sell, lease, or develop, I provide the expertise and guidance needed for successful outcomes.",
      },
    ],
    portrait: PORTRAIT_FALLBACK,
  },
  expertise: {
    heading: "Areas of Expertise",
    subheading:
      "Comprehensive commercial real estate services backed by extensive experience",
    areas: [
      {
        icon: "Briefcase",
        title: "Commercial Brokerage",
        items: [
          { text: "Office Space Sales & Leasing" },
          { text: "Retail Property Transactions" },
          { text: "Industrial & Warehouse" },
          { text: "Multi-Family Properties" },
        ],
      },
      {
        icon: "Target",
        title: "Land Planning",
        items: [
          { text: "Site Selection & Analysis" },
          { text: "Zoning & Entitlements" },
          { text: "Development Feasibility" },
          { text: "Master Planning" },
        ],
      },
      {
        icon: "Award",
        title: "Specializations",
        items: [
          { text: "Investment Properties" },
          { text: "Build-to-Suit Development" },
          { text: "Sale-Leaseback Transactions" },
          { text: "Portfolio Advisory" },
        ],
      },
    ],
  },
  credentials: {
    heading: "Professional Credentials",
    subheading: "Committed to excellence through ongoing professional development",
    items: [
      { text: "Licensed Commercial Real Estate Broker" },
      { text: "Certified Commercial Investment Member (CCIM)" },
      { text: "Member, National Association of Realtors (NAR)" },
      { text: "Society of Industrial and Office Realtors (SIOR)" },
    ],
  },
  philosophy: {
    heading: "My Approach",
    points: [
      {
        label: "Client Success First",
        body: "Every transaction is unique, and I take the time to understand your specific goals, challenges, and vision. Your success is my priority.",
      },
      {
        label: "Market Intelligence",
        body: "I leverage comprehensive market data, trends analysis, and local insights to provide strategic advice that positions you for optimal outcomes.",
      },
      {
        label: "Transparent Communication",
        body: "I believe in keeping clients informed every step of the way. You'll always know where we stand and what's happening with your transaction.",
      },
      {
        label: "Long-Term Relationships",
        body: "My goal is to be your trusted advisor for all your commercial real estate needs, now and in the future. Many of my clients have been with me for years, and I'm proud of those lasting partnerships.",
      },
    ],
  },
  cta: {
    heading: "Let's Work Together",
    body: "Ready to discuss your commercial real estate needs? I'd love to hear from you.",
  },
};

export function mediaUrl(ref: MediaRef, size?: "thumb" | "card" | "hero"): string | null {
  if (!ref) return null;
  if (typeof ref === "string") return ref;
  if (size && ref.sizes?.[size]?.url) return ref.sizes[size]!.url ?? null;
  return ref.url ?? null;
}

export function mediaAlt(ref: MediaRef, fallback: string): string {
  if (!ref || typeof ref === "string") return fallback;
  return ref.alt ?? fallback;
}
