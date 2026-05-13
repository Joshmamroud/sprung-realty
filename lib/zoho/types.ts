import type { Record as ZohoRecord } from '@zohocrm/typescript-sdk-8.0/dist/core/com/zoho/crm/api/record/record';

export type ListingType = 'sale' | 'lease' | 'unknown';

export type Listing = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number | null;
  stage: string | null;
  listingType: ListingType;
  propertyUse: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  lotSize: number | null;
  parcelNumber: string | null;
  videoUrl: string | null;
  closingDate: string | null;
  modifiedTime: string | null;
};

const ZOHO_FIELDS = {
  name: 'Deal_Name',
  description: 'Description',
  amount: 'Amount',
  listingPrice: 'Listing_Price',
  stage: 'Stage',
  closingDate: 'Closing_Date',
  modifiedTime: 'Modified_Time',
  publishWebpage: 'Publish_Webpage',
  type: 'Type',
  use: 'Use',
  street: 'Property_Address_Street_Address',
  city: 'Property_Address_City',
  state: 'Property_Address_State_Province',
  zip: 'Property_Address_Zip_Postal_Code',
  country: 'Property_Address_Country_Region',
  lotSize: 'Lot_Size',
  parcelNumber: 'Parcel_Number',
  listingPhotos: 'Listing_Photos',
  videoUrl: 'Video_URL',
} as const;

export const ZohoFields = ZOHO_FIELDS;

export const SELECT_FIELDS: ReadonlyArray<string> = [
  'id',
  ZOHO_FIELDS.name,
  ZOHO_FIELDS.description,
  ZOHO_FIELDS.amount,
  ZOHO_FIELDS.listingPrice,
  ZOHO_FIELDS.stage,
  ZOHO_FIELDS.closingDate,
  ZOHO_FIELDS.modifiedTime,
  ZOHO_FIELDS.publishWebpage,
  ZOHO_FIELDS.type,
  ZOHO_FIELDS.use,
  ZOHO_FIELDS.street,
  ZOHO_FIELDS.city,
  ZOHO_FIELDS.state,
  ZOHO_FIELDS.zip,
  ZOHO_FIELDS.country,
  ZOHO_FIELDS.lotSize,
  ZOHO_FIELDS.parcelNumber,
  ZOHO_FIELDS.videoUrl,
];

function asString(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === 'string') return v.trim() || null;
  if (typeof v === 'number' || typeof v === 'bigint') return String(v);
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'object' && v !== null && 'name' in v) {
    const name = (v as { name?: unknown }).name;
    return typeof name === 'string' ? name : null;
  }
  return null;
}

function asNumber(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'bigint') return Number(v);
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function classifyListingType(raw: string | null): ListingType {
  if (!raw) return 'unknown';
  const v = raw.toLowerCase();
  if (v.includes('lease') || v.includes('rent')) return 'lease';
  if (v.includes('sale') || v.includes('sell')) return 'sale';
  return 'unknown';
}

export function slugify(name: string, id: string): string {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'listing';
  return `${base}-${id.slice(-8)}`;
}

export function extractIdFromSlug(slug: string): string | null {
  const m = slug.match(/-([a-z0-9]{4,})$/i);
  return m ? m[1] : null;
}

export function mapDealToListing(record: ZohoRecord): Listing {
  const id = String(record.getId());
  const get = (key: string) => record.getKeyValue(key);
  const name = asString(get(ZOHO_FIELDS.name)) ?? 'Untitled Listing';
  const listingType = classifyListingType(asString(get(ZOHO_FIELDS.type)));
  const price = asNumber(get(ZOHO_FIELDS.listingPrice)) ?? asNumber(get(ZOHO_FIELDS.amount));
  return {
    id,
    slug: slugify(name, id),
    name,
    description: asString(get(ZOHO_FIELDS.description)),
    price,
    stage: asString(get(ZOHO_FIELDS.stage)),
    listingType,
    propertyUse: asString(get(ZOHO_FIELDS.use)),
    street: asString(get(ZOHO_FIELDS.street)),
    city: asString(get(ZOHO_FIELDS.city)),
    state: asString(get(ZOHO_FIELDS.state)),
    zip: asString(get(ZOHO_FIELDS.zip)),
    country: asString(get(ZOHO_FIELDS.country)),
    lotSize: asNumber(get(ZOHO_FIELDS.lotSize)),
    parcelNumber: asString(get(ZOHO_FIELDS.parcelNumber)),
    videoUrl: asString(get(ZOHO_FIELDS.videoUrl)),
    closingDate: asString(get(ZOHO_FIELDS.closingDate)),
    modifiedTime: asString(get(ZOHO_FIELDS.modifiedTime)),
  };
}
