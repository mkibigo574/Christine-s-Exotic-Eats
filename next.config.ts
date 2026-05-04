import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Bypass the Next image optimizer: it does a DNS lookup of the upstream
    // host and rejects NAT64-mapped IPv6 addresses (used by Cloudflare on
    // IPv6-only / NAT64 networks) as "private", breaking Supabase image URLs.
    // Supabase's storage CDN already serves the originals efficiently.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "qrhisqxpgubyhsgsqobs.supabase.co" },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
