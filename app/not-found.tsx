import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ padding: "60px 16px", textAlign: "center" }}>
      <h1 style={{ fontSize: 20, fontWeight: 800 }}>페이지가 없습니다</h1>
      <p style={{ color: "var(--soft)", fontSize: 14 }}>
        주소가 바뀌었거나 삭제된 글입니다.
      </p>
      <p style={{ marginTop: 24 }}>
        <Link href="/" className="btn">
          전체 게시판으로
        </Link>
      </p>
    </div>
  );
}
