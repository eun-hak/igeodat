import Link from "next/link";
import { MAX_PAGE, type Row } from "@/lib/db";

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

/** 페이지네이션 — 블록 방식 (게시판 문법).
 *  숫자 5개 + ‹ › 블록 이동이라 모바일 360px 에서도 안 넘치고,
 *  › 로 6~10, 11~15 … 끝 페이지까지 갈 수 있다. */
const BLOCK = 5;

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
  const total = Math.min(pages, MAX_PAGE);
  if (total <= 1) return null;
  const start = Math.floor((page - 1) / BLOCK) * BLOCK + 1;
  const end = Math.min(start + BLOCK - 1, total);
  const href = (p: number) => (p === 1 ? hrefBase : `${base}/p/${p}`);
  return (
    <nav className="pager" aria-label="페이지 이동">
      {start > 1 && (
        <Link href={href(start - 1)} className="pg pg-nav" aria-label="이전 페이지 묶음">
          ‹
        </Link>
      )}
      {Array.from({ length: end - start + 1 }, (_, k) => start + k).map((p) => (
        <Link key={p} href={href(p)} className={`pg${p === page ? " on" : ""}`}>
          {p}
        </Link>
      ))}
      {end < total && (
        <Link href={href(end + 1)} className="pg pg-nav" aria-label="다음 페이지 묶음">
          ›
        </Link>
      )}
    </nav>
  );
}
