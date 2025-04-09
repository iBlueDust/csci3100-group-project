import env, { isDev } from "@/env"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,

  images: {
    remotePatterns: isDev ? [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: `/${env.MINIO_BUCKET_CHAT_ATTACHMENTS}/**`,
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: `/${env.MINIO_BUCKET_MARKET_LISTING_ATTACHMENTS}/**`,
      },
    ] : [],
  }
}

export default nextConfig
