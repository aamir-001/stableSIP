import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Your Next.js configuration options here
  env: {
    NEXT_PUBLIC_ETHERSCAN_API_KEY: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY,
  },
  // Add other Next.js config options here if needed
  // reactStrictMode: true,
  // swcMinify: true,
};

export default nextConfig;