import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "./SignOutButton";

export const dynamic = "force-dynamic";

const navItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/inbox", label: "Inbox" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Login page renders within this layout but skips the chrome.
  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[var(--color-cream-soft)]">
      <header className="border-b border-[var(--color-line)] bg-[var(--color-paper)]">
        <div className="mx-auto max-w-6xl px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="font-display text-lg text-[var(--color-wine-deep)]">
              Christine&rsquo;s Admin
            </Link>
            <Link
              href="/"
              className="text-xs text-[var(--color-muted)] hover:text-[var(--color-wine)]"
            >
              View site →
            </Link>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-[var(--color-muted)]">{user.email}</span>
            <SignOutButton />
          </div>
        </div>
        <nav className="mx-auto max-w-6xl px-6 pb-3 flex flex-wrap gap-1 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 rounded-full text-[var(--color-ink-soft)] hover:bg-[var(--color-cream-dark)]/50 hover:text-[var(--color-wine-deep)] transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
