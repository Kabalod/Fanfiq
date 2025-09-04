/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  // Bundle analyzer только для development
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        // Можно добавить дополнительные webpack настройки здесь
      }
      return config;
    },
  }),
};

module.exports = nextConfig;