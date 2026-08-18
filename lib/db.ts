import { cache } from "react";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  BatchGetCommand,
} from "@aws-sdk/lib-dynamodb";

/* ---------- 상수 ---------- */

export const SITE_URL = "https://igeodat.plentyer.com";
export const SITE_NAME = "이거닷";
export const PER = 25; // 목록 페이지당 행 수
export const MAX_PAGE = 100; // Limit=page*PER 방식이라 상한을 둔다 (100p = 조회 2,500행, ISR 하루 캐시라 부담 없음)

export const THEMES = [
  "생활살림",
  "금융행정",
  "건강의료",
  "음식요리",
  "반려동물",
  "취미문화",
  "교육학습",
  "관계심리",
] as const;
export type Theme = (typeof THEMES)[number];

/* ---------- DynamoDB ----------
 * 테이블 content 를 몽글과 공유한다. PK 접두사로 분리:
 *   POST#<id>/META  본문 · FEED/<date>#<id> 전체목록 · THEME#<t>/<date>#<id> 게시판
 *   SITEMAP#<cohort>/POST#<id> 계측 코호트 · THEME#<t>/#META 카운터
 * Vercel 이 AWS_* 환경변수를 예약하므로 APP_AWS_* 를 우선 읽는다 (dream-site 와 동일 패턴).
 */

const TABLE = process.env.DDB_TABLE ?? "content";
const client = new DynamoDBClient({
  region: process.env.APP_AWS_REGION ?? process.env.AWS_REGION ?? "ap-northeast-2",
  credentials:
    (process.env.APP_AWS_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID)
      ? {
          accessKeyId:
            process.env.APP_AWS_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey:
            process.env.APP_AWS_SECRET_ACCESS_KEY ??
            process.env.AWS_SECRET_ACCESS_KEY!,
        }
      : undefined,
});
const doc = DynamoDBDocumentClient.from(client);

/* ---------- 타입 ---------- */

export interface Section {
  heading: string;
  body: string;
}

export interface Post {
  id: number;
  title: string;
  question: string;
  intro: string;
  sections: Section[];
  related: number[];
  head: string;
  theme: Theme;
  created: string; // 생성일 YYYY-MM-DD
  published: string; // 발행일
  views?: number;
}

export interface Row {
  id: number;
  title: string;
  theme?: string; // 전체 목록에서만 표기
  date: string; // MM.DD
  isNew: boolean;
}

/* ---------- 유틸 ---------- */

function todayKST(): string {
  return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
}

function toRow(it: Record<string, unknown>, withTheme: boolean): Row {
  const sk = String(it.SK); // "2026-08-13#00048219"
  const d = sk.slice(0, 10);
  return {
    id: Number(it.id),
    title: String(it.title),
    theme: withTheme ? String(it.theme) : undefined,
    date: d.slice(5).replace("-", "."),
    isNew: d === todayKST(),
  };
}

/* ---------- 조회 ---------- */

export const getPost = cache(async (id: number): Promise<Post | null> => {
  const r = await doc.send(
    new GetCommand({ TableName: TABLE, Key: { PK: `POST#${id}`, SK: "META" } })
  );
  return (r.Item as Post | undefined) ?? null;
});

/** 게시판 목록. theme='전체' 는 FEED 파티션. */
export const getBoard = cache(
  async (theme: string, page: number): Promise<Row[]> => {
    const p = Math.min(Math.max(1, page), MAX_PAGE);
    const pk = theme === "전체" ? "FEED" : `THEME#${theme}`;
    const r = await doc.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: { ":pk": pk },
        ScanIndexForward: false,
        Limit: p * PER + 1, // '#META' 카운터가 내림차순 끝에 섞일 수 있어 +1
      })
    );
    const items = (r.Items ?? []).filter((it) => it.SK !== "#META");
    return items.slice((p - 1) * PER, p * PER).map((it) => toRow(it, theme === "전체"));
  }
);

/** 게시판 글 수 (적재기가 유지하는 카운터) */
export const getCount = cache(async (theme: string): Promise<number> => {
  if (theme === "전체") {
    const counts = await Promise.all(THEMES.map((t) => getCount(t)));
    return counts.reduce((a, b) => a + b, 0);
  }
  const r = await doc.send(
    new GetCommand({
      TableName: TABLE,
      Key: { PK: `THEME#${theme}`, SK: "#META" },
    })
  );
  return Number(r.Item?.count ?? 0);
});

