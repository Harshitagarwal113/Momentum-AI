import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Highly recommended for Docker and Google Cloud Run deployments
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // Speeds up builds
  },
  typescript: {
    ignoreBuildErrors: true, // Managed separately via global pipelines
  },
};

export default nextConfig;
