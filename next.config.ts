import env from "@/env"
import type { NextConfig } from "next"

const matches = /^https?:\/\/([a-zA-Z0-9\._-]*):(\d+)$/.exec(env.MINIO_PUBLIC_ENDPOINT)

const DEFAULT_MINIO_PUBLIC_PORT =
  env.MINIO_PUBLIC_ENDPOINT.startsWith('https') ? '443' : '80'

const MINIO_PUBLIC_HOST = matches ? matches[1] : env.MINIO_PUBLIC_ENDPOINT
const MINIO_PUBLIC_PORT = matches ? matches[2] : DEFAULT_MINIO_PUBLIC_PORT

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,

  images: {
    remotePatterns: [
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
    ],
  }
}

export default nextConfig
