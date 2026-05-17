import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Square, DollarSign, Building2 } from "lucide-react";
import { listPublicDeals } from "@/lib/zoho/deals";
import { listListingPhotos } from "@/lib/zoho/photos";
import type { Listing } from "@/lib/zoho/types";
import { getSiteSettings } from "@/lib/payload/queries";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Properties",
  description: "Current commercial real estate listings.",
};

type DisplayStatus = "For Sale" | "For Lease" | "Sold" | "Leased";

function deriveStatus(listing: Listing): DisplayStatus {
  return listing.listingType === "lease" ? "For Lease" : "For Sale";
}

function statusClass(status: DisplayStatus) {
  switch (status) {
    case "For Sale":
      return "bg-primary text-primary-foreground";
    case "For Lease":
      return "bg-blue-600 text-white";
    default:
      return "bg-gray-500 text-white";
  }
}

function formatPriceShort(price: number | null, status: DisplayStatus) {
  if (price == null) return "Contact";
  if (status === "For Lease") return `$${price.toLocaleString()}/mo`;
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(2)}M`;
  return `$${price.toLocaleString()}`;
}

function formatSize(listing: Listing) {
  if (listing.lotSize != null) return `${listing.lotSize} AC`;
  return "Size TBD";
}

export default async function PropertiesPage() {
  const settings = await getSiteSettings();
  let listings: Listing[] = [];
  let zohoError: string | null = null;
  try {
    listings = await listPublicDeals();
  } catch (err) {
    console.error("[/properties] listPublicDeals failed:", err);
    zohoError = err instanceof Error ? err.message : "Could not load listings.";
  }

  const thumbs = await Promise.all(
    listings.map(async (l) => {
      try {
        const photos = await listListingPhotos(l.id);
        return [l.id, photos[0]?.fileId ?? null] as const;
      } catch (err) {
        console.error(`[/properties] listListingPhotos(${l.id}) failed:`, err);
        return [l.id, null] as const;
      }
    }),
  );
  const thumbMap = new Map(thumbs);

  return (
    <div>
      {/* Hero */}
      <section className="bg-foreground text-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Current Listings</h1>
          <p className="text-xl text-background/80">
            Explore our portfolio of premium commercial properties
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {zohoError ? (
            <p className="rounded-xl border border-border bg-muted/30 p-6 text-muted-foreground">
              Listings temporarily unavailable. Please try again shortly.
            </p>
          ) : listings.length === 0 ? (
            <p className="text-muted-foreground">
              No active listings right now. Check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {listings.map((listing) => {
                const status = deriveStatus(listing);
                const thumb = thumbMap.get(listing.id);
                return (
                  <Link
                    key={listing.id}
                    href={`/properties/${listing.slug}`}
                    className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <div className="relative h-64 overflow-hidden bg-muted">
                      {thumb ? (
                        <Image
                          src={`/api/listings/${listing.id}/photos/${thumb}`}
                          alt={listing.name}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <Building2 className="w-10 h-10" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span
                          className={`${statusClass(status)} px-3 py-1 rounded-full text-sm font-medium`}
                        >
                          {status}
                        </span>
                      </div>
                      {listing.propertyUse && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-foreground/90 text-background px-3 py-1 rounded-full text-sm font-medium">
                            {listing.propertyUse}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="font-semibold text-xl mb-2 group-hover:text-primary transition-colors">
                        {listing.name}
                      </h3>
                      <div className="flex items-start gap-2 text-muted-foreground mb-4">
                        <MapPin className="w-4 h-4 flex-shrink-0 mt-1" />
                        <span className="text-sm">
                          {[listing.street, listing.city, listing.state].filter(Boolean).join(", ") ||
                            "Address available on request"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-primary" />
                          <div>
                            <div className="text-sm text-muted-foreground">Price</div>
                            <div className="font-semibold">
                              {formatPriceShort(listing.price, status)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Square className="w-5 h-5 text-primary" />
                          <div>
                            <div className="text-sm text-muted-foreground">Size</div>
                            <div className="font-semibold">{formatSize(listing)}</div>
                          </div>
                        </div>
                      </div>

                      {listing.description && (
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {listing.description}
                        </p>
                      )}

                      <div className="mt-4 text-primary font-medium group-hover:underline">
                        View Details →
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Building2 className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Looking for Something Specific?</h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            I have access to exclusive off-market properties and can help you find exactly what you need.
          </p>
          <a
            href={`mailto:${settings.contact.email}`}
            className="inline-block bg-background text-foreground px-8 py-4 rounded-lg hover:bg-background/90 transition-colors"
          >
            Contact Me
          </a>
        </div>
      </section>
    </div>
  );
}
