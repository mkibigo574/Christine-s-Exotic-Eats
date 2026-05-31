import Link from "next/link";
import Image from "next/image";
import { Ornament } from "./Ornament";

export function Footer() {
  return (
    <footer className="mt-20 md:mt-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <Ornament label="Christine's Exotic Eats" />
      </div>
      <div className="mt-10 md:mt-12 border-t border-[var(--color-line)] bg-[color-mix(in_srgb,var(--color-cream-dark)_55%,transparent)]">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 py-10 md:py-14 grid gap-10 md:gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Image
              src="/logo.png"
              alt="Christine's Exotic Eats — Enlighten your taste buds"
              width={446}
              height={140}
              className="h-16 md:h-20 w-auto select-none"
            />
            <p className="mt-5 text-sm text-[var(--color-muted)] max-w-sm leading-relaxed">
              Family-run catering in Darwin since December 2018. Fresh, locally sourced
              ingredients, cooked with love — for events large and small.
            </p>
          </div>

          <div>
            <h4 className="text-overline">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm text-[var(--color-ink-soft)]">
              <li><Link href="/catalogue" className="hover:text-[var(--color-wine)] transition">Catalogue</Link></li>
              <li><Link href="/gallery" className="hover:text-[var(--color-wine)] transition">Gallery</Link></li>
              <li><Link href="/reviews" className="hover:text-[var(--color-wine)] transition">Reviews</Link></li>
              <li><Link href="/about" className="hover:text-[var(--color-wine)] transition">About</Link></li>
              <li><Link href="/inquire" className="hover:text-[var(--color-wine)] transition">Send an enquiry</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-overline">Connect</h4>
            <ul className="mt-3 space-y-2 text-sm text-[var(--color-ink-soft)]">
              <li>Darwin, NT</li>
              <li>Pick-up · Zuccoli</li>
              <li><a href="#" className="hover:text-[var(--color-wine)] transition">Facebook</a></li>
              <li><a href="#" className="hover:text-[var(--color-wine)] transition">Instagram</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[var(--color-line)]">
          <div className="mx-auto max-w-6xl px-5 sm:px-6 py-5 text-xs text-[var(--color-muted)] flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <span>© {new Date().getFullYear()} Christine&rsquo;s Exotic Eats. All rights reserved.</span>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link href="/privacy" className="hover:text-[var(--color-wine)] transition">Privacy</Link>
              <Link href="/terms" className="hover:text-[var(--color-wine)] transition">Terms</Link>
              <span>Prices exclude GST unless stated.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
