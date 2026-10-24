/** @type {import('next').NextConfig} */
const nextConfig = {
  env: { NEXT_PUBLIC_BUILD: (process.env.VERCEL_GIT_COMMIT_SHA || '').slice(0, 7) },
  // Old duplicate help pages now live in the Help Center.
  async redirects() {
    return [
      { source: '/faq', destination: '/help/faq', permanent: true },
      { source: '/how-to-play', destination: '/help/getting-started', permanent: true },
      { source: '/guide', destination: '/help', permanent: true },
      { source: '/register', destination: 'https://tqak.vercel.app/login?mode=up', permanent: false },
      { source: '/sign-up', destination: 'https://tqak.vercel.app/login?mode=up', permanent: false },
      { source: '/signup', destination: 'https://tqak.vercel.app/login?mode=up', permanent: false },
      { source: '/create-account', destination: 'https://tqak.vercel.app/login?mode=up', permanent: false },

    ];
  },
};
module.exports = nextConfig;
