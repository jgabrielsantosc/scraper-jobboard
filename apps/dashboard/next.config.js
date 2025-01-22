/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: require('path').join(__dirname, '../../'),
  },
  transpilePackages: ['@job-scraper/shared'], // caso tenha packages compartilhados
}

module.exports = nextConfig 