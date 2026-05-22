import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'scontent.cdninstagram.com' },
      { protocol: 'https', hostname: '**.cdninstagram.com' },
      { protocol: 'https', hostname: '**.fbcdn.net' },
      { protocol: 'https', hostname: '**.instagram.com' },
      { protocol: 'https', hostname: 'lookaside.fbsbx.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
    ],
  },
  transpilePackages: ['antd', '@ant-design/icons', 'rc-pagination', 'rc-picker', 'rc-util'],
};


export default nextConfig;
