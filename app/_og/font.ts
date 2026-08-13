import { readFile } from "node:fs/promises";
import path from "node:path";

/** OG 이미지용 한글 폰트 (Pretendard Bold, assets/fonts 에 번들)
 *  next.config 의 outputFileTracingIncludes 로 배포에 포함됨 */
export async function loadOgFont(): Promise<ArrayBuffer> {
  const p = path.join(process.cwd(), "assets", "fonts", "Pretendard-Bold.otf");
  const buf = await readFile(p);
  return buf.buffer.slice(
    buf.byteOffset,
    buf.byteOffset + buf.byteLength
  ) as ArrayBuffer;
}

export const OG_SIZE = { width: 1200, height: 630 };
