import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Christine's Exotic Eats — Darwin Catering",
    template: "%s · Christine's Exotic Eats",
  },
  description:
    "Darwin-based family-run catering. Grazing, sandwich, sweet, and fruit boxes for private and corporate events. Enlighten your tastebuds.",
  openGraph: {
    title: "Christine's Exotic Eats",
    description: "Darwin-based catering — boxes, grazing, and custom orders.",
    type: "website",
    locale: "en_AU",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Italiana&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
