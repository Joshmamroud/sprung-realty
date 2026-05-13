import type { GlobalConfig } from "payload";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site Settings",
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "brand",
      type: "group",
      fields: [
        { name: "name", type: "text", required: true, defaultValue: "Matt Sprung" },
        {
          name: "tagline",
          type: "text",
          required: true,
          defaultValue: "Commercial Real Estate & Land Planning",
        },
      ],
    },
    {
      name: "contact",
      type: "group",
      fields: [
        { name: "phone", type: "text", required: true, defaultValue: "(123) 456-7890" },
        {
          name: "phoneHref",
          type: "text",
          required: true,
          defaultValue: "tel:+1234567890",
          admin: { description: "tel: link target, e.g. tel:+15551234567" },
        },
        { name: "email", type: "email", required: true, defaultValue: "matt@sprungproperties.com" },
        { name: "licenseNumber", type: "text", defaultValue: "RE123456" },
      ],
    },
    {
      name: "footer",
      type: "group",
      fields: [
        {
          name: "tagline",
          type: "text",
          defaultValue: "Commercial Real Estate Broker & Land Planner",
        },
      ],
    },
  ],
};
