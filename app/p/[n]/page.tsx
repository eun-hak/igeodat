import { notFound } from "next/navigation";
import type { Metadata } from "next";
import BoardPage from "@/components/BoardPage";
import { MAX_PAGE } from "@/lib/db";

export const revalidate = 600;
export const dynamicParams = true;

export function generateStaticParams() {
  return []; // 빌드는 비우고 첫 요청 시 ISR 로 생성
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ n: string }>;
}): Promise<Metadata> {
  const { n } = await params;
  return {
    title: `전체 게시판 ${n}페이지 | 이거닷`,
    robots: { index: false, follow: true }, // 페이지네이션은 색인 제외, 링크만 따라가게
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  const { n } = await params;
  const page = Number(n);
  if (!Number.isInteger(page) || page < 2 || page > MAX_PAGE) notFound();
  return <BoardPage theme="전체" page={page} hrefBase="/" />;
}
