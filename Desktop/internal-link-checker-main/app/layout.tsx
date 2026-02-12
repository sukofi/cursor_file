import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export const metadata: Metadata = {
  title: {
    default: "内部リンクマトリクス",
    template: "%s | 内部リンクマトリクス",
  },
  description:
    "ブログ・メディアの記事間の内部リンクをスプレッドシートと連携してマトリクス形式で可視化。どの記事がどこにリンクしているか一覧で把握できます。",
  keywords: ["内部リンク", "SEO", "ブログ", "メディア", "可視化", "マトリクス"],
  authors: [{ name: "内部リンクマトリクス" }],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: siteUrl,
    siteName: "内部リンクマトリクス",
    title: "内部リンクマトリクス",
    description:
      "ブログ・メディアの記事間の内部リンクをマトリクス形式で可視化。スプレッドシート連携で手軽に分析。",
  },
  twitter: {
    card: "summary_large_image",
    title: "内部リンクマトリクス",
    description: "記事間の内部リンクをマトリクス形式で可視化",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
