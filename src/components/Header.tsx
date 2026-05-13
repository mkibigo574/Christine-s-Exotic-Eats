import Link from "next/link";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

const nav = [
  { href: "/catalogue", label: "Catalogue" },
  { href: "/gallery", label: "Gallery" },
  { href: "/reviews", label: "Reviews" },
  { href: "/about", label: "About" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 glass border-b border-[var(--color-line)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 md:px-6 py-3 md:py-4">
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
            Send an enquiry
          </Link>
        </nav>
        <MobileMenu items={nav} />
      </div>
    </header>
  );
}
