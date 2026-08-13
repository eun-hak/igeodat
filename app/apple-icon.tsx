import { ImageResponse } from "next/og";

/** iOS 홈화면 아이콘 — 파비콘과 같은 기하 마크 ("이" = ㅇ 주황 닷 + ㅣ 흰 바).
 *  iOS 가 자체 마스크를 씌우므로 풀블리드 사각으로 만든다. 폰트 불필요. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #2C3A5A 0%, #1D2839 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 34,
              background: "#F1502F",
            }}
          />
          <div
            style={{
              width: 25,
              height: 102,
              borderRadius: 13,
              background: "#FFFFFF",
            }}
          />
        </div>
      </div>
    ),
    size
  );
}
