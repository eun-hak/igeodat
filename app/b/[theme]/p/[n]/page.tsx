import { notFound } from "next/navigation";
import type { Metadata } from "next";
import BoardPage from "@/components/BoardPage";
import { THEMES, MAX_PAGE, SITE_NAME, type Theme } from "@/lib/db";

export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return []; // 빌드는 비우고 첫 요청 시 ISR 로 생성
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ theme: string; n: string }>;
}): Promise<Metadata> {
  const p = await params;
  const theme = decodeURIComponent(p.theme);
  return {
    title: `${theme} 게시판 ${p.n}페이지 | ${SITE_NAME}`,
    robots: { index: false, follow: true },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ theme: string; n: string }>;
}) {
  const p = await params;
  const theme = decodeURIComponent(p.theme);
  const page = Number(p.n);
  if (!THEMES.includes(theme as Theme)) notFound();
  if (!Number.isInteger(page) || page < 2 || page > MAX_PAGE) notFound();
  return <BoardPage theme={theme} page={page} hrefBase={`/b/${theme}`} />;
}
