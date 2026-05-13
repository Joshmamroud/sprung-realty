import type { GlobalConfig } from "payload";

const SERVICE_ICONS = [
  { label: "Building", value: "Building2" },
  { label: "Map Pin", value: "MapPin" },
  { label: "Trending Up", value: "TrendingUp" },
  { label: "Users", value: "Users" },
  { label: "Award", value: "Award" },
  { label: "Target", value: "Target" },
  { label: "Briefcase", value: "Briefcase" },
] as const;

export const HomePage: GlobalConfig = {
  slug: "home-page",
  label: "Home Page",
  access: { read: () => true },
  fields: [
    {
      name: "hero",
      type: "group",
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
          defaultValue: "Commercial Real Estate Excellence",
        },
        {
          name: "subtitle",
          type: "textarea",
          required: true,
          defaultValue:
            "Expert brokerage and land planning services tailored to your commercial property goals.",
        },
        {
          name: "backgroundImage",
          type: "upload",
          relationTo: "media",
          required: false,
        },
        {
          name: "primaryCtaLabel",
          type: "text",
          defaultValue: "View Properties",
        },
      ],
    },
    {
      name: "stats",
      type: "array",
      minRows: 0,
      maxRows: 8,
      defaultValue: [
        { value: "500M+", label: "In Transactions" },
        { value: "15+", label: "Years Experience" },
        { value: "200+", label: "Properties Sold" },
        { value: "98%", label: "Client Satisfaction" },
      ],
      fields: [
        { name: "value", type: "text", required: true },
        { name: "label", type: "text", required: true },
      ],
    },
    {
      name: "services",
      type: "group",
      fields: [
        { name: "heading", type: "text", defaultValue: "Comprehensive Services" },
        {
          name: "subheading",
          type: "textarea",
          defaultValue:
            "Full-service commercial real estate solutions to support your business growth",
        },
        {
          name: "items",
          type: "array",
          minRows: 0,
          fields: [
            {
              name: "icon",
              type: "select",
              options: [...SERVICE_ICONS],
              defaultValue: "Building2",
            },
            { name: "title", type: "text", required: true },
            { name: "description", type: "textarea", required: true },
          ],
          defaultValue: [
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
      ],
    },
    {
      name: "whyChoose",
      type: "group",
      label: "Why Choose Section",
      fields: [
        { name: "heading", type: "text", defaultValue: "Why Choose Matt Sprung?" },
        {
          name: "body",
          type: "textarea",
          defaultValue:
            "With over 15 years of experience in commercial real estate and land planning, I bring unparalleled market knowledge and a proven track record of success.",
        },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
        },
        {
          name: "points",
          type: "array",
          fields: [
            {
              name: "icon",
              type: "select",
              options: [...SERVICE_ICONS],
              defaultValue: "Award",
            },
            { name: "title", type: "text", required: true },
            { name: "description", type: "textarea", required: true },
          ],
          defaultValue: [
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
      ],
    },
    {
      name: "finalCta",
      type: "group",
      label: "Final CTA",
      fields: [
        {
          name: "heading",
          type: "text",
          defaultValue: "Ready to Make Your Next Move?",
        },
        {
          name: "body",
          type: "textarea",
          defaultValue:
            "Let's discuss your commercial real estate goals and find the perfect solution.",
        },
        {
          name: "primaryLabel",
          type: "text",
          defaultValue: "Browse Properties",
        },
        {
          name: "secondaryLabel",
          type: "text",
          defaultValue: "Schedule a Consultation",
        },
      ],
    },
  ],
};
