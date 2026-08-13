"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const THEMES = [
  "생활살림",
  "금융행정",
  "건강의료",
  "음식요리",
  "반려동물",
  "취미문화",
  "교육학습",
  "관계심리",
];

export default function Tabs() {
  const path = decodeURIComponent(usePathname() ?? "/");
  const allOn = path === "/" || path.startsWith("/p/");
  return (
    <nav className="tabs">
      <div className="tabs-in">
        <Link href="/" className={`tab${allOn ? " on" : ""}`}>
          전체
        </Link>
        {THEMES.map((t) => (
          <Link
            key={t}
            href={`/b/${t}`}
            className={`tab${path.startsWith(`/b/${t}`) ? " on" : ""}`}
          >
            {t}
          </Link>
        ))}
      </div>
    </nav>
  );
}
