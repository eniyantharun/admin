/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.promotionalproductinc.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig