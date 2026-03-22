import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/dashboard/:path*",
        destination: "/sales-agents/:path*",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/sales-agents/:path*",
        destination: "/dashboard/:path*",
      },
    ];
  },
};

export default nextConfig;
