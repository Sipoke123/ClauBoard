/**
 * API base URL.
 * - In dev: http://localhost:3001 (direct to Express)
 * - In production/Docker: empty string (relative URL, proxied by Next.js rewrites)
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? (
  typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? ""
    : "http://localhost:3001"
);
