import { fetchListings } from "../lib/zoho/deals";
import { fetchListingPhotos } from "../lib/zoho/photos";

async function main() {
  console.log("Fetching public deals...");
  const listings = await fetchListings();
  console.log(`Found ${listings.length} listing(s) with Publish_Webpage = true`);

  if (listings.length === 0) {
    console.log("\nNo listings to inspect. Confirm at least one Deal has Publish_Webpage = true.");
    return;
  }

  const sample = listings[0];
  console.log("\nFirst listing:");
  console.log(JSON.stringify(sample, null, 2));

  console.log("\nFetching Listing_Photos for first deal...");
  const photos = await fetchListingPhotos(sample.id);
  console.log(`Found ${photos.length} photo(s)`);
  if (photos[0]) console.log("First photo:", photos[0]);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\nSmoke test failed:", err?.message ?? err);
    if (err?.stack) console.error(err.stack);
    process.exit(1);
  });
