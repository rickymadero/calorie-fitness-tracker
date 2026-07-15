import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the Cursor/VS Code Simple Browser (and local previews) to use
  // Fast Refresh / HMR without origin blocks during development.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  // Keep Fast Refresh behavior predictable for in-editor previews.
  reactStrictMode: true,
};

export default nextConfig;
