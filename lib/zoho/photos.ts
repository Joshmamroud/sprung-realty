import "server-only";
import { unstable_cache } from "next/cache";
import { zohoFetch } from "./rest";

export type ListingPhoto = {
  fileId: string;
  fileName: string | null;
  size: number | null;
  sequence: number;
};

type DealResponse = {
  data?: Array<{
    Listing_Photos?: Array<{
      File_Id__s?: string;
      File_Name__s?: string | null;
      Size__s?: number | null;
      Sequence_Number__s?: number | null;
    }> | null;
  }>;
};

export async function fetchListingPhotos(dealId: string): Promise<ListingPhoto[]> {
  const data = await zohoFetch<DealResponse>(
    `/crm/v8/Deals/${dealId}?fields=Listing_Photos`,
  );
  const photos = data?.data?.[0]?.Listing_Photos ?? [];
  return photos
    .filter((p) => typeof p.File_Id__s === "string" && p.File_Id__s.length > 0)
    .sort((a, b) => (a.Sequence_Number__s ?? 0) - (b.Sequence_Number__s ?? 0))
    .map((p) => ({
      fileId: p.File_Id__s as string,
      fileName: p.File_Name__s ?? null,
      size: p.Size__s ?? null,
      sequence: p.Sequence_Number__s ?? 0,
    }));
}

export function listListingPhotos(dealId: string) {
  return unstable_cache(
    () => fetchListingPhotos(dealId),
    ["zoho:listing-photos", dealId],
    { revalidate: 300, tags: [`zoho:listing-photos:${dealId}`] },
  )();
}
