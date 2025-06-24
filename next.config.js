/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  swcMinify: false,
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    // Ignore specific modules that are Node.js-only and cause issues in browser builds.
    // `ws` (used by @walletconnect/socket-transport) has optional dependencies
    // `bufferutil` and `utf-8-validate` which are native modules.
    // These are not needed for the browser and `ws` has JS fallbacks.
    if (!isServer) {
      config.externals.push('bufferutil', 'utf-8-validate');
    }

    return config;
  }
};

module.exports = nextConfig;
