/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Produce a fully static site in ./out so it can be hosted on any
  // static web loader (Netlify drop, itch.io, GitHub Pages, etc.).
  output: "export",
  images: { unoptimized: true },
  // Use relative asset paths so the export works from any sub-path.
  trailingSlash: true,
};

export default nextConfig;
