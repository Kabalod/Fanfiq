/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
}

// Only use bundle analyzer in development/analysis mode
if (process.env.ANALYZE === 'true') {
  try {
    const withBundleAnalyzer = require('@next/bundle-analyzer')({
      enabled: true,
    })
    module.exports = withBundleAnalyzer(nextConfig)
  } catch (error) {
    console.warn('Bundle analyzer not available, skipping...')
    module.exports = nextConfig
  }
} else {
  module.exports = nextConfig
}
