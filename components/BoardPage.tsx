import { getBoard, getCount, getViewsMap, PER } from "@/lib/db";
import { BoardList, Pager } from "@/components/Board";
import Popular from "@/components/Popular";

/** 게시판 페이지 공통 골격 (홈=전체, /b/[theme], 페이지네이션 변형 전부) */
export default async function BoardPage({
  theme,
  page,
  hrefBase,
}: {
  theme: string;
  page: number;
  hrefBase: string;
}) {
  const [rows, total] = await Promise.all([
    getBoard(theme, page),
    getCount(theme),
  ]);
  const views = await getViewsMap(rows.map((r) => r.id));
  const pages = Math.max(1, Math.ceil(total / PER));
  return (
    <>
      <div className="bd-head">
        <h1 className="bd-title">{theme} 게시판</h1>
        <span className="bd-cnt">
          전체 <b>{total.toLocaleString()}</b>건
        </span>
      </div>
      <BoardList
        rows={rows}
        views={views}
        showCat={theme === "전체"}
        startNo={total - (page - 1) * PER}
      />
      <Pager page={page} pages={pages} hrefBase={hrefBase} />
      <Popular inline />
    </>
  );
}
