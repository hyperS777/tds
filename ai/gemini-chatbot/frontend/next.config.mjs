/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  // Generate clean URLs (e.g., /about instead of /about.html)
  trailingSlash: false,
  // Disable image optimization (not available in static export)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
