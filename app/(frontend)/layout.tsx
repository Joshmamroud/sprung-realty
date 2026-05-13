import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { getSiteSettings } from "@/lib/payload/queries";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Matt Sprung — Commercial Real Estate", template: "%s | Matt Sprung" },
  description: "Commercial Real Estate Broker & Land Planner.",
};

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <SiteNav
          brandName={settings.brand.name}
          brandTagline={settings.brand.tagline}
          phone={settings.contact.phone}
          phoneHref={settings.contact.phoneHref}
        />
        <main className="flex-1">{children}</main>
        <SiteFooter
          brandName={settings.brand.name}
          footerTagline={settings.footer.tagline}
          phone={settings.contact.phone}
          email={settings.contact.email}
          licenseNumber={settings.contact.licenseNumber}
        />
      </body>
    </html>
  );
}
