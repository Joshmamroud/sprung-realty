import Link from "next/link";
import Image from "next/image";
import { Phone } from "lucide-react";
import { getHomePage, getSiteSettings } from "@/lib/payload/queries";
import { mediaUrl } from "@/lib/payload/defaults";
import { getIcon } from "@/components/icon-map";

export const revalidate = 60;

export default async function HomePage() {
  const [home, settings] = await Promise.all([getHomePage(), getSiteSettings()]);
  const heroImg = mediaUrl(home.hero.backgroundImage, "hero");
  const whyImg = mediaUrl(home.whyChoose.image, "card");

  return (
    <div>
      <section className="relative bg-foreground text-background py-24 lg:py-32 overflow-hidden">
        {heroImg && (
          <div className="absolute inset-0 opacity-10">
            <Image
              src={heroImg}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
              unoptimized={heroImg.startsWith("http")}
            />
          </div>
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">{home.hero.title}</h1>
            <p className="text-xl sm:text-2xl text-background/80 mb-8">{home.hero.subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/properties"
                className="bg-primary text-primary-foreground px-8 py-4 rounded-lg text-center hover:opacity-90 transition-opacity"
              >
                {home.hero.primaryCtaLabel ?? "View Properties"}
              </Link>
              <a
                href={settings.contact.phoneHref}
                className="bg-background text-foreground px-8 py-4 rounded-lg text-center hover:bg-background/90 transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                {settings.contact.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {home.stats.length > 0 && (
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {home.stats.map((s, idx) => (
                <div key={`${s.label}-${idx}`} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold mb-2">{s.value}</div>
                  <div className="text-primary-foreground/80">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{home.services.heading}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {home.services.subheading}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {home.services.items.map((s, idx) => {
              const Icon = getIcon(s.icon);
              return (
                <div
                  key={`${s.title}-${idx}`}
                  className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-shadow"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{s.title}</h3>
                  <p className="text-muted-foreground">{s.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">{home.whyChoose.heading}</h2>
              <p className="text-lg text-muted-foreground mb-6">{home.whyChoose.body}</p>
              <div className="space-y-4">
                {home.whyChoose.points.map((p, idx) => {
                  const Icon = getIcon(p.icon);
                  return (
                    <div key={`${p.title}-${idx}`} className="flex items-start gap-3">
                      <Icon className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold mb-1">{p.title}</h4>
                        <p className="text-muted-foreground">{p.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link
                href="/about"
                className="inline-block mt-8 text-primary hover:underline font-medium"
              >
                Learn more about my experience →
              </Link>
            </div>
            {whyImg && (
              <div className="relative h-96 lg:h-full min-h-[400px] rounded-xl overflow-hidden">
                <Image
                  src={whyImg}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                  unoptimized={whyImg.startsWith("http")}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{home.finalCta.heading}</h2>
          <p className="text-xl text-primary-foreground/90 mb-8">{home.finalCta.body}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/properties"
              className="bg-background text-foreground px-8 py-4 rounded-lg hover:bg-background/90 transition-colors"
            >
              {home.finalCta.primaryLabel}
            </Link>
            <a
              href={`mailto:${settings.contact.email}`}
              className="bg-primary-foreground/10 text-primary-foreground px-8 py-4 rounded-lg hover:bg-primary-foreground/20 transition-colors border border-primary-foreground/20"
            >
              {home.finalCta.secondaryLabel}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
