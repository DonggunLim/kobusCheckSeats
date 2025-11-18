import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "고속버스 좌석 체크",
  description: "고속버스 빈 좌석을 확인하는 대시보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
