import Link from "next/link";
import type { Row } from "@/lib/db";

const HOT = 1500;

/** 게시판 목록 — 모바일 2줄 리스트, 데스크톱에서 grid 로 표처럼 전개 */
export function BoardList({
  rows,
  views,
  showCat,
  startNo,
}: {
  rows: Row[];
  views: Map<number, number>;
  showCat: boolean;
  startNo: number;
}) {
  return (
    <div className="brd">
      <div className={`brd-cols${showCat ? " has-cat" : ""}`}>
        <span>번호</span>
        {showCat && <span>분류</span>}
        <span className="th-tit">제목</span>
        <span>조회</span>
        <span>날짜</span>
      </div>
      {rows.map((r, i) => {
        const v = views.get(r.id) ?? 0;
        return (
          <Link
            key={r.id}
            href={`/q/${r.id}`}
            className={`row${showCat ? " has-cat" : ""}`}
          >
            <span className="no">{startNo - i}</span>
            {showCat && <span className="cat">[{r.theme}]</span>}
            <span className="tit">
              {r.title}
              {r.isNew && <span className="nb">N</span>}
            </span>
            <span className="sub">
              <span className={`hit${v >= HOT ? " hot" : ""}`}>
                {v.toLocaleString()}
              </span>
              <span className="date">{r.date}</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/** 페이지네이션 — 경로 기반 (ISR 친화) */
export function Pager({
  page,
  pages,
  hrefBase,
}: {
  page: number;
  pages: number;
  /** 1페이지 경로. 2페이지부터는 `${hrefBase (='/'이면 '')}/p/N` */
  hrefBase: string;
}) {
  const base = hrefBase === "/" ? "" : hrefBase;
  const n = Math.min(pages, 10);
  if (n <= 1) return null;
  return (
    <div className="pager">
      {Array.from({ length: n }, (_, k) => k + 1).map((p) => (
        <Link
          key={p}
          href={p === 1 ? hrefBase : `${base}/p/${p}`}
          className={`pg${p === page ? " on" : ""}`}
        >
          {p}
        </Link>
      ))}
    </div>
  );
}
