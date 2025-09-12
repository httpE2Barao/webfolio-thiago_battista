import type { NextConfig } from "next";
import { EventEmitter } from 'events';

// Increase MaxListeners limit
EventEmitter.defaultMaxListeners = 15;

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost'], // Add any external image domains if needed
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    unoptimized: true,
  },
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  reactStrictMode: true,
  eslint: {
      ignoreDuringBuilds: true,
    },
  webpack: (config, { isServer }) => {
    // Fix for Swiper vendor chunks issue
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization?.splitChunks,
          chunks: 'all',
          cacheGroups: {
            swiper: {
              test: /[\\/]node_modules[\\/]swiper[\\/]/,
              name: 'swiper',
              chunks: 'all',
              priority: 20,
            },
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
