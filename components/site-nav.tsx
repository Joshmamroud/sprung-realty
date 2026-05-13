"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Menu, X } from "lucide-react";
import { useState } from "react";

const NAV = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About" },
  { path: "/properties", label: "Properties" },
];

type Props = {
  brandName: string;
  brandTagline: string;
  phone: string;
  phoneHref: string;
};

export function SiteNav({ brandName, brandTagline, phone, phoneHref }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <div className="font-semibold text-xl text-foreground">{brandName}</div>
              <div className="text-sm text-muted-foreground">{brandTagline}</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`transition-colors ${
                  isActive(item.path)
                    ? "text-primary font-medium"
                    : "text-foreground hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <a
              href={phoneHref}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
              aria-label={`Call ${phone}`}
            >
              Contact
            </a>
          </nav>

          <button
            type="button"
            className="md:hidden p-2"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {open && (
          <nav className="md:hidden py-4 border-t border-border">
            {NAV.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setOpen(false)}
                className={`block py-3 transition-colors ${
                  isActive(item.path)
                    ? "text-primary font-medium"
                    : "text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <a
              href={phoneHref}
              className="block bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-center mt-4"
            >
              Contact
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
