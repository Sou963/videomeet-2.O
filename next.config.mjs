/** @type {import('next').NextConfig} */
const configuredApi = new URL(
  process.env.API_PROXY_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api"
);
const apiPath = configuredApi.pathname.replace(/\/+$/, "");
const apiBase = `${configuredApi.origin}${apiPath.endsWith("/api") ? apiPath : `${apiPath}/api`}`;

const nextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiBase}/:path*`,
      },
    ];
  },
};

export default nextConfig;
