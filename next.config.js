const withPWA = require("@ducanh2912/next-pwa").default({
    dest: "public",
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    swcMinify: true,
    disable: process.env.NODE_ENV === "development",
    workboxOptions: {
      disableDevLogs: true,
    },
    // ... other options you like
  });
  
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    // ... other options you like
  };
  
  module.exports = withPWA(nextConfig);  