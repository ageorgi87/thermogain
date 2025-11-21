import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack is now default in Next.js 16
  // React Compiler support is built-in and automatic

  // Enable optimizations
  reactStrictMode: true,

  // Enable modern JavaScript features
  poweredByHeader: false,
};

export default nextConfig;
