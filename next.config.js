// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Ensure JSON files are parsed correctly
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    });
    
    return config;
  },
  
  // If using i18n
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  
  // Enable strict mode for better error detection
  reactStrictMode: true,
  
  // Transpile packages if needed
  transpilePackages: ['clsx', 'tailwind-merge'],
};

module.exports = nextConfig;
