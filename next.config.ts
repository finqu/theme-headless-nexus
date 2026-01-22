import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable server components
  experimental: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.finqu.dev',
        port: '',
        search: '',
      },
    ],
  }
};

export default nextConfig;
