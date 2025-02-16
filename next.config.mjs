import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Disable webpack caching
    config.cache = false;
    return config;
  },
  experimental: {
    // Optimize large packages
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      '@heroicons/react',
      '@tremor/react'
    ]
  },
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'images.unsplash.com',
      port: '',
      pathname: '/**'
    }, {
      protocol: 'https',
      hostname: 'seo-heist.s3.amazonaws.com',
      port: '',
      pathname: '/**'
    }, {
      protocol: 'https',
      hostname: 'github.com',
      port: '',
      pathname: '/**'
    }, {
      protocol: 'https',
      hostname: 'ansubkhan.com',
      port: '',
      pathname: '/**'
    }, {
      protocol: 'https',
      hostname: 'utfs.io',
      port: '',
      pathname: '/**'
    }, {
      protocol: 'https',
      hostname: 'pbs.twimg.com',
      port: '',
      pathname: '/**'
    }, {
      protocol: 'https',
      hostname: 'i1.rgstatic.net',
      port: '',
      pathname: '/**'
    }, {
      protocol: 'https',
      hostname: 'media.licdn.com',
      port: '',
      pathname: '/**'
    }, {
      protocol: 'https',
      hostname: 'holocron.so',
      port: '',
      pathname: '/**'
    }, {
      protocol: 'https',
      hostname: 'scholar.googleusercontent.com',
      port: '',
      pathname: '/**'
    }]
  }
};

export default withMDX(nextConfig);