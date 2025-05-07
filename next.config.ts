import env from "@/env"
import type { NextConfig } from "next"

const minioPublicUrl = new URL(env.MINIO_PUBLIC_ENDPOINT)

const isHttps = env.MINIO_PUBLIC_ENDPOINT.startsWith('https')
const defaultPort = isHttps ? '443' : '80'

const pathname = /^\/?$/.test(minioPublicUrl.pathname) ? '' : minioPublicUrl.pathname

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  output: 'standalone',

  images: {
    // `domains` field still required despite being reported as deprecated
    domains: [minioPublicUrl.hostname],

    remotePatterns: [
      {
        protocol: isHttps ? 'https' : 'http',
        hostname: minioPublicUrl.hostname,
        port: minioPublicUrl.port || defaultPort,
        pathname: `${pathname}/${env.MINIO_BUCKET_CHAT_ATTACHMENTS}/**`,
      },
      {
        protocol: isHttps ? 'https' : 'http',
        hostname: minioPublicUrl.hostname,
        port: minioPublicUrl.port || defaultPort,
        pathname: `${pathname}/${env.MINIO_BUCKET_MARKET_LISTING_ATTACHMENTS}/**`,
      },
    ],
  }
}

export default nextConfig
