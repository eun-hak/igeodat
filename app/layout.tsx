import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";
import Tabs from "@/components/Tabs";
import Popular from "@/components/Popular";
import { SITE_URL, SITE_NAME } from "@/lib/db";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — 찾던 답, 이거닷`, template: "%s" },
  description:
    "생활·금융·건강·요리·반려동물… 궁금한 것의 답을 찾는 곳, 이거닷.",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE_NAME,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
  },
  verification: {
    google: "nGLC6wqeingyxdWpDtTR9DKlBw7TNDT9A8_l8PrHWt0",
    other: {
      "naver-site-verification": "830b16c25563cd787196e9decf07e0d338c37b92",
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#26324E",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-CK3XP4X451"
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-CK3XP4X451');
        `}</Script>
        <header className="hd">
          <div className="hd-in">
            <Link href="/" className="logo">
              <svg className="logo-mark" viewBox="0 0 64 64" aria-hidden="true">
                <circle cx="24.5" cy="33" r="12" fill="#F1502F" />
                <rect x="42" y="15" width="9" height="36" rx="4.5" fill="#FFFFFF" />
              </svg>
              이거닷<span className="dot">.</span>
            </Link>
            <span className="slogan">찾던 답, 이거닷</span>
          </div>
          <Tabs />
        </header>

        <div className="wrap">
          <div className="cols">
            <main>{children}</main>
            <aside className="rail">
              <Popular />
            </aside>
          </div>
        </div>

        <footer className="ft">
          <nav className="ft-nav">
            <Link href="/about">소개</Link>
            <Link href="/terms">이용약관</Link>
            <Link href="/privacy">개인정보처리방침</Link>
          </nav>
          <b>{SITE_NAME}</b> · 본 콘텐츠는 AI의 도움을 받아 작성된 참고용
          정보입니다. 의료·법률·금융 관련 결정은 반드시 전문가와 상의하세요.
        </footer>
      </body>
    </html>
  );
}
