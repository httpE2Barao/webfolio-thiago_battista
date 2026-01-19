import { EventEmitter } from 'events';
import type { NextConfig } from "next";

// Increase MaxListeners limit
EventEmitter.defaultMaxListeners = 15;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // unoptimized removed to enable Next.js automatic image optimization
  },
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
