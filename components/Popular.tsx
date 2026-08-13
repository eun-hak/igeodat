import Link from "next/link";
import { getPopular } from "@/lib/db";

/** 인기글(없으면 최신글) 박스. inline=모바일 본문 하단, 아니면 데스크톱 레일용 */
export default async function Popular({ inline }: { inline?: boolean }) {
  const { label, rows } = await getPopular();
  if (!rows.length) return null;
  return (
    <div className={`pop${inline ? " pop-inline" : ""}`}>
      <div className="pop-hd">{label}</div>
      <ol>
        {rows.map((r, i) => (
          <li key={r.id}>
            <Link href={`/q/${r.id}`}>
              <span className="rk">{i + 1}</span>
              <span className="pt">{r.title}</span>
              {typeof r.views === "number" && (
                <span className="pv">{r.views.toLocaleString()}</span>
              )}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
