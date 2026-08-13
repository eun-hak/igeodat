import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * 온디맨드 캐시 갱신 — 일일 적재 직후 run_daily.sh 가 호출한다.
 * (목록·사이트맵의 ISR 이 하루 주기라, 새 글 반영은 이 핑이 담당. 몽글 방식 승계)
 *
 * GET /api/revalidate?key=<QUEUE_SECRET>
 *
 * 글 상세(/q/[id])는 건드리지 않는다 — 내용이 안 변하고,
 * 전체 무효화하면 크롤러 재방문마다 ISR 쓰기가 오히려 폭증한다.
 */
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!process.env.QUEUE_SECRET || key !== process.env.QUEUE_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const targets: [string, "page" | "layout" | undefined][] = [
    ["/", "page"],
    ["/p/[n]", "page"],
    ["/b/[theme]", "page"],
    ["/b/[theme]/p/[n]", "page"],
    ["/sitemap.xml", undefined],
    ["/sitemaps/[cohort]", undefined],
  ];
  for (const [path, type] of targets) {
    revalidatePath(path, type);
  }
  return NextResponse.json({
    ok: true,
    revalidated: targets.map(([p]) => p),
    at: new Date(Date.now() + 9 * 3600_000).toISOString().replace("Z", "+09:00"),
  });
}
