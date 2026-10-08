import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.22.31"],
  typedRoutes: true,
  experimental: {
    typedEnv: true,
  },
}

export default nextConfig
