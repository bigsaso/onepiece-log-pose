/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/map-image/:path*',
        destination: 'https://i.redd.it/:path*',
      },
      {
        source: '/ship-going-merry/:path*',
        destination: 'https://wallpapers-clan.com/:path*',
      },
      {
        source: '/ship-thousand-sunny/:path*',
        destination: 'https://i.pinimg.com/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
