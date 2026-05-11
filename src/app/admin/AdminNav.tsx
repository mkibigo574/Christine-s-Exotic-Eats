"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { SignOutButton } from "./SignOutButton";

type Item = { href: string; label: string; icon: ReactNode; badge?: number };

export function AdminNav({
  userEmail,
  newInquiriesCount,
}: {
  userEmail: string;
  newInquiriesCount: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items: Item[] = [
    { href: "/admin", label: "Overview", icon: <IconHome /> },
    {
      href: "/admin/inbox",
      label: "Inbox",
      icon: <IconInbox />,
      badge: newInquiriesCount > 0 ? newInquiriesCount : undefined,
    },
    { href: "/admin/products", label: "Products", icon: <IconBox /> },
    { href: "/admin/reviews", label: "Reviews", icon: <IconStar /> },
    { href: "/admin/gallery", label: "Gallery", icon: <IconImage /> },
  ];

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-5 py-3 bg-[var(--color-paper)]/90 backdrop-blur border-b border-[var(--color-line)]">
        <Link
          href="/admin"
          className="font-display text-lg text-[var(--color-wine-deep)] tracking-tight"
        >
          Christine&rsquo;s <span className="italic">Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="p-2 rounded-full hover:bg-[var(--color-cream-dark)]/60"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>
      </div>

      {/* Mobile backdrop */}
      {open ? (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-[var(--color-wine-deep)]/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      ) : null}

      {/* Sidebar */}
      <aside
        className={
          "fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-[var(--color-paper)] border-r border-[var(--color-line)] transition-transform duration-300 ease-out " +
          (open ? "translate-x-0" : "-translate-x-full") +
          " lg:translate-x-0"
        }
      >
        {/* Gold spine accent */}
        <div
          aria-hidden
          className="absolute top-0 right-0 h-full w-px"
          style={{
            background:
              "linear-gradient(to bottom, transparent, var(--color-gold-light) 20%, var(--color-gold) 50%, var(--color-gold-light) 80%, transparent)",
            opacity: 0.4,
          }}
        />

        {/* Brand */}
        <div className="px-6 pt-8 pb-6 border-b border-[var(--color-line)]">
          <div className="text-overline">Christine&rsquo;s</div>
          <div className="font-display text-3xl text-[var(--color-wine-deep)] leading-none mt-1">
            Admin
          </div>
          <Link
            href="/"
            className="mt-3 inline-flex items-center gap-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-wine)] transition"
          >
            <span>View site</span>
            <span aria-hidden>→</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 overflow-y-auto">
          <div className="text-overline px-3 pb-2">Manage</div>
          <ul className="space-y-1">
            {items.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition relative " +
                      (active
                        ? "bg-[color-mix(in_srgb,var(--color-wine)_8%,transparent)] text-[var(--color-wine-deep)]"
                        : "text-[var(--color-ink-soft)] hover:bg-[var(--color-cream-dark)]/40 hover:text-[var(--color-wine-deep)]")
                    }
                  >
                    {/* Active indicator */}
                    <span
                      aria-hidden
                      className={
                        "absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full transition-all " +
                        (active
                          ? "bg-[var(--color-gold)] opacity-100"
                          : "bg-[var(--color-gold)] opacity-0 group-hover:opacity-40")
                      }
                    />
                    <span
                      className={
                        "shrink-0 transition " +
                        (active
                          ? "text-[var(--color-wine)]"
                          : "text-[var(--color-muted)] group-hover:text-[var(--color-wine)]")
                      }
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge ? (
                      <span className="text-[10px] font-medium tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-wine)] text-[var(--color-cream-soft)]">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User pill */}
        <div className="px-4 pb-5 pt-3 border-t border-[var(--color-line)]">
          <div className="rounded-2xl bg-[var(--color-cream-soft)] border border-[var(--color-cream-dark)] px-4 py-3 flex items-center gap-3">
            <div
              aria-hidden
              className="h-9 w-9 rounded-full grid place-items-center font-display text-base text-[var(--color-cream-soft)]"
              style={{
                background:
                  "linear-gradient(160deg, var(--color-wine), var(--color-wine-deep))",
              }}
            >
              {(userEmail[0] ?? "A").toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Signed in
              </div>
              <div className="text-xs text-[var(--color-ink-soft)] truncate">{userEmail}</div>
            </div>
          </div>
          <div className="mt-3 px-1">
            <SignOutButton />
          </div>
        </div>
      </aside>
    </>
  );
}

function IconHome() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
    </svg>
  );
}

function IconInbox() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7" />
      <path d="M3 13h5l1.5 2.5h5L16 13h5v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" />
      <path d="M3 7.5 12 12l9-4.5" />
      <path d="M12 12v9" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3 2.6 5.6 6 .8-4.4 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1L3.3 9.4l6-.8z" />
    </svg>
  );
}

function IconImage() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="m21 16-5-5-8 8" />
    </svg>
  );
}
