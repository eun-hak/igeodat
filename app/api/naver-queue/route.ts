import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  DeleteCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { SITE_URL } from "@/lib/db";

/**
 * 네이버 수집요청용 URL 큐 — 외부 제출 서버가 매일 가져가는 엔드포인트.
 * (몽글 dream-site 의 naver-queue 프로토콜 승계. 내부는 전용 큐 파티션 사용 —
 *  이거닷은 POST# 가 분산 키라 몽글처럼 전량 스캔할 수 없다)
 *
 * GET /api/naver-queue?key=<QUEUE_SECRET>&limit=50
 *   → 발행일 오래된 순 50개 반환 + 큐에서 제거(SUBMITTED 로 이동)
 *
 * 옵션:
 *   &dryrun=1            소비 없이 미리보기
 *   &resend=YYYY-MM-DD   그날 내준 배치 재반환 (제출 서버 장애 복구용, 소비 없음)
 *   &format=json         기본 text(줄당 URL 1개) 대신 JSON
 *
 * DynamoDB:
 *   QUEUE#naver      SK=<발행일>#<id>   미제출 큐 (로더가 신규 글마다 추가)
 *   SUBMITTED#naver  SK=<제출일>#<id>   제출 이력 (resend·감사용, queuedSk 보존)
 */

const TABLE = process.env.DDB_TABLE ?? "content";
const doc = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region:
      process.env.APP_AWS_REGION ?? process.env.AWS_REGION ?? "ap-northeast-2",
    credentials: {
      accessKeyId:
        process.env.APP_AWS_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey:
        process.env.APP_AWS_SECRET_ACCESS_KEY ??
        process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })
);

export const dynamic = "force-dynamic"; // 매 호출이 실제 큐 소비 — 캐시 금지

async function queueCount(): Promise<number> {
  let n = 0;
  let lek: Record<string, unknown> | undefined;
  do {
    const r = await doc.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: { ":pk": "QUEUE#naver" },
        Select: "COUNT",
        ExclusiveStartKey: lek,
      })
    );
    n += r.Count ?? 0;
    lek = r.LastEvaluatedKey as typeof lek;
  } while (lek);
  return n;
}

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  if (!process.env.QUEUE_SECRET || p.get("key") !== process.env.QUEUE_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const limit = Math.min(parseInt(p.get("limit") ?? "50", 10) || 50, 200);
  const dryrun = p.get("dryrun") === "1";
  const resend = p.get("resend");
  const today = new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10); // KST

  let urls: string[];
  let remaining: number;

  if (resend) {
    // 그날 내준 배치 재반환 — 소비 없음
    const r = await doc.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :d)",
        ExpressionAttributeValues: { ":pk": "SUBMITTED#naver", ":d": `${resend}#` },
      })
    );
    urls = (r.Items ?? []).map((it) => `${SITE_URL}${it.url}`);
    remaining = await queueCount();
  } else {
    const r = await doc.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: { ":pk": "QUEUE#naver" },
        ScanIndexForward: true, // 발행일 오래된 순
        Limit: limit,
      })
    );
    const batch = r.Items ?? [];
    if (!dryrun) {
      for (const it of batch) {
        const id = Number(it.id);
        await doc.send(
          new PutCommand({
            TableName: TABLE,
            Item: {
              PK: "SUBMITTED#naver",
              SK: `${today}#${String(id).padStart(8, "0")}`,
              id,
              url: it.url,
              queuedSk: it.SK, // 복원 시 원래 큐 위치
            },
          })
        );
        await doc.send(
          new DeleteCommand({
            TableName: TABLE,
            Key: { PK: "QUEUE#naver", SK: it.SK as string },
          })
        );
      }
    }
    urls = batch.map((it) => `${SITE_URL}${it.url}`);
    remaining = (await queueCount());
  }

  if (p.get("format") === "json") {
    return NextResponse.json({ ok: true, date: today, count: urls.length, remaining, urls });
  }
  return new Response(urls.length ? urls.join("\n") + "\n" : "", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Queue-Remaining": String(remaining),
    },
  });
}
