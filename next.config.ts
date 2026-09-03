import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable server components
  experimental: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.finqu.dev',
      },
      {
        protocol: 'https',
        hostname: '**.finqu.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
