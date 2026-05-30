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
      bodySizeLimit: "25mb",
    },
    // The proxy (middleware) buffers request bodies for every matched route,
    // capped at 10MB by default. Admin product uploads POST image files through
    // it, so a large photo would be truncated and fail multipart parsing. Raise
    // the cap to match the server-action limit. Images are also downscaled in
    // the browser before upload, so payloads normally stay well under this.
    proxyClientMaxBodySize: "25mb",
  },
};

export default nextConfig;
