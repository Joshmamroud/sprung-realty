import 'server-only';
import { unstable_cache } from 'next/cache';
import { getPayload } from './client';
import type { AboutPageDefaults, HomePageDefaults, SiteSettingsDefaults } from './defaults';
import { ABOUT_PAGE_DEFAULTS, HOME_PAGE_DEFAULTS, SITE_SETTINGS_DEFAULTS } from './defaults';

type GlobalSlug = 'site-settings' | 'home-page' | 'about-page';

async function safeGetGlobal<T>(slug: GlobalSlug, fallback: T): Promise<T> {
  try {
    if (!process.env.DATABASE_URL) return fallback;
    const payload = await getPayload();
    const result = (await payload.findGlobal({ slug, depth: 2 })) as unknown as T;
    return result ?? fallback;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[payload] global '${slug}' fetch failed, using defaults:`, (err as Error).message);
    }
    return fallback;
  }
}

export const getSiteSettings = unstable_cache(
  () => safeGetGlobal<SiteSettingsDefaults>('site-settings', SITE_SETTINGS_DEFAULTS),
  ['payload:site-settings'],
  { revalidate: 60, tags: ['payload:site-settings'] },
);

export const getHomePage = unstable_cache(() => safeGetGlobal<HomePageDefaults>('home-page', HOME_PAGE_DEFAULTS), ['payload:home-page'], {
  revalidate: 60,
  tags: ['payload:home-page'],
});

export const getAboutPage = unstable_cache(() => safeGetGlobal<AboutPageDefaults>('about-page', ABOUT_PAGE_DEFAULTS), ['payload:about-page'], {
  revalidate: 60,
  tags: ['payload:about-page'],
});
