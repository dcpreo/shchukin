"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV: { href: string; label: string }[] = [
  { href: "/archive", label: "Archive" },
  { href: "/family", label: "The Brothers" },
  { href: "/sergei", label: "Sergei" },
  { href: "/collection", label: "Collection" },
  { href: "/modern", label: "Modern Chapter" },
  { href: "/entities", label: "Entities" },
  { href: "/images", label: "Images" },
  { href: "/method", label: "Method" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/contact", label: "Contact" }
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ivory/90 backdrop-blur supports-[backdrop-filter]:bg-ivory/80">
      <div className="container-archive flex items-center justify-between gap-4 py-3">
        <Link href="/" className="group flex flex-col leading-none">
          <span className="font-serif text-lg font-medium tracking-tight text-ink">
            Shchukin <span className="text-oxblood">Collection Archive</span>
          </span>
          <span className="label mt-1">Shchukin Foundation · est. lineage 1818</span>
        </Link>

        <nav className="hidden lg:block" aria-label="Primary">
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`font-sans text-[0.8rem] tracking-wide transition-colors hover:text-oxblood ${
                    isActive(item.href)
                      ? "text-oxblood underline decoration-oxblood/40 underline-offset-4"
                      : "text-ink/80"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className="rounded-sm border border-line px-3 py-1.5 font-sans text-xs uppercase tracking-wide text-ink lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          className="border-t border-line bg-paper lg:hidden"
          aria-label="Primary mobile"
        >
          <ul className="container-archive grid grid-cols-2 gap-x-6 gap-y-2 py-4">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`font-sans text-sm ${
                    isActive(item.href) ? "text-oxblood" : "text-ink/80"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