/** 여러 글의 조회수 (목록 표시용) */
export const getViewsMap = cache(
  async (ids: number[]): Promise<Map<number, number>> => {
    const map = new Map<number, number>();
    if (!ids.length) return map;
    let keys = ids.map((i) => ({ PK: `POST#${i}`, SK: "META" }));
    while (keys.length) {
      const r = await doc.send(
        new BatchGetCommand({
          RequestItems: {
            [TABLE]: {
              Keys: keys.slice(0, 100),
              ProjectionExpression: "id, #v",
              ExpressionAttributeNames: { "#v": "views" },
            },
          },
        })
      );
      for (const it of r.Responses?.[TABLE] ?? []) {
        map.set(Number(it.id), Number(it.views ?? 0));
      }
      const un = r.UnprocessedKeys?.[TABLE]?.Keys ?? [];
      keys = [...un, ...keys.slice(100)] as typeof keys;
      if (un.length && keys.length === un.length) break; // 무한루프 방지
    }
    return map;
  }
);

/** 연관질문 제목 */
export const getTitles = cache(
  async (ids: number[]): Promise<{ id: number; title: string }[]> => {
    if (!ids.length) return [];
    const r = await doc.send(
      new BatchGetCommand({
        RequestItems: {
          [TABLE]: {
            Keys: ids.map((i) => ({ PK: `POST#${i}`, SK: "META" })),
            ProjectionExpression: "id, title",
          },
        },
      })
    );
    const found = new Map(
      (r.Responses?.[TABLE] ?? []).map((it) => [Number(it.id), String(it.title)])
    );
    return ids
      .filter((i) => found.has(i))
      .map((i) => ({ id: i, title: found.get(i)! }));
  }
);

/** RSS용 최신 글 — FEED 인덱스에서 발행일 내림차순 n개 (제목·테마·발행일만) */
export const getFeedLatest = cache(
  async (
    n: number
  ): Promise<{ id: number; title: string; theme: string; published: string }[]> => {
    const r = await doc.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: { ":pk": "FEED" },
        ScanIndexForward: false,
        Limit: n + 1, // '#META' 카운터가 섞일 수 있어 +1
      })
    );
    return (r.Items ?? [])
      .filter((it) => it.SK !== "#META")
      .slice(0, n)
      .map((it) => ({
        id: Number(it.id),
        title: String(it.title),
        theme: String(it.theme ?? ""),
        published: String(it.SK).slice(0, 10), // SK = "<발행일>#<id08>"
      }));
  }
);

/** 레일/하단 인기글: POPULAR 아이템이 있으면 그걸, 없으면 최신 글 (조작 금지 원칙) */
export const getPopular = cache(
  async (): Promise<{ label: string; rows: { id: number; title: string; views?: number }[] }> => {
    const r = await doc.send(
      new GetCommand({
        TableName: TABLE,
        Key: { PK: "SITE#igeodat", SK: "POPULAR" },
      })
    );
    const rows = r.Item?.rows as
      | { id: number; title: string; views: number }[]
      | undefined;
    if (rows?.length) return { label: "많이 본 글", rows: rows.slice(0, 10) };
    const latest = await getBoard("전체", 1);
    return { label: "최신 글", rows: latest.slice(0, 10) };
  }
);

/* ---------- 사이트맵 ---------- */

export const getCohorts = cache(async (): Promise<string[]> => {
  const r = await doc.send(
    new GetCommand({
      TableName: TABLE,
      Key: { PK: "SITE#igeodat", SK: "COHORTS" },
    })
  );
  return (r.Item?.list as string[] | undefined) ?? [];
});

export async function getSitemapEntries(
  cohort: string
): Promise<{ url: string; published: string }[]> {
  const out: { url: string; published: string }[] = [];
  let start: Record<string, unknown> | undefined;
  do {
    const r = await doc.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: { ":pk": `SITEMAP#${cohort}` },
        ExclusiveStartKey: start,
      })
    );
    for (const it of r.Items ?? []) {
      out.push({ url: String(it.url), published: String(it.published) });
    }
    start = r.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (start);
  return out;
}
