import type { Metadata } from "next";
import "./globals.css";
import "./v2.css";
import "./v3.css";
import "./v4.css";
import "./v5.css";
import "./v6.css";
import "./v7.css";
import "./v8.css";
import "./v9.css";
import "./v10.css";
import "./v11.css";
import "./v12.css";
import "./v13.css";
import "./v14.css";
import "./v15.css";
import "./v16.css";
import "./v17.css";
import "./v18.css";

export const metadata: Metadata = {
  title: "BASELAB — KBO 선수 데이터 분석",
  description: "KBO 공식 기록을 실시간 수집해 선수의 강점과 가치를 분석합니다.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
