import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  // Server-side only packages (don't bundle on client)
  serverExternalPackages: ['bcryptjs'],
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react', 'swiper'],
    esmExternals: true,
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 3,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 31536000,
    qualities: [50, 55, 60, 75, 85, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.optimization.minimize = true;
    }
    return config;
  },
  headers: async () => [
    {
      source: '/api/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'no-store' },
      ],
    },
    // Static assets: 1 year cache
    {
      source: '/static/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
    // Images: 1 week cache
    {
      source: '/images/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=604800, must-revalidate' },
      ],
    },
  ],
};

export default withNextIntl(nextConfig);
