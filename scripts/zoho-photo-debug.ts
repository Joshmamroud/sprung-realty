import { zohoFetchStream } from "../lib/zoho/rest";
import { fetchListingPhotos } from "../lib/zoho/photos";
import { fetchListings } from "../lib/zoho/deals";

async function main() {
  const listings = await fetchListings();
  if (listings.length === 0) throw new Error("no listings");
  const photos = await fetchListingPhotos(listings[0].id);
  if (photos.length === 0) throw new Error("no photos");

  const photo = photos[0];
  console.log("photo:", photo);

  const path = `/crm/v8/files?id=${photo.fileId}`;
  console.log("\nfetching:", path);
  const upstream = await zohoFetchStream(path);
  console.log("status:", upstream.status);
  console.log("headers:");
  upstream.headers.forEach((v, k) => console.log(`  ${k}: ${v}`));

  if (upstream.body && upstream.status < 400) {
    let bytes = 0;
    const reader = upstream.body.getReader();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.length;
    }
    console.log("body bytes:", bytes);
  } else if (upstream.body) {
    const text = await new Response(upstream.body).text();
    console.log("body:", text);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
