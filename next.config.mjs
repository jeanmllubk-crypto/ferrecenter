/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite compilar en otra carpeta para probar sin detener "npm run dev"
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: { formats: ["image/avif", "image/webp"] },
};
export default nextConfig;
