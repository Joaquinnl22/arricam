const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/items',
        destination: 'https://arricam.onrender.com/api/items',
      },
      {
        source: '/api/items/:path*',
        destination: 'https://arricam.onrender.com/api/items/:path*',
      },
    ];
  },
};

export default nextConfig;