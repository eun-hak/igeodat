import { getFeedLatest, SITE_URL, SITE_NAME } from "@/lib/db";

/** 네이버 서치어드바이저 RSS 제출용 피드 — 최신 100편.
 *  하루 주기 ISR + 적재 직후 /api/revalidate 핑으로 갱신 (몽글 방식 승계) */
export const revalidate = 86400;

function esc(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function GET() {
  const posts = await getFeedLatest(100);

  const items = posts
    .map((p) => {
      const url = `${SITE_URL}/q/${p.id}`;
      return `<item>
<title>${esc(p.title)}</title>
<link>${url}</link>
<guid isPermaLink="true">${url}</guid>
<pubDate>${new Date(p.published + "T06:00:00+09:00").toUTCString()}</pubDate>
<category>${esc(p.theme)}</category>
</item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>${SITE_NAME} — 생활 속 질문 사전</title>
<link>${SITE_URL}</link>
<description>사람들이 실제로 검색한 질문에 대한 답을 게시판 형태로 정리하는 정보 사이트</description>
<language>ko</language>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
