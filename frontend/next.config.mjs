/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/items',
        destination: 'http://localhost:8080/api/items',
      },
      {
        source: '/api/items/cantidad',
        destination: 'http://localhost:8080/api/items/cantidad',
      },
    ];
  },
};

export default nextConfig;
