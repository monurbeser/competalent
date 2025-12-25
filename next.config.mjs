/** @type {import('next').NextConfig} */
const nextConfig = {
    // PDF parser gibi sunucu kütüphanelerini 'bundle' işleminden hariç tutuyoruz
    serverExternalPackages: ["pdf-parse"],
    // Hata ayıklamayı kolaylaştıran deneysel özellikler
    experimental: {
      serverActions: {
        bodySizeLimit: '4mb',
      },
    },
};

export default nextConfig;