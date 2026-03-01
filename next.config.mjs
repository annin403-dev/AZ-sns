/** @type {import('next').NextConfig} */
const nextConfig = {
  // プレビュー・開発時の型エラーをスキップ（本番デプロイ前に削除すること）
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
