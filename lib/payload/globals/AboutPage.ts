import type { GlobalConfig } from "payload";

const EXPERTISE_ICONS = [
  { label: "Briefcase", value: "Briefcase" },
  { label: "Target", value: "Target" },
  { label: "Award", value: "Award" },
  { label: "Building", value: "Building2" },
  { label: "Users", value: "Users" },
  { label: "Trending Up", value: "TrendingUp" },
] as const;

export const AboutPage: GlobalConfig = {
  slug: "about-page",
  label: "About Page",
  access: { read: () => true },
  fields: [
    {
      name: "hero",
      type: "group",
      fields: [
        { name: "heading", type: "text", required: true, defaultValue: "About Matt Sprung" },
        {
          name: "paragraphs",
          type: "array",
          minRows: 1,
          fields: [{ name: "text", type: "textarea", required: true }],
          defaultValue: [
            {
              text: "With over 15 years of experience in commercial real estate and land planning, I've built a reputation for delivering exceptional results and personalized service to my clients.",
            },
            {
              text: "My approach combines deep market knowledge with strategic thinking to help clients achieve their commercial property goals. Whether you're looking to buy, sell, lease, or develop, I provide the expertise and guidance needed for successful outcomes.",
            },
          ],
        },
        { name: "portrait", type: "upload", relationTo: "media" },
      ],
    },
    {
      name: "expertise",
      type: "group",
      fields: [
        { name: "heading", type: "text", defaultValue: "Areas of Expertise" },
        {
          name: "subheading",
          type: "textarea",
          defaultValue:
            "Comprehensive commercial real estate services backed by extensive experience",
        },
        {
          name: "areas",
          type: "array",
          fields: [
            {
              name: "icon",
              type: "select",
              options: [...EXPERTISE_ICONS],
              defaultValue: "Briefcase",
            },
            { name: "title", type: "text", required: true },
            {
              name: "items",
              type: "array",
              minRows: 1,
              fields: [{ name: "text", type: "text", required: true }],
            },
          ],
          defaultValue: [
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
      ],
    },
    {
      name: "credentials",
      type: "group",
      fields: [
        { name: "heading", type: "text", defaultValue: "Professional Credentials" },
        {
          name: "subheading",
          type: "textarea",
          defaultValue: "Committed to excellence through ongoing professional development",
        },
        {
          name: "items",
          type: "array",
          fields: [{ name: "text", type: "text", required: true }],
          defaultValue: [
            { text: "Licensed Commercial Real Estate Broker" },
            { text: "Certified Commercial Investment Member (CCIM)" },
            { text: "Member, National Association of Realtors (NAR)" },
            { text: "Society of Industrial and Office Realtors (SIOR)" },
          ],
        },
      ],
    },
    {
      name: "philosophy",
      type: "group",
      label: "My Approach",
      fields: [
        { name: "heading", type: "text", defaultValue: "My Approach" },
        {
          name: "points",
          type: "array",
          fields: [
            { name: "label", type: "text", required: true },
            { name: "body", type: "textarea", required: true },
          ],
          defaultValue: [
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
      ],
    },
    {
      name: "cta",
      type: "group",
      label: "CTA Section",
      fields: [
        { name: "heading", type: "text", defaultValue: "Let's Work Together" },
        {
          name: "body",
          type: "textarea",
          defaultValue:
            "Ready to discuss your commercial real estate needs? I'd love to hear from you.",
        },
      ],
    },
  ],
};
