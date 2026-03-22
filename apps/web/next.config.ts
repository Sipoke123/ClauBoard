import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const skipLanding = process.env.SKIP_LANDING === "true";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@repo/shared"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
  async redirects() {
    if (!skipLanding) return [];
    return [
      {
        source: "/",
        destination: "/office",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
