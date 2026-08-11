import type { NextConfig } from "next";
import { ALLOWED_IMAGE_HOSTS } from "./utils/imageConfig";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: ALLOWED_IMAGE_HOSTS.map((hostname) => ({
      protocol: "https",
      hostname,
    })),
  },
  async redirects() {
    return [
      {
        source: '/men/t-shirts',
        destination: '/men/top-wear/t-shirts',
        permanent: true,
      },
      {
        source: '/men/jeans',
        destination: '/men/bottom-wear/jeans',
        permanent: true,
      },
      {
        source: '/men/clothing/:path*',
        destination: '/men/:path*',
        permanent: true,
      },
      {
        source: '/women/clothing/:path*',
        destination: '/women/:path*',
        permanent: true,
      },
      {
        source: '/kids/clothing/:path*',
        destination: '/kids/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
