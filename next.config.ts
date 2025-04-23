import env, { isDev } from "@/env"
import type { NextConfig } from "next"

const matches = /^https?:\/\/([a-zA-Z0-9\._-]*):(\d+)$/.exec(env.MINIO_PUBLIC_ENDPOINT)

const MINIO_PUBLIC_HOST = matches ? matches[1] : env.MINIO_PUBLIC_ENDPOINT
const MINIO_PUBLIC_PORT = matches ? matches[2] : '80'

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,

  images: {
    remotePatterns: isDev ? [
      {
        protocol: 'http',
        hostname: MINIO_PUBLIC_HOST,
        port: MINIO_PUBLIC_PORT,
        pathname: `/${env.MINIO_BUCKET_CHAT_ATTACHMENTS}/**`,
      },
      {
        protocol: 'http',
        hostname: MINIO_PUBLIC_HOST,
        port: MINIO_PUBLIC_PORT,
        pathname: `/${env.MINIO_BUCKET_MARKET_LISTING_ATTACHMENTS}/**`,
      },
    ] : [],
  }
}

export default nextConfig
