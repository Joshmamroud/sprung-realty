import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob';
import sharp from 'sharp';

import { Media } from './lib/payload/collections/Media.ts';
import { SiteSettings } from './lib/payload/globals/SiteSettings.ts';
import { HomePage } from './lib/payload/globals/HomePage.ts';
import { AboutPage } from './lib/payload/globals/AboutPage.ts';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'REPLACE_ME_IN_PROD',
  admin: {
    user: 'users',
    meta: {
      titleSuffix: ' — Matt Sprung CRE',
    },
  },
  editor: lexicalEditor(),
  collections: [
    {
      slug: 'users',
      auth: true,
      admin: { useAsTitle: 'email' },
      fields: [],
    },
    Media,
  ],
  globals: [SiteSettings, HomePage, AboutPage],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
  sharp,
});
