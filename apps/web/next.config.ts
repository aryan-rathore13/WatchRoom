import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@watchroom/types"],
};

export default nextConfig;
