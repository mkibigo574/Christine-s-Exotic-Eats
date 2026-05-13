"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Item = { href: string; label: string };

export function MobileMenu({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu-drawer"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-paper)]/80 text-[var(--color-wine-dark)] active:scale-95 transition"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          {open ? (
            <path
              d="M6 6l12 12M18 6l-12 12"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          ) : (
            <>
              <path d="M4 7h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              <path d="M4 12h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              <path d="M4 17h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-[rgba(42,16,20,0.45)] backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <div
        id="mobile-menu-drawer"
        role="dialog"
        aria-modal="true"
        className={`fixed top-[72px] inset-x-0 z-40 origin-top transition-transform duration-200 ${
          open ? "scale-y-100" : "scale-y-0 pointer-events-none"
        }`}
      >
        <nav className="mx-3 mt-2 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper)] shadow-[var(--shadow-deep)] overflow-hidden">
          <ul className="divide-y divide-[var(--color-line)]">
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center justify-between px-5 py-4 text-base font-display transition ${
                      active
                        ? "text-[var(--color-wine-deep)] bg-[var(--color-cream-soft)]"
                        : "text-[var(--color-ink)] hover:bg-[var(--color-cream-soft)]"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span aria-hidden className="text-[var(--color-gold-deep)]">→</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="p-4 bg-[var(--color-cream-soft)] border-t border-[var(--color-line)]">
            <Link href="/inquire" className="btn-primary w-full justify-center">
              Send an enquiry
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
