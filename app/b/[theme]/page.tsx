import { notFound } from "next/navigation";
import type { Metadata } from "next";
import BoardPage from "@/components/BoardPage";
import { THEMES, SITE_NAME, type Theme } from "@/lib/db";

export const revalidate = 600;

export function generateStaticParams() {
  return THEMES.map((t) => ({ theme: t }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ theme: string }>;
}): Promise<Metadata> {
  const theme = decodeURIComponent((await params).theme);
  return {
    title: `${theme} 게시판 | ${SITE_NAME}`,
    description: `${theme} 관련 질문과 답 모음 — ${SITE_NAME}`,
    alternates: { canonical: `/b/${theme}` },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ theme: string }>;
}) {
  const theme = decodeURIComponent((await params).theme);
  if (!THEMES.includes(theme as Theme)) notFound();
  return <BoardPage theme={theme} page={1} hrefBase={`/b/${theme}`} />;
}
