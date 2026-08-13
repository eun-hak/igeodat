import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

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

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^\d{1,12}$/.test(id)) {
    return new Response(null, { status: 400 });
  }
  try {
    await doc.send(
      new UpdateCommand({
        TableName: TABLE,
        Key: { PK: `POST#${Number(id)}`, SK: "META" },
        // 존재하는 글에만 — 없는 id 로 쓰레기 아이템이 생기지 않게
        ConditionExpression: "attribute_exists(PK)",
        UpdateExpression: "ADD #v :one",
        ExpressionAttributeNames: { "#v": "views" },
        ExpressionAttributeValues: { ":one": 1 },
      })
    );
  } catch {
    return new Response(null, { status: 404 });
  }
  return new Response(null, { status: 204 });
}
