/** @type {import('next').NextConfig} */
// const nextConfig = {reactStrictMode: false}

// module.exports = nextConfig

module.exports = {experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  }, reactStrictMode: false}
