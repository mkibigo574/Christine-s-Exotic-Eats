import Link from "next/link";
import { Logo } from "./Logo";

const nav = [
  { href: "/catalogue", label: "Catalogue" },
  { href: "/gallery", label: "Gallery" },
  { href: "/reviews", label: "Reviews" },
  { href: "/about", label: "About" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 glass border-b border-[var(--color-line)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="hover:opacity-90 transition" aria-label="Christine's Exotic Eats — home">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center gap-9">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link text-sm font-medium"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/inquire" className="btn-primary">
            Send an inquiry
          </Link>
        </nav>
        <Link href="/inquire" className="md:hidden btn-primary !px-4 !py-2 text-xs">
          Inquire
        </Link>
      </div>
    </header>
  );
}
