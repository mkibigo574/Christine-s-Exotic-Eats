import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen grid place-items-center bg-[var(--color-cream-soft)] px-6 py-16">
      <div className="w-full max-w-md card p-10 grain">
        <div className="text-center">
          <span className="text-overline">Owner sign-in</span>
          <h1 className="mt-2 font-display heading-md text-[var(--color-wine-deep)]">
            Christine&rsquo;s Admin
          </h1>
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            Sign in to manage products, reviews, gallery, and enquiries.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
