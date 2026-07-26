/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      // מתעלם משגיאות ESLint בזמן Build ב-Vercel
      ignoreDuringBuilds: true,
    },
  };
  
  export default nextConfig;