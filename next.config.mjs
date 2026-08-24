/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  async redirects() {
    return [
      // Canonical bare rankings/category entry points can be added here as needed.
    ];
  },
};

export default nextConfig;
