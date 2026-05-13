import type { Metadata } from "next";
import Image from "next/image";
import { GraduationCap, Award, Phone, Mail } from "lucide-react";
import { getAboutPage, getSiteSettings } from "@/lib/payload/queries";
import { mediaUrl } from "@/lib/payload/defaults";
import { getIcon } from "@/components/icon-map";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About",
  description: "About Matt Sprung — commercial real estate broker and land planner.",
};

export default async function AboutPage() {
  const [about, settings] = await Promise.all([getAboutPage(), getSiteSettings()]);
  const portrait = mediaUrl(about.hero.portrait, "card");

  return (
    <div>
      {/* Hero */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {portrait && (
              <div className="relative h-96 lg:h-[500px] rounded-xl overflow-hidden">
                <Image
                  src={portrait}
                  alt={about.hero.heading}
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                  unoptimized={portrait.startsWith("http")}
                />
              </div>
            )}
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">{about.hero.heading}</h1>
              {about.hero.paragraphs.map((p, idx) => (
                <p key={idx} className="text-lg text-muted-foreground mb-6">
                  {p.text}
                </p>
              ))}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={settings.contact.phoneHref}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  {settings.contact.phone}
                </a>
                <a
                  href={`mailto:${settings.contact.email}`}
                  className="bg-foreground text-background px-6 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Email Me
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{about.expertise.heading}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {about.expertise.subheading}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {about.expertise.areas.map((area, idx) => {
              const Icon = getIcon(area.icon);
              return (
                <div
                  key={`${area.title}-${idx}`}
                  className="bg-card border border-border rounded-xl p-8"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{area.title}</h3>
                  <ul className="space-y-2">
                    {area.items.map((it, i) => (
                      <li key={i} className="text-muted-foreground flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        {it.text}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <GraduationCap className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{about.credentials.heading}</h2>
            <p className="text-xl text-primary-foreground/90">{about.credentials.subheading}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {about.credentials.items.map((c, idx) => (
              <div
                key={idx}
                className="bg-primary-foreground/10 rounded-lg p-6 border border-primary-foreground/20"
              >
                <div className="flex items-start gap-3">
                  <Award className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <span>{c.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
            {about.philosophy.heading}
          </h2>
          <div className="space-y-6 text-lg text-muted-foreground">
            {about.philosophy.points.map((pt, idx) => (
              <p key={idx}>
                <span className="font-semibold text-foreground">{pt.label}:</span> {pt.body}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{about.cta.heading}</h2>
          <p className="text-xl text-muted-foreground mb-8">{about.cta.body}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={settings.contact.phoneHref}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-lg hover:opacity-90 transition-opacity"
            >
              Call Now
            </a>
            <a
              href={`mailto:${settings.contact.email}`}
              className="bg-foreground text-background px-8 py-4 rounded-lg hover:opacity-90 transition-opacity"
            >
              Send Email
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
