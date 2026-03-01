import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AZ〜アズ〜 | 自己成長型SNS",
  description:
    "ダラダラ見るだけで、気づいたら自己理解が深まり、目標に近づいているSNS",
  manifest: "/manifest.json",
  themeColor: "#0a0a0f",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-az-bg text-az-text antialiased">{children}</body>
    </html>
  );
}
