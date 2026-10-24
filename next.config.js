/** @type {import('next').NextConfig} */
const nextConfig = {
  // Old duplicate help pages now live in the Help Center.
  async redirects() {
    return [
      { source: '/faq', destination: '/help/faq', permanent: true },
      { source: '/how-to-play', destination: '/help/getting-started', permanent: true },
      { source: '/guide', destination: '/help', permanent: true },
    ];
  },
};
module.exports = nextConfig;
