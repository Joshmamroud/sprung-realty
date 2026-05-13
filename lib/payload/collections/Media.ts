import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
  },
  upload: {
    mimeTypes: ["image/*"],
    imageSizes: [
      { name: "thumb", width: 480, height: undefined, position: "centre" },
      { name: "card", width: 960, height: undefined, position: "centre" },
      { name: "hero", width: 1920, height: undefined, position: "centre" },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      label: "Alt text",
    },
  ],
};
