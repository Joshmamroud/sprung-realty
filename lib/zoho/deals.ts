import 'server-only';
import { unstable_cache } from 'next/cache';
import * as ZOHOCRMSDK from '@zohocrm/typescript-sdk-8.0';
import { initZoho } from './client';
import { SELECT_FIELDS, ZohoFields, mapDealToListing, type Listing } from './types';

const LIST_LIMIT = 200;
const CACHE_TAG_LIST = 'zoho:listings';
const CACHE_REVALIDATE_SECONDS = 300;

export async function fetchListings(): Promise<Listing[]> {
  await initZoho();

  const select = SELECT_FIELDS.join(', ');
  const query = `SELECT ${select} FROM Deals WHERE ${ZohoFields.publishWebpage} = true ORDER BY ${ZohoFields.modifiedTime} DESC LIMIT ${LIST_LIMIT}`;

  const body = new ZOHOCRMSDK.Coql.BodyWrapper();
  body.setSelectQuery(query);

  const ops = new ZOHOCRMSDK.Coql.CoqlOperations();
  const response = await ops.getRecords(body);

  if (!response) return [];
  const status = response.getStatusCode();

  if (status === 204 || status === 304) return [];
  if (status >= 400) {
    const obj = response.getObject();
    const message =
      obj instanceof ZOHOCRMSDK.Coql.APIException
        ? (obj.getMessage()?.getValue() ?? `Zoho COQL error (status ${status})`)
        : `Zoho COQL error (status ${status})`;
    throw new Error(message);
  }

  const handler = response.getObject();
  if (handler instanceof ZOHOCRMSDK.Coql.ResponseWrapper) {
    return handler.getData().map(mapDealToListing);
  }
  if (handler instanceof ZOHOCRMSDK.Coql.APIException) {
    throw new Error(handler.getMessage()?.getValue() ?? 'Zoho COQL exception');
  }
  return [];
}

export const listPublicDeals = unstable_cache(fetchListings, ['zoho:listings:list'], {
  revalidate: CACHE_REVALIDATE_SECONDS,
  tags: [CACHE_TAG_LIST],
});

export async function getListingBySlug(slug: string): Promise<Listing | null> {
  const all = await listPublicDeals();
  return all.find((l) => l.slug === slug) ?? null;
}

export async function getAllSlugs(): Promise<string[]> {
  const all = await listPublicDeals();
  return all.map((l) => l.slug);
}

export const ZOHO_LISTINGS_TAG = CACHE_TAG_LIST;
