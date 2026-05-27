import type { NextConfig } from "next";
import path from "node:path";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const skipLanding = process.env.SKIP_LANDING === "true";

const nextConfig: NextConfig = {
  output: "standalone",
  // Pin the workspace root to the monorepo. Without this, Next.js infers the
  // root from the nearest lockfile and can wander up to a stray lockfile in
  // a parent directory (e.g. the user's home folder).
  outputFileTracingRoot: path.join(__dirname, "../.."),
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
