/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['ipub.its.ac.id'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dev-my.its.ac.id',
        port: '',
        pathname: '/users/**',
      },
      {
        protocol: 'https',
        hostname: 'my.its.ac.id',
        port: '',
        pathname: '/users/**',
      },
    ],
  },
}

module.exports = nextConfig
