/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // A partir do Next.js 16, é obrigatório declarar as qualidades de imagem
    // permitidas (medida de segurança contra abuso do Image Optimizer).
    qualities: [75],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cantinhodajogatina.shop',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;
