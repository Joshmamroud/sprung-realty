import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { MapPin, Square, DollarSign, Building2, Layers, ArrowLeft, Phone, Mail } from 'lucide-react';
import { getAllSlugs, getListingBySlug } from '@/lib/zoho/deals';
import { listListingPhotos } from '@/lib/zoho/photos';
import type { Listing } from '@/lib/zoho/types';
import { extractYouTubeId, youTubeEmbedUrl } from '@/lib/utils/youtube';
import { getSiteSettings } from '@/lib/payload/queries';

export const revalidate = 300;
export const dynamicParams = true;

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  try {
    const slugs = await getAllSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug).catch(() => null);
  if (!listing) return { title: 'Property not found' };
  const location = [listing.city, listing.state].filter(Boolean).join(', ');
  return {
    title: listing.name,
    description: listing.description?.slice(0, 160) ?? location,
  };
}

type DisplayStatus = 'For Sale' | 'For Lease' | 'Sold' | 'Leased';

function deriveStatus(listing: Listing): DisplayStatus {
  return listing.listingType === 'lease' ? 'For Lease' : 'For Sale';
}

function statusClass(status: DisplayStatus) {
  switch (status) {
    case 'For Sale':
      return 'bg-primary text-primary-foreground';
    case 'For Lease':
      return 'bg-blue-600 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
}

function formatPriceLong(price: number | null, status: DisplayStatus) {
  if (price == null) return 'Price on request';
  if (status === 'For Lease') return `$${price.toLocaleString()}/month`;
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(2)} Million`;
  return `$${price.toLocaleString()}`;
}

const PLACEHOLDER_FEATURES = ['Prime commercial location', 'Excellent visibility and access', 'Flexible use options', 'Broker tour available'];

export default async function PropertyDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const [listing, settings] = await Promise.all([
    getListingBySlug(slug).catch(() => null),
    getSiteSettings(),
  ]);
  if (!listing) notFound();

  const status = deriveStatus(listing);
  const fullAddress = [listing.street, listing.city, listing.state, listing.zip].filter(Boolean).join(', ');

  let photos: { fileId: string }[] = [];
  try {
    const all = await listListingPhotos(listing.id);
    photos = all.map((p) => ({ fileId: p.fileId }));
  } catch {
    photos = [];
  }
  const photoUrl = (id: string) => `/api/listings/${listing.id}/photos/${id}`;
  const videoId = extractYouTubeId(listing.videoUrl);

  return (
    <div>
      {/* Back */}
      <div className='bg-muted/30 py-4'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <Link href='/properties' className='inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors'>
            <ArrowLeft className='w-4 h-4' />
            Back to Listings
          </Link>
        </div>
      </div>

      {/* Gallery */}
      <section className='bg-background'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            <div className='relative h-96 lg:h-[500px] rounded-xl overflow-hidden bg-muted'>
              {photos[0] ? (
                <Image
                  src={photoUrl(photos[0].fileId)}
                  alt={listing.name}
                  fill
                  priority
                  sizes='(min-width: 1024px) 50vw, 100vw'
                  className='object-cover'
                  unoptimized
                />
              ) : (
                <div className='flex h-full items-center justify-center text-muted-foreground'>
                  <Building2 className='w-16 h-16' />
                </div>
              )}
            </div>
            {photos.length > 1 && (
              <div className='grid grid-cols-2 gap-4'>
                {photos.slice(1, 5).map((p, idx) => (
                  <div key={p.fileId} className='relative h-44 lg:h-60 rounded-xl overflow-hidden bg-muted'>
                    <Image
                      src={photoUrl(p.fileId)}
                      alt={`${listing.name} - Image ${idx + 2}`}
                      fill
                      sizes='(min-width: 1024px) 25vw, 50vw'
                      className='object-cover'
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Details */}
      <section className='bg-background pb-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            <div className='lg:col-span-2'>
              <div className='flex items-start justify-between mb-6'>
                <div>
                  <h1 className='text-3xl sm:text-4xl font-bold mb-2'>{listing.name}</h1>
                  <div className='flex items-center gap-2 text-muted-foreground'>
                    <MapPin className='w-5 h-5' />
                    <span>{fullAddress || 'Address available on request'}</span>
                  </div>
                </div>
              </div>

              <div className='flex flex-wrap gap-3 mb-8'>
                <span className={`${statusClass(status)} px-4 py-2 rounded-full font-medium`}>{status}</span>
                {listing.propertyUse && <span className='bg-muted text-foreground px-4 py-2 rounded-full font-medium'>{listing.propertyUse}</span>}
              </div>

              {/* Key Stats */}
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8 p-6 bg-muted/30 rounded-xl'>
                <div>
                  <div className='flex items-center gap-2 text-muted-foreground mb-2'>
                    <DollarSign className='w-5 h-5' />
                    <span className='text-sm'>Price</span>
                  </div>
                  <div className='font-bold text-xl'>{formatPriceLong(listing.price, status)}</div>
                </div>

                <div>
                  <div className='flex items-center gap-2 text-muted-foreground mb-2'>
                    <Square className='w-5 h-5' />
                    <span className='text-sm'>Lot Size</span>
                  </div>
                  <div className='font-bold text-xl'>{listing.lotSize != null ? `${listing.lotSize} AC` : '—'}</div>
                </div>

                <div>
                  <div className='flex items-center gap-2 text-muted-foreground mb-2'>
                    <Layers className='w-5 h-5' />
                    <span className='text-sm'>Parcel #</span>
                  </div>
                  <div className='font-bold text-xl'>{listing.parcelNumber ?? '—'}</div>
                </div>

                <div>
                  <div className='flex items-center gap-2 text-muted-foreground mb-2'>
                    <Building2 className='w-5 h-5' />
                    <span className='text-sm'>Status</span>
                  </div>
                  <div className='font-bold text-xl'>{listing.stage ?? 'Active'}</div>
                </div>
              </div>

              {/* Description */}
              <div className='mb-8'>
                <h2 className='text-2xl font-bold mb-4'>Property Description</h2>
                <p className='text-muted-foreground text-lg leading-relaxed whitespace-pre-line'>
                  {listing.description ??
                    'Full property description coming soon. Contact the agent for additional details, financials, and to schedule a private tour.'}
                </p>
              </div>

              {/* Features (placeholder) */}
              <div className='mb-8'>
                <h2 className='text-2xl font-bold mb-4'>Key Features</h2>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  {PLACEHOLDER_FEATURES.map((feature) => (
                    <div key={feature} className='flex items-start gap-3'>
                      <span className='mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0' />
                      <span className='text-muted-foreground'>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Details */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-card border border-border rounded-xl'>
                <div>
                  <div className='flex items-center gap-2 text-muted-foreground mb-1'>
                    <MapPin className='w-4 h-4' />
                    <span className='text-sm font-medium'>Address</span>
                  </div>
                  <div className='font-semibold'>{listing.street ?? '—'}</div>
                </div>

                <div>
                  <div className='flex items-center gap-2 text-muted-foreground mb-1'>
                    <Building2 className='w-4 h-4' />
                    <span className='text-sm font-medium'>City / State</span>
                  </div>
                  <div className='font-semibold'>{[listing.city, listing.state].filter(Boolean).join(', ') || '—'}</div>
                </div>

                <div>
                  <div className='flex items-center gap-2 text-muted-foreground mb-1'>
                    <Layers className='w-4 h-4' />
                    <span className='text-sm font-medium'>Property Use</span>
                  </div>
                  <div className='font-semibold'>{listing.propertyUse ?? '—'}</div>
                </div>

                <div>
                  <div className='flex items-center gap-2 text-muted-foreground mb-1'>
                    <Square className='w-4 h-4' />
                    <span className='text-sm font-medium'>Listing Type</span>
                  </div>
                  <div className='font-semibold capitalize'>{listing.listingType === 'unknown' ? '—' : listing.listingType}</div>
                </div>
              </div>

              {/* Video */}
              {videoId && (
                <div className='mx-auto py-8 mt-8'>
                  <div className='relative w-full aspect-video rounded-xl overflow-hidden bg-muted'>
                    <iframe
                      src={youTubeEmbedUrl(videoId)}
                      title={`${listing.name} — video tour`}
                      allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                      referrerPolicy='strict-origin-when-cross-origin'
                      allowFullScreen
                      loading='lazy'
                      className='absolute inset-0 w-full h-full border-0'
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Contact Aside */}
            <div className='lg:col-span-1'>
              <div className='sticky top-24 bg-card border border-border rounded-xl p-8'>
                <h3 className='text-xl font-bold mb-6'>Contact Agent</h3>

                <div className='flex items-center gap-4 mb-6 pb-6 border-b border-border'>
                  <div className='w-16 h-16 bg-primary rounded-full flex items-center justify-center'>
                    <Building2 className='w-8 h-8 text-primary-foreground' />
                  </div>
                  <div>
                    <div className='font-semibold text-lg'>{settings.brand.name}</div>
                    <div className='text-sm text-muted-foreground'>Commercial Real Estate Broker</div>
                  </div>
                </div>

                <div className='space-y-4 mb-6'>
                  <a href={settings.contact.phoneHref} className='flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors'>
                    <Phone className='w-5 h-5' />
                    <span>{settings.contact.phone}</span>
                  </a>
                  <a
                    href={`mailto:${settings.contact.email}`}
                    className='flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors'
                  >
                    <Mail className='w-5 h-5' />
                    <span>{settings.contact.email}</span>
                  </a>
                </div>

                <div className='space-y-3'>
                  <a
                    href={settings.contact.phoneHref}
                    className='block w-full bg-primary text-primary-foreground text-center py-3 rounded-lg hover:opacity-90 transition-opacity font-medium'
                  >
                    Call Now
                  </a>
                  <a
                    href={`mailto:${settings.contact.email}?subject=${encodeURIComponent(`Inquiry: ${listing.name}`)}`}
                    className='block w-full bg-foreground text-background text-center py-3 rounded-lg hover:opacity-90 transition-opacity font-medium'
                  >
                    Request Information
                  </a>
                </div>

                <div className='mt-6 pt-6 border-t border-border text-center'>
                  <p className='text-sm text-muted-foreground'>Schedule a private showing or request additional details about this property.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
