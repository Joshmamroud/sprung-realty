import Link from "next/link";
import { Building2 } from "lucide-react";

const NAV = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About" },
  { path: "/properties", label: "Properties" },
];

type Props = {
  brandName: string;
  footerTagline: string;
  phone: string;
  email: string;
  licenseNumber?: string;
};

export function SiteFooter({ brandName, footerTagline, phone, email, licenseNumber }: Props) {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="font-semibold text-lg">{brandName}</div>
            </div>
            <p className="text-background/70 text-sm">{footerTagline}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              {NAV.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className="block text-background/70 hover:text-background text-sm transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <div className="space-y-2 text-sm text-background/70">
              <p>Phone: {phone}</p>
              <p>Email: {email}</p>
              {licenseNumber && <p>License #: {licenseNumber}</p>}
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 mt-8 pt-8 text-center text-sm text-background/70">
          © {new Date().getFullYear()} {brandName} Commercial Real Estate. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
