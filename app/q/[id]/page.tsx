import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getPost,
  getBoard,
  getViewsMap,
  getTitles,
  SITE_URL,
  SITE_NAME,
} from "@/lib/db";
import { BoardList } from "@/components/Board";
import Popular from "@/components/Popular";
import ViewBeacon from "@/components/ViewBeacon";

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return []; // 빌드는 비우고 첫 요청 시 ISR 로 생성
}

function paras(text: string) {
  return text
    .split("\n\n")
    .map((t) => t.trim())
    .filter(Boolean);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(Number(id));
  if (!post) return {};
  const desc = post.intro.replace(/\s+/g, " ").slice(0, 150);
  return {
    title: post.title, // 이미 "키워드 | 부연" 형식 — 사이트명 안 붙임 (길이 관리)
    description: desc,
    alternates: { canonical: `/q/${post.id}` },
    openGraph: {
      title: post.title,
      description: desc,
      url: `${SITE_URL}/q/${post.id}`,
      siteName: SITE_NAME,
      type: "article",
      publishedTime: post.published,
      images: [`${SITE_URL}/opengraph-image`], // 페이지 메타가 openGraph 를 정의하면 파일 기반 이미지가 안 붙는다 — 명시
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const post = await getPost(id);
  if (!post) notFound();

  const [related, board] = await Promise.all([
    getTitles(post.related ?? []),
    getBoard(post.theme, 1),
  ]);
  const same = board.filter((r) => r.id !== id).slice(0, 8);
  const sameViews = await getViewsMap(same.map((r) => r.id));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.intro.replace(/\s+/g, " ").slice(0, 150),
    inLanguage: "ko",
    datePublished: post.published,
    dateModified: post.published,
    mainEntityOfPage: `${SITE_URL}/q/${post.id}`,
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
  };
  const crumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
      { "@type": "ListItem", position: 2, name: `${post.theme} 게시판`,
        item: `${SITE_URL}/b/${encodeURIComponent(post.theme)}` },
      { "@type": "ListItem", position: 3, name: post.title },
    ],
  };

  return (
    <>
      <ViewBeacon id={id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbLd) }}
      />

      <div className="crumb">
        <a href={`/b/${post.theme}`}>{post.theme} 게시판 ›</a>
      </div>
      <div className="post-hd">
        <h1>{post.title}</h1>
        <div className="post-meta">
          <span>{post.published}</span>
          <span>조회 {(post.views ?? 0).toLocaleString()}</span>
        </div>
      </div>

      <div className="post-body">
        {paras(post.intro).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {post.sections.map((s, i) => (
          <section key={i}>
            <h2>{s.heading}</h2>
            {paras(s.body).map((p, j) => (
              <p key={j}>{p}</p>
            ))}
          </section>
        ))}
      </div>

      {related.length > 0 && (
        <div className="rel">
          <div className="rel-hd">이 글과 함께 본 글</div>
          {related.map((r) => (
            <a key={r.id} href={`/q/${r.id}`}>
              {r.title}
            </a>
          ))}
        </div>
      )}

      <Popular inline />

      <div className="btns">
        <a href={`/b/${post.theme}`} className="btn">
          목록
        </a>
      </div>

      {same.length > 0 && (
        <>
          <div className="sub-hd">
            {post.theme} 게시판의 다른 글<span>최신순</span>
          </div>
          <BoardList
            rows={same}
            views={sameViews}
            showCat={false}
            startNo={same.length}
          />
        </>
      )}
    </>
  );
}
