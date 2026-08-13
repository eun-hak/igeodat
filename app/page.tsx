import type { Metadata } from "next";
import BoardPage from "@/components/BoardPage";
import { SITE_URL, SITE_NAME } from "@/lib/db";

export const revalidate = 86400;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  alternateName: "igeodat",
  url: SITE_URL,
  inLanguage: "ko",
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
      <BoardPage theme="전체" page={1} hrefBase="/" />
    </>
  );
}
