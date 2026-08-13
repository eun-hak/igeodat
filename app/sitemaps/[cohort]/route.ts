import { getCohorts, getSitemapEntries, SITE_URL } from "@/lib/db";

export const revalidate = 3600;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ cohort: string }> }
) {
  const { cohort } = await params;
  if (!/^[a-z0-9-]{1,20}$/.test(cohort)) {
    return new Response("not found", { status: 404 });
  }
  const known = await getCohorts();
  if (!known.includes(cohort)) {
    return new Response("not found", { status: 404 });
  }
  const entries = await getSitemapEntries(cohort);
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries
      .map(
        (e) =>
          `  <url><loc>${SITE_URL}${e.url}</loc><lastmod>${e.published}</lastmod></url>`
      )
      .join("\n") +
    `\n</urlset>\n`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
