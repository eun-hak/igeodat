import { ImageResponse } from "next/og";
import { loadOgFont, OG_SIZE } from "./_og/font";

/** OG 이미지 — 워드마크의 "이"를 브랜드 마크(ㅇ 주황 닷 + ㅣ 흰 바)로 치환한 락업 */
export const alt = "이거닷 — 찾던 답, 이거닷";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OgImage() {
  const font = await loadOgFont();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #2C3A5A 0%, #1D2839 100%)",
          fontFamily: "Pretendard",
        }}
      >
        {/* 락업: [ㅇ][ㅣ] 거닷 [.] */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 92,
              height: 92,
              borderRadius: 46,
              background: "#F1502F",
            }}
          />
          <div
            style={{
              width: 33,
              height: 136,
              borderRadius: 17,
              background: "#FFFFFF",
              marginLeft: 20,
            }}
          />
          <div
            style={{
              fontSize: 150,
              fontWeight: 700,
              color: "#FFFFFF",
              letterSpacing: -5,
              marginLeft: 26,
            }}
          >
            거닷
          </div>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              background: "#F1502F",
              alignSelf: "flex-end",
              marginLeft: 12,
              marginBottom: 30,
            }}
          />
        </div>

        <div style={{ marginTop: 34, fontSize: 42, color: "#AEB8CC" }}>
          찾던 답, 이거닷
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 42,
            fontSize: 25,
            color: "#7C89A6",
          }}
        >
          igeodat.plentyer.com
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Pretendard", data: font, weight: 700 }],
    }
  );
}
