import { getCohorts, SITE_URL } from "@/lib/db";

export const revalidate = 3600;

/** 사이트맵 인덱스 — 코호트(주차)별 분할이 곧 색인 계측 단위다 */
export async function GET() {
  const cohorts = await getCohorts();
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    cohorts
      .map(
        (c) =>
          `  <sitemap><loc>${SITE_URL}/sitemaps/${c}</loc></sitemap>`
      )
      .join("\n") +
    `\n</sitemapindex>\n`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
