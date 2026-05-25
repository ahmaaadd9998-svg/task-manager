import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.8.106'],
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
