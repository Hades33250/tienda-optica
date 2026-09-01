import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "optica-wordpress.b5pi7l.easypanel.host",
      },
    ],
  },
};

export default nextConfig;
